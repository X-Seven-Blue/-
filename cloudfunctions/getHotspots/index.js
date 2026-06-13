const cloud = require('wx-server-sdk')
const config = require('./config')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

function requestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function ok(data = {}, rid = requestId()) {
  return { success: true, data, requestId: rid, serverTime: Date.now() }
}

function fail(code, message, rid = requestId()) {
  return { success: false, error: { code, message }, requestId: rid, serverTime: Date.now() }
}

exports.main = async () => {
  const rid = requestId()

  try {
    const hotspots = config.hotspots
      .filter((item) => item.enabled !== false)
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

    return ok({
      version: config.version,
      updatedAt: config.updatedAt,
      hotspots
    }, rid)
  } catch (error) {
    console.error('[getHotspots] failed:', error)
    return fail('INTERNAL_ERROR', error.message || '获取热点配置失败', rid)
  }
}
