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
const BREEDS = ['orange', 'calico', 'white', 'black']

function nextBreed() {
  return BREEDS[Math.floor(Math.random() * BREEDS.length)]
}

exports.main = async () => {
  try {
    const ctx = await requireContext()
    if (ctx.error) return ctx.error
    const { openid, userId } = ctx
    const cat = await findCurrentCat(openid, userId)
    if (!cat) return fail('CAT_NOT_FOUND', '当前小猫不存在')
    if (cat.status === 'harvested') return fail('ALREADY_HARVESTED', '当前小猫已收获')

    const assets = await findAssets(openid, userId)
    const completedVideoCount = await countCompletedVideos(openid, userId)
    const state = calculateCatState({ cat, assets, completedVideoCount })
    if (!state.canHarvest) {
      return fail('HARVEST_CONDITION_NOT_MET', '收获条件未满足', {
        requiredIntimacy: 10,
        currentIntimacy: state.intimacy,
        requiredCompletedVideos: 3,
        currentCompletedVideos: completedVideoCount
      })
    }

    const oldCatId = cat.catId || cat._id
    await db.collection('cats').doc(cat._id).update({
      data: { status: 'harvested', isCurrent: false, canHarvest: false, harvestedAt: db.serverDate(), updatedAt: db.serverDate() }
    })

    const newCat = {
      openid,
      userId,
      catId: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: '橘子',
      breed: nextBreed(),
      level: 1,
      exp: 0,
      intimacy: 0,
      mood: 'normal',
      hunger: 0,
      canHarvest: false,
      outfit: { current: 'default', owned: ['default'] },
      status: 'active',
      isCurrent: true,
      previousCatId: oldCatId,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
    const created = await db.collection('cats').add({ data: newCat })
    const payload = { _id: created._id, ...newCat }

    return ok({ oldCatId, newCat: payload, message: '收获成功，获得新小猫' })
  } catch (error) {
    console.error('[harvestCat] failed:', error)
    return fail('INTERNAL_ERROR', error.message || '收获失败')
  }
}

