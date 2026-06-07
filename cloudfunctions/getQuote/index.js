const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const DISCLAIMER = 'Real market quotes are for learning display only and do not constitute investment advice.'

function ok(data = {}) {
  return { success: true, data }
}

function fail(code, message) {
  return { success: false, code, message }
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function sanitizeQuote(item = {}) {
  return {
    etfId: item.etfId || item.symbol,
    symbol: item.symbol || item.etfId,
    name: item.name || item.displayName || item.symbol || item.etfId,
    displayName: item.displayName || item.name || item.symbol || item.etfId,
    price: toNumber(item.price),
    changeRate: toNumber(item.changeRate),
    trend: Array.isArray(item.trend) ? item.trend.map((value) => toNumber(value)) : [],
    tradeDate: item.tradeDate || '',
    source: item.source || 'etf_daily',
    isRealMarket: true,
    disclaimer: DISCLAIMER
  }
}

exports.main = async (event = {}) => {
  try {
    const etfId = String(event.etfId || event.symbol || '').trim()
    if (!etfId) return fail('INVALID_PARAM', 'etfId is required')

    const res = await db.collection('market_quotes_latest').where({ etfId }).limit(1).get()
    if (!res.data.length) return fail('ETF_NOT_FOUND', 'quote not found')

    return ok(sanitizeQuote(res.data[0]))
  } catch (error) {
    console.error('[getQuote] failed:', error)
    return fail('SERVER_ERROR', error.message || 'getQuote failed')
  }
}
