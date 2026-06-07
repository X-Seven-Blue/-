const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

function ok(data = {}, message = 'ok') {
  return { success: true, data, message }
}

function fail(code, message, data) {
  const res = { success: false, code, message }
  if (data !== undefined) res.data = data
  return res
}

function uniqBy(items, key) {
  const seen = {}
  return items.filter((item) => {
    const value = item && item[key]
    if (!value || seen[value]) return false
    seen[value] = true
    return true
  })
}

function ownerQueries(openid, userId, extra = {}) {
  const list = [{ openid }]
  if (userId) list.push({ userId })
  return list.map((owner) => ({ ...owner, ...extra }))
}

async function firstByOwner(collectionName, openid, userId, extra = {}) {
  const collection = db.collection(collectionName)
  for (const query of ownerQueries(openid, userId, extra)) {
    const res = await collection.where(query).limit(1).get()
    if (res.data.length) return res.data[0]
  }
  return null
}

async function findUser(openid) {
  return firstByOwner('users', openid, '', {})
}

async function findAssets(openid, userId) {
  return firstByOwner('user_assets', openid, userId, {})
}

async function findCurrentCat(openid, userId) {
  const cats = db.collection('cats')
  const rules = [
    { isCurrent: true },
    { current: true },
    { status: 'active' },
    { status: 'current' },
    { status: 'normal' }
  ]
  for (const rule of rules) {
    const cat = await firstByOwner('cats', openid, userId, rule)
    if (cat) return cat
  }
  for (const query of ownerQueries(openid, userId, {})) {
    const res = await cats.where(query).orderBy('createdAt', 'desc').limit(1).get()
    if (res.data.length) return res.data[0]
  }
  return null
}

async function countCompletedVideos(openid, userId) {
  const rows = []
  for (const query of ownerQueries(openid, userId, { completed: true })) {
    const res = await db.collection('watch_progress').where(query).limit(1000).get()
    rows.push(...res.data)
  }
  return uniqBy(rows, 'videoId').length
}

function getBalance(assets) {
  return Number(assets && (assets.cans !== undefined ? assets.cans : assets.canBalance !== undefined ? assets.canBalance : assets.balance || 0)) || 0
}

function calculateCatState({ cat, assets, completedVideoCount, preferredMood }) {
  const intimacy = Number(cat && cat.intimacy || 0)
  const balance = getBalance(assets)
  const canHarvest = intimacy >= 10 && Number(completedVideoCount || 0) >= 3
  let mood = preferredMood || (cat && cat.mood) || 'normal'
  if (canHarvest) mood = 'canHarvest'
  else if (balance <= 0 && mood === 'normal') mood = 'hungry'
  return { intimacy, mood, canHarvest, balance }
}

async function requireContext() {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { error: fail('UNAUTHENTICATED', '无法获取当前用户身份') }
  const user = await findUser(OPENID)
  if (!user) return { error: fail('USER_NOT_FOUND', '用户不存在，请先调用 login 或 initUserData') }
  const userId = user.userId || user._id || OPENID
  return { openid: OPENID, user, userId }
}
exports.main = async (event = {}) => {
  try {
    const ctx = await requireContext()
    if (ctx.error) return ctx.error
    const { openid, userId } = ctx
    const cat = await findCurrentCat(openid, userId)
    if (!cat) return fail('CAT_NOT_FOUND', '当前小猫不存在')

    const requestId = typeof event.requestId === 'string' ? event.requestId : ''
    if (requestId) {
      const existed = await firstByOwner('cat_interactions', openid, userId, { type: 'pet', requestId })
      if (existed) {
        const latestCat = await db.collection('cats').doc(cat._id).get()
        const assets = await findAssets(openid, userId)
        const completedVideoCount = await countCompletedVideos(openid, userId)
        const state = calculateCatState({ cat: latestCat.data, assets, completedVideoCount, preferredMood: latestCat.data.mood })
        return ok({ catId: latestCat.data.catId || latestCat.data._id, ...state, completedVideoCount, message: '摸猫成功' })
      }
    }

    const beforeIntimacy = Number(cat.intimacy || 0)
    const afterIntimacy = beforeIntimacy + 1
    const completedVideoCount = await countCompletedVideos(openid, userId)
    const assets = await findAssets(openid, userId)
    const state = calculateCatState({ cat: { ...cat, intimacy: afterIntimacy, mood: 'happy' }, assets, completedVideoCount, preferredMood: 'happy' })

    await db.collection('cats').doc(cat._id).update({
      data: { intimacy: _.inc(1), mood: state.mood, canHarvest: state.canHarvest, updatedAt: db.serverDate() }
    })
    await db.collection('cat_interactions').add({
      data: {
        openid,
        userId,
        catId: cat.catId || cat._id,
        type: 'pet',
        requestId,
        deltaIntimacy: 1,
        beforeIntimacy,
        afterIntimacy,
        createdAt: db.serverDate()
      }
    })

    return ok({ catId: cat.catId || cat._id, ...state, completedVideoCount, message: '摸猫成功' })
  } catch (error) {
    console.error('[petCat] failed:', error)
    return fail('INTERNAL_ERROR', error.message || '摸猫失败')
  }
}

