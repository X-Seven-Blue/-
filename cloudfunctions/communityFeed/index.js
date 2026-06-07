const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const OFFICIAL_POSTS = [
  {
    postId: 'official_cat_001',
    authorName: '猫咪小屋',
    avatar: 'cat',
    category: 'cat',
    title: '窗边晒太阳的小日常',
    content: '今天的小猫在窗边打了个盹，醒来以后去朋友家看了看番茄苗。',
    images: [],
    likeCount: 18,
    commentCount: 3,
    isOfficial: true
  },
  {
    postId: 'official_study_001',
    authorName: '学习小助手',
    avatar: 'study',
    category: 'study',
    title: '今天完成一个知识点',
    content: '用三分钟复盘刚学过的概念，再给小猫添一份成长记录。',
    images: [],
    likeCount: 12,
    commentCount: 2,
    isOfficial: true
  },
  {
    postId: 'official_life_001',
    authorName: '小屋广播',
    avatar: 'life',
    category: 'life',
    title: '小院里的温柔提醒',
    content: '喝水、休息、看看窗外，也记得给朋友的小猫点个赞。',
    images: [],
    likeCount: 21,
    commentCount: 4,
    isOfficial: true
  }
]

const RISK_WORDS = [
  '股票代码',
  '收益率',
  '荐股',
  '带单',
  '买入建议',
  '卖出建议',
  '账户截图',
  '翻倍',
  '稳赚',
  '目标收益',
  '年化',
  '实盘',
  '跟投'
]

function ok(data = {}) {
  return { success: true, data }
}

function fail(code, message) {
  return { success: false, code, message }
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function sanitizePost(post) {
  return {
    postId: post.postId,
    authorName: post.authorName,
    avatar: post.avatar,
    category: post.category,
    title: post.title,
    content: post.content,
    images: Array.isArray(post.images) ? post.images : [],
    likeCount: Number(post.likeCount || 0),
    commentCount: Number(post.commentCount || 0),
    isOfficial: post.isOfficial === true,
    createdAt: post.createdAt
  }
}

async function ensureOfficialPosts() {
  const collection = db.collection('community_posts')
  const existing = await collection.where({ isOfficial: true }).limit(1).get()
  if (existing.data.length) return

  await Promise.all(OFFICIAL_POSTS.map((post) => collection.add({
    data: {
      ...post,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  })))
}

function normalizePage(value, fallback) {
  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) return fallback
  return number
}

async function communityFeed(event = {}) {
  await ensureOfficialPosts()

  const category = ['cat', 'study', 'life'].includes(event.category) ? event.category : 'all'
  const page = normalizePage(event.page, 1)
  const pageSize = Math.min(normalizePage(event.pageSize, 10), 30)
  let query = db.collection('community_posts').where({})
  if (category !== 'all') query = db.collection('community_posts').where({ category })

  const res = await query.orderBy('createdAt', 'desc').skip((page - 1) * pageSize).limit(pageSize + 1).get()
  const list = res.data.slice(0, pageSize).map(sanitizePost)
  return ok({
    list,
    page,
    pageSize,
    hasMore: res.data.length > pageSize
  })
}

function hasContentRisk(text) {
  return RISK_WORDS.some((word) => text.includes(word))
}

async function createCommunityPost(event = {}) {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return fail('UNAUTHENTICATED', '无法获取当前用户身份')

  const title = String(event.title || '').trim()
  const content = String(event.content || '').trim()
  if (!title || !content) return fail('INVALID_PARAM', 'title和content必填')

  if (hasContentRisk(`${title} ${content}`)) {
    return fail('CONTENT_RISK', '内容包含不适合发布的投资相关表述，请修改后再发布')
  }

  const postId = makeId('post')
  await db.collection('community_posts').add({
    data: {
      openid: OPENID,
      postId,
      authorName: '猫友',
      avatar: 'cat',
      category: ['cat', 'study', 'life'].includes(event.category) ? event.category : 'study',
      title,
      content,
      images: Array.isArray(event.images) ? event.images.slice(0, 6) : [],
      likeCount: 0,
      commentCount: 0,
      isOfficial: false,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  })

  return ok({ postId })
}

exports.main = async (event = {}) => {
  try {
    if (event.action === 'createCommunityPost') return createCommunityPost(event)
    return communityFeed(event)
  } catch (error) {
    console.error('[communityFeed] failed:', error)
    return fail('SERVER_ERROR', error.message || '社区内容加载失败')
  }
}
