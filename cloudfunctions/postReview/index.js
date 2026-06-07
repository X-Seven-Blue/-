const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const BLOCK_PATTERNS = [
  /[A-Z]{1,5}\.\w{2,4}/i,
  /\b\d{6}\b/,
  /收益率|年化|荐股|带单|跟投|实盘|账户截图|目标收益|买入建议|卖出建议|稳赚|翻倍/,
  /balance|income|principal|yield|profit|account/i
]

function ok(data = {}) {
  return { success: true, data }
}

function fail(code, message, data) {
  return { success: false, code, message, data }
}

function checkText(text) {
  const source = String(text || '')
  const hit = BLOCK_PATTERNS.find((pattern) => pattern.test(source))
  return {
    passed: !hit,
    reason: hit ? 'content contains investment-sensitive wording or code-like text' : ''
  }
}

exports.main = async (event = {}) => {
  const title = String(event.title || '').trim()
  const content = String(event.content || '').trim()
  const result = checkText(`${title} ${content}`)

  if (!result.passed) {
    return fail('CONTENT_RISK', result.reason, { passed: false })
  }

  return ok({ passed: true })
}

exports.checkText = checkText
