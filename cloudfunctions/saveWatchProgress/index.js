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
async function findVideo(videoId) {
  const res = await db.collection('videos').where({ videoId, status: 'online' }).limit(1).get()
  return res.data[0] || null
}

async function findProgress(openid, userId, videoId) {
  return firstByOwner('watch_progress', openid, userId, { videoId })
}

exports.main = async (event = {}) => {
  try {
    const ctx = await requireContext()
    if (ctx.error) return ctx.error
    const { openid, userId } = ctx
    const videoId = event.videoId
    const watchedSeconds = Number(event.watchedSeconds)
    if (typeof videoId !== 'string' || !videoId || !Number.isFinite(watchedSeconds) || watchedSeconds < 0) return fail('INVALID_PARAM', 'videoId 和 watchedSeconds 必填')

    const video = await findVideo(videoId)
    if (!video) return fail('VIDEO_NOT_FOUND', '视频不存在或未上线')
    const duration = Math.max(1, Number(video.duration || event.duration || 1))
    const existing = await findProgress(openid, userId, videoId)
    const maxWatchedSeconds = Math.max(Number(existing && existing.watchedSeconds || 0), watchedSeconds)
    const progressPercent = Math.min(100, Math.round((maxWatchedSeconds / duration) * 10000) / 100)
    const completed = maxWatchedSeconds >= duration * 0.9 || maxWatchedSeconds >= duration - 5
    const firstCompleted = completed && !(existing && existing.completed)

    if (existing) {
      const data = { watchedSeconds: maxWatchedSeconds, progressPercent, completed, updatedAt: db.serverDate() }
      if (firstCompleted) data.completedAt = db.serverDate()
      await db.collection('watch_progress').doc(existing._id).update({ data })
    } else {
      await db.collection('watch_progress').add({
        data: {
          openid,
          userId,
          videoId,
          watchedSeconds: maxWatchedSeconds,
          progressPercent,
          completed,
          completedAt: completed ? db.serverDate() : null,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }

    const completedVideoCount = await countCompletedVideos(openid, userId)
    return ok({ videoId, completed, completedVideoCount, progressPercent, watchedSeconds: maxWatchedSeconds })
  } catch (error) {
    console.error('[saveWatchProgress] failed:', error)
    return fail('INTERNAL_ERROR', error.message || '保存学习进度失败')
  }
}

