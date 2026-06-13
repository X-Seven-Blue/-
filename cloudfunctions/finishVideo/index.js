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

exports.main = async (event = {}) => {
  try {
    const ctx = await requireContext()
    if (ctx.error) return ctx.error
    const { openid, userId } = ctx
    const videoId = event.videoId
    if (typeof videoId !== 'string' || !videoId) return fail('INVALID_PARAM', 'videoId 必填')

    const video = await findVideo(videoId)
    if (!video) return fail('VIDEO_NOT_FOUND', '视频不存在或未上线')
    const progress = await firstByOwner('watch_progress', openid, userId, { videoId, completed: true })
    if (!progress) return fail('PROGRESS_NOT_COMPLETED', '该视频尚未达到完播条件')

    const assets = await findAssets(openid, userId)
    if (!assets) return fail('ASSET_NOT_FOUND', '用户资产不存在')
    const rewarded = await firstByOwner('video_finish_rewards', openid, userId, { videoId })
    const currentBalance = getBalance(assets)
    if (rewarded) return ok({ rewarded: false, rewardAmount: 0, balance: currentBalance, message: '该视频已领取过奖励' })

    const rewardAmount = 1
    const beforeBalance = currentBalance
    const afterBalance = beforeBalance + rewardAmount
    await db.collection('user_assets').doc(assets._id).update({ data: { cans: _.inc(rewardAmount), updatedAt: db.serverDate() } })
    await db.collection('can_ledgers').add({
      data: {
        openid,
        userId,
        type: 'income',
        direction: 'in',
        amount: rewardAmount,
        beforeBalance,
        afterBalance,
        balanceAfter: afterBalance,
        source: 'video_finish',
        relatedId: videoId,
        businessId: videoId,
        remark: '视频完播奖励',
        createdAt: db.serverDate()
      }
    })
    await db.collection('video_finish_rewards').add({
      data: { openid, userId, videoId, rewardAmount, createdAt: db.serverDate() }
    })

    return ok({ rewarded: true, rewardAmount, balance: afterBalance })
  } catch (error) {
    console.error('[finishVideo] failed:', error)
    return fail('INTERNAL_ERROR', error.message || '领取完播奖励失败')
  }
}

