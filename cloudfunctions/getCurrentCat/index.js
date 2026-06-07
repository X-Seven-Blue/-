const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function requestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function ok(data = {}, rid = requestId()) {
  return { success: true, data, requestId: rid, serverTime: Date.now() }
}

function fail(code, message, rid = requestId()) {
  return { success: false, error: { code, message }, requestId: rid, serverTime: Date.now() }
}

async function findByOwner(collectionName, openid, userId, extra = {}) {
  const collection = db.collection(collectionName)
  const ownerQueries = [{ openid }]
  if (userId) ownerQueries.push({ userId })

  for (const owner of ownerQueries) {
    const res = await collection.where({ ...owner, ...extra }).limit(1).get()
    if (res.data.length) return res.data[0]
  }

  return null
}

async function findUser(openid) {
  return findByOwner('users', openid, '')
}

async function countCompletedVideos(openid) {
  const res = await db.collection('watch_progress').where({ openid, completed: true }).limit(1000).get()
  const seen = {}
  res.data.forEach((row) => {
    if (row.videoId) seen[row.videoId] = true
  })
  return Object.keys(seen).length
}

function calculateCatState({ cat, canBalance, completedVideoCount }) {
  const intimacy = Number(cat.intimacy || 0)
  const canHarvest = intimacy >= 10 && Number(completedVideoCount || 0) >= 3
  let mood = cat.mood || 'normal'
  if (canHarvest) mood = 'canHarvest'
  else if (Number(canBalance || 0) <= 0 && mood === 'normal') mood = 'hungry'
  return { intimacy, mood, canHarvest }
}

async function findCurrentCat(openid, userId) {
  const preferred = [
    { isCurrent: true },
    { current: true },
    { status: 'current' },
    { status: 'normal' }
  ]

  for (const rule of preferred) {
    const cat = await findByOwner('cats', openid, userId, rule)
    if (cat) return cat
  }

  const cats = db.collection('cats')
  const ownerQueries = [{ openid }]
  if (userId) ownerQueries.push({ userId })

  for (const owner of ownerQueries) {
    const res = await cats.where(owner).orderBy('createdAt', 'desc').limit(1).get()
    if (res.data.length) return res.data[0]
  }

  return null
}

function normalizeOutfit(outfit) {
  if (!outfit) return { hat: null, clothes: null, accessory: null }
  if (outfit.hat !== undefined || outfit.clothes !== undefined || outfit.accessory !== undefined) {
    return {
      hat: outfit.hat || null,
      clothes: outfit.clothes || null,
      accessory: outfit.accessory || null
    }
  }
  return {
    hat: null,
    clothes: outfit.current || null,
    accessory: null,
    current: outfit.current || 'default',
    owned: outfit.owned || ['default']
  }
}

exports.main = async () => {
  const rid = requestId()

  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('UNAUTHORIZED', '无法获取 openid', rid)

    const user = await findUser(OPENID)
    if (!user) return fail('USER_NOT_FOUND', '用户不存在，请先调用 login 或 initUserData', rid)

    const userId = user.userId || user._id
    const cat = await findCurrentCat(OPENID, userId)
    if (!cat) return fail('CAT_NOT_FOUND', '当前小猫不存在，请先调用 login 或 initUserData', rid)

    const assets = await findByOwner('user_assets', OPENID, userId)
    const canBalance = Number(assets && (assets.canBalance !== undefined ? assets.canBalance : assets.cans)) || 0
    const completedVideoCount = await countCompletedVideos(OPENID)
    const catState = calculateCatState({ cat, canBalance, completedVideoCount })

    return ok({
      user: {
        userId,
        nickname: user.nickname || user.nickName || '',
        nickName: user.nickName || user.nickname || '',
        avatarUrl: user.avatarUrl || '',
        isFirstVisit: user.isFirstVisit !== false,
        guideCompleted: user.guideCompleted === true
      },
      cat: {
        catId: cat.catId || cat._id,
        userId: cat.userId || userId,
        breed: cat.breed || 'orange',
        intimacy: catState.intimacy,
        mood: catState.mood,
        canHarvest: catState.canHarvest,
        outfit: normalizeOutfit(cat.outfit),
        createdAt: cat.createdAt || null
      },
      assets: {
        canBalance
      },
      completedVideoCount
    }, rid)
  } catch (error) {
    console.error('[getCurrentCat] failed:', error)
    return fail('DB_ERROR', error.message || '获取当前小猫失败', rid)
  }
}

