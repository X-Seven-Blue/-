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

function now() {
  return db.serverDate()
}

async function findUser(openid) {
  const users = db.collection('users')
  let res = await users.where({ openid }).limit(1).get()
  if (!res.data.length) res = await users.where({ _openid: openid }).limit(1).get()
  return res.data[0] || null
}

function guideData(user) {
  return {
    userId: user.userId || user._id,
    isFirstVisit: user.isFirstVisit !== false,
    guideCompleted: user.guideCompleted === true,
    guideCompletedAt: user.guideCompletedAt || null,
    updatedAt: user.updatedAt || null
  }
}

exports.main = async (event = {}) => {
  const rid = requestId()

  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('UNAUTHORIZED', '无法获取 openid', rid)

    const action = event.action || 'get'
    if (!['get', 'update'].includes(action)) return fail('INVALID_PARAM', 'action 只能是 get 或 update', rid)

    const user = await findUser(OPENID)
    if (!user) return fail('USER_NOT_FOUND', '用户不存在，请先调用 login 或 initUserData', rid)

    if (action === 'get') return ok(guideData(user), rid)

    if (typeof event.guideCompleted !== 'boolean') {
      return fail('INVALID_PARAM', 'guideCompleted 必须是布尔值', rid)
    }

    const patch = {
      guideCompleted: event.guideCompleted,
      updatedAt: now()
    }

    if (event.guideCompleted === true) {
      patch.isFirstVisit = false
      patch.guideCompletedAt = now()
    }

    await db.collection('users').doc(user._id).update({ data: patch })
    const latest = await db.collection('users').doc(user._id).get()
    return ok(guideData(latest.data), rid)
  } catch (error) {
    console.error('[guideState] failed:', error)
    return fail('DB_ERROR', error.message || '引导状态处理失败', rid)
  }
}
