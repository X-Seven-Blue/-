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
    const pageSize = Math.min(Math.max(Number(event.pageSize || 100), 1), 200)
    const res = await db.collection('market_quotes_latest')
      .where({})
      .orderBy('tradeDate', 'desc')
      .orderBy('etfId', 'asc')
      .limit(pageSize)
      .get()

    return ok({
      list: res.data.map(sanitizeQuote),
      disclaimer: DISCLAIMER
    })
  } catch (error) {
    console.error('[getEtfList] failed:', error)
    return fail('SERVER_ERROR', error.message || 'getEtfList failed')
  }
}
