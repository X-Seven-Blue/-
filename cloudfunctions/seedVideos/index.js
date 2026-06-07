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
const VIDEOS = [
  { videoId: 'video_001', title: '认识基金是什么', category: 'fund', coverUrl: 'mock-cover-001.png', videoUrl: 'https://example.com/mock-video-001.mp4', duration: 180, primaryTag: '基金', secondaryTag: '基金入门', tags: ['金融', '基金', '基金入门'], sort: 1, status: 'online' },
  { videoId: 'video_002', title: '基金净值与份额', category: 'fund', coverUrl: 'mock-cover-002.png', videoUrl: 'https://example.com/mock-video-002.mp4', duration: 210, primaryTag: '基金', secondaryTag: '基金入门', tags: ['金融', '基金', '净值'], sort: 2, status: 'online' },
  { videoId: 'video_003', title: '指数基金基础概念', category: 'fund', coverUrl: 'mock-cover-003.png', videoUrl: 'https://example.com/mock-video-003.mp4', duration: 240, primaryTag: '基金', secondaryTag: '指数基金', tags: ['金融', '基金', '指数基金'], sort: 3, status: 'online' },
  { videoId: 'video_004', title: '风险认知入门', category: 'finance_basic', coverUrl: 'mock-cover-004.png', videoUrl: 'https://example.com/mock-video-004.mp4', duration: 200, primaryTag: '金融', secondaryTag: '风险认知', tags: ['金融', '风险认知', '投资纪律'], sort: 4, status: 'online' },
  { videoId: 'video_005', title: '投资纪律和记录习惯', category: 'finance_basic', coverUrl: 'mock-cover-005.png', videoUrl: 'https://example.com/mock-video-005.mp4', duration: 220, primaryTag: '金融', secondaryTag: '投资纪律', tags: ['金融', '投资纪律'], sort: 5, status: 'online' },
  { videoId: 'video_006', title: '期货是什么', category: 'futures', coverUrl: 'mock-cover-006.png', videoUrl: 'https://example.com/mock-video-006.mp4', duration: 230, primaryTag: '期货', secondaryTag: '期货基础', tags: ['金融', '期货', '期货基础'], sort: 6, status: 'online' },
  { videoId: 'video_007', title: '保证金和风险控制', category: 'futures', coverUrl: 'mock-cover-007.png', videoUrl: 'https://example.com/mock-video-007.mp4', duration: 260, primaryTag: '期货', secondaryTag: '风险认知', tags: ['期货', '风险认知'], sort: 7, status: 'online' },
  { videoId: 'video_008', title: '会计科目基础', category: 'accounting', coverUrl: 'mock-cover-008.png', videoUrl: 'https://example.com/mock-video-008.mp4', duration: 190, primaryTag: '会计', secondaryTag: '会计科目', tags: ['会计', '会计科目'], sort: 8, status: 'online' },
  { videoId: 'video_009', title: '财报基础结构', category: 'accounting', coverUrl: 'mock-cover-009.png', videoUrl: 'https://example.com/mock-video-009.mp4', duration: 250, primaryTag: '会计', secondaryTag: '财报基础', tags: ['会计', '财报基础'], sort: 9, status: 'online' },
  { videoId: 'video_010', title: '资产负债表怎么看', category: 'accounting', coverUrl: 'mock-cover-010.png', videoUrl: 'https://example.com/mock-video-010.mp4', duration: 280, primaryTag: '会计', secondaryTag: '资产负债表', tags: ['会计', '财报基础', '资产负债表'], sort: 10, status: 'online' }
]

exports.main = async () => {
  try {
    const ctx = await requireContext()
    if (ctx.error) return ctx.error
    let inserted = 0
    let updated = 0
    for (const video of VIDEOS) {
      const found = await db.collection('videos').where({ videoId: video.videoId }).limit(1).get()
      if (found.data.length) {
        await db.collection('videos').doc(found.data[0]._id).update({ data: { ...video, updatedAt: db.serverDate() } })
        updated += 1
      } else {
        await db.collection('videos').add({ data: { ...video, createdAt: db.serverDate(), updatedAt: db.serverDate() } })
        inserted += 1
      }
    }
    return ok({ inserted, updated, total: VIDEOS.length })
  } catch (error) {
    console.error('[seedVideos] failed:', error)
    return fail('INTERNAL_ERROR', error.message || '导入视频种子失败')
  }
}

