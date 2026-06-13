const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function requestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function ok(data = {}, rid = requestId()) {
  return { success: true, data, requestId: rid, serverTime: Date.now() }
}

function fail(code, message, rid = requestId(), data) {
  const result = { success: false, error: { code, message }, requestId: rid, serverTime: Date.now() }
  if (data) result.data = data
  return result
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function sanitizeExtra(extra) {
  if (!isPlainObject(extra)) return {}
  const json = JSON.stringify(extra)
  if (json.length > 2048) return { truncated: true }
  return JSON.parse(json)
}

async function findUser(openid) {
  const users = db.collection('users')
  let res = await users.where({ openid }).limit(1).get()
  if (!res.data.length) res = await users.where({ _openid: openid }).limit(1).get()
  return res.data[0] || null
}

exports.main = async (event = {}) => {
  const rid = requestId()

  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('UNAUTHORIZED', '无法获取 openid', rid, { tracked: false })

    const hotspotId = typeof event.hotspotId === 'string' ? event.hotspotId.trim() : ''
    if (!hotspotId) return fail('INVALID_PARAM', 'hotspotId 不能为空', rid, { tracked: false })

    const user = await findUser(OPENID)
    if (!user) return fail('USER_NOT_FOUND', '用户不存在，请先调用 login 或 initUserData', rid, { tracked: false })

    const record = {
      _openid: OPENID,
      openid: OPENID,
      userId: user.userId || user._id,
      hotspotId,
      hotspotName: typeof event.hotspotName === 'string' ? event.hotspotName.slice(0, 40) : '',
      sourcePage: typeof event.sourcePage === 'string' ? event.sourcePage.slice(0, 80) : '',
      targetPage: typeof event.targetPage === 'string' ? event.targetPage.slice(0, 80) : '',
      scene: typeof event.scene === 'string' ? event.scene.slice(0, 40) : 'tap',
      extra: sanitizeExtra(event.extra),
      createdAt: db.serverDate()
    }

    if (event.clientTime !== undefined) record.clientTime = event.clientTime
    if (typeof event.appVersion === 'string') record.appVersion = event.appVersion.slice(0, 30)

    const created = await db.collection('hotspot_logs').add({ data: record })
    return ok({ logId: created._id, tracked: true }, rid)
  } catch (error) {
    console.error('[trackHotspot] failed:', error)
    return fail('DB_ERROR', error.message || '热点埋点写入失败，前端可继续跳转', rid, { tracked: false })
  }
}
