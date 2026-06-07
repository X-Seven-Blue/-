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
function addStat(map, tagName, parentTag, totalDelta, completedDelta) {
  if (!tagName) return
  if (!map[tagName]) map[tagName] = { tagName, parentTag: parentTag || '', totalCount: 0, completedCount: 0 }
  map[tagName].totalCount += totalDelta
  map[tagName].completedCount += completedDelta
}

function toList(map) {
  return Object.keys(map).map((key) => {
    const item = map[key]
    return { ...item, percent: item.totalCount ? Math.round((item.completedCount / item.totalCount) * 10000) / 100 : 0 }
  }).sort((a, b) => b.totalCount - a.totalCount || a.tagName.localeCompare(b.tagName))
}

exports.main = async () => {
  try {
    const ctx = await requireContext()
    if (ctx.error) return ctx.error
    const { openid, userId } = ctx
    const videosRes = await db.collection('videos').where({ status: 'online' }).orderBy('sort', 'asc').limit(1000).get()
    const progressRows = []
    for (const query of ownerQueries(openid, userId, { completed: true })) {
      const res = await db.collection('watch_progress').where(query).limit(1000).get()
      progressRows.push(...res.data)
    }
    const completedIds = {}
    uniqBy(progressRows, 'videoId').forEach((row) => { completedIds[row.videoId] = true })

    const primary = {}
    const secondary = {}
    videosRes.data.forEach((video) => {
      const done = completedIds[video.videoId] ? 1 : 0
      addStat(primary, video.primaryTag, '', 1, done)
      addStat(secondary, video.secondaryTag, video.primaryTag, 1, done)
    })

    return ok({
      totalVideos: videosRes.data.length,
      completedVideos: Object.keys(completedIds).length,
      primaryTags: toList(primary),
      secondaryTags: toList(secondary)
    })
  } catch (error) {
    console.error('[knowledgeProgress] failed:', error)
    return fail('INTERNAL_ERROR', error.message || '获取知识进度失败')
  }
}

