const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const EVENT_TYPES = ['click', 'confirm', 'cancel']
const SENSITIVE_KEYS = {
  balance: true,
  income: true,
  principal: true,
  yield: true,
  amount: true,
  account: true,
  accountBalance: true,
  realBalance: true,
  realIncome: true,
  profit: true,
  totalAsset: true,
  annualYield: true,
  rate: true,
  interest: true
}

function ok(data = {}) {
  return { success: true, data }
}

function fail(code, message) {
  return { success: false, code, message }
}

function sanitizeGrowthExtra(value) {
  if (Array.isArray(value)) return value.map(sanitizeGrowthExtra)
  if (!value || typeof value !== 'object') return value

  const result = {}
  Object.keys(value).forEach((key) => {
    if (SENSITIVE_KEYS[key]) return
    result[key] = sanitizeGrowthExtra(value[key])
  })
  return result
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('UNAUTHENTICATED', '无法获取当前用户身份')

    const eventType = event.eventType
    if (!EVENT_TYPES.includes(eventType)) return fail('INVALID_PARAM', 'eventType不合法')

    await db.collection('growth_jump_logs').add({
      data: {
        openid: OPENID,
        eventType,
        sourcePage: typeof event.sourcePage === 'string' && event.sourcePage ? event.sourcePage : 'home',
        extra: sanitizeGrowthExtra(event.extra || {}),
        createdAt: db.serverDate()
      }
    })

    return ok({ logged: true })
  } catch (error) {
    console.error('[growthJumpLog] failed:', error)
    return fail('SERVER_ERROR', error.message || '成长金跳转日志记录失败')
  }
}

exports.sanitizeGrowthExtra = sanitizeGrowthExtra
