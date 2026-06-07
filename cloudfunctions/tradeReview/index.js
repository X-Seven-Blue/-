const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

const DISCLAIMER = 'All trading data is a learning simulation and does not constitute investment advice.'

function ok(data = {}) {
  return { success: true, data }
}

function fail(code, message) {
  return { success: false, code, message }
}

function round(value, digits = 2) {
  const base = Math.pow(10, digits)
  return Math.round((Number(value) || 0) * base) / base
}

async function requireOpenid() {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  if (!openid) return { error: fail('UNAUTHENTICATED', 'openid missing') }
  return { openid }
}

function dayRange(dateText) {
  const base = typeof dateText === 'string' && dateText ? new Date(`${dateText}T00:00:00+08:00`) : new Date()
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

function sanitizePosition(position) {
  return {
    etfId: position.etfId,
    symbol: position.symbol,
    etfName: position.etfName,
    shares: round(position.shares, 6),
    costAmount: round(position.costAmount),
    avgCostPrice: round(position.avgCostPrice, 4),
    currentPrice: round(position.currentPrice, 4),
    marketValue: round(position.marketValue),
    profit: round(position.profit),
    profitRate: round(position.profitRate, 4),
    tradeDate: position.tradeDate || '',
    isRealMarket: true,
    updatedAt: position.updatedAt,
    createdAt: position.createdAt
  }
}

function sanitizeTrade(trade) {
  return {
    tradeId: trade.tradeId,
    etfId: trade.etfId,
    symbol: trade.symbol,
    etfName: trade.etfName,
    type: trade.type,
    price: trade.price,
    amount: trade.amount,
    shares: round(trade.shares, 6),
    profit: round(trade.profit),
    tradeDate: trade.tradeDate || '',
    isRealMarket: true,
    disclaimer: DISCLAIMER,
    createdAt: trade.createdAt
  }
}

exports.main = async (event = {}) => {
  try {
    const ctx = await requireOpenid()
    if (ctx.error) return ctx.error

    const range = dayRange(event.date)
    const positionsRes = await db.collection('etf_positions')
      .where({ openid: ctx.openid })
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .get()
    const tradesRes = await db.collection('etf_trades')
      .where({ openid: ctx.openid, createdAt: _.gte(range.start).and(_.lt(range.end)) })
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()
    const ledgerRes = await db.collection('can_ledgers')
      .where({ openid: ctx.openid, source: _.in(['etf_buy', 'etf_sell']), createdAt: _.gte(range.start).and(_.lt(range.end)) })
      .limit(100)
      .get()

    const todayTrades = tradesRes.data
    const increase = ledgerRes.data.filter((item) => item.source === 'etf_sell' || item.direction === 'increase').reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const decrease = ledgerRes.data.filter((item) => item.source === 'etf_buy' || item.direction === 'decrease').reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const profit = todayTrades.reduce((sum, item) => sum + Number(item.profit || 0), 0)
    let feedbackType = 'no_trade'
    if (todayTrades.length >= 3) feedbackType = 'active'
    else if (profit > 0) feedbackType = 'gain'
    else if (profit < 0) feedbackType = 'loss'
    else if (todayTrades.length > 0) feedbackType = 'stable'

    return ok({
      positions: positionsRes.data.map(sanitizePosition),
      todayTrades: todayTrades.map(sanitizeTrade),
      canChange: {
        increase,
        decrease,
        net: increase - decrease
      },
      feedbackType,
      disclaimer: DISCLAIMER
    })
  } catch (error) {
    console.error('[tradeReview] failed:', error)
    return fail('SERVER_ERROR', error.message || 'tradeReview failed')
  }
}
