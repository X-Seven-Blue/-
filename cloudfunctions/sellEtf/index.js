const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

const DISCLAIMER = 'This is a learning simulation using game cans, not a real transaction or investment advice.'
const EPSILON = 0.000001

function ok(data = {}) {
  return { success: true, data }
}

function fail(code, message) {
  return { success: false, code, message }
}

function now() {
  return db.serverDate()
}

function round(value, digits = 2) {
  const base = Math.pow(10, digits)
  return Math.round((Number(value) || 0) * base) / base
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function getBalance(assets) {
  return Number(assets && (assets.cans !== undefined ? assets.cans : assets.canBalance !== undefined ? assets.canBalance : assets.balance || 0)) || 0
}

function getBalanceKey(assets) {
  if (assets && assets.cans !== undefined) return 'cans'
  if (assets && assets.canBalance !== undefined) return 'canBalance'
  return 'cans'
}

async function requireOpenid() {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  if (!openid) return { error: fail('UNAUTHENTICATED', 'openid missing') }
  return { openid }
}

async function findAssets(openid) {
  const res = await db.collection('user_assets').where({ openid }).limit(1).get()
  return res.data[0] || null
}

async function findQuote(etfId) {
  const res = await db.collection('market_quotes_latest').where({ etfId }).limit(1).get()
  return res.data[0] || null
}

async function getExistingPosition(openid, etfId) {
  const res = await db.collection('etf_positions').where({ openid, etfId }).limit(1).get()
  return res.data[0] || null
}

async function updateOrCreatePosition({ openid, quote, sharesDelta, costDelta }) {
  const positions = db.collection('etf_positions')
  const existing = await getExistingPosition(openid, quote.etfId)
  const oldShares = Number((existing && existing.shares) || 0)
  const oldCost = Number((existing && existing.costAmount) || 0)
  const newShares = oldShares + sharesDelta
  const newCost = Math.max(0, oldCost + costDelta)
  const price = Number(quote.price)

  if (existing && newShares <= EPSILON) {
    await positions.doc(existing._id).remove()
    return null
  }

  const position = {
    openid,
    etfId: quote.etfId,
    symbol: quote.symbol || quote.etfId,
    etfName: quote.name || quote.displayName || quote.etfId,
    shares: round(newShares, 6),
    costAmount: round(newCost),
    avgCostPrice: newShares > EPSILON ? round(newCost / newShares, 4) : 0,
    currentPrice: round(price, 4),
    marketValue: round(newShares * price),
    profit: round(newShares * price - newCost),
    profitRate: newCost > EPSILON ? round((newShares * price - newCost) / newCost, 4) : 0,
    tradeDate: quote.tradeDate || '',
    isRealMarket: true,
    updatedAt: now()
  }

  if (existing) {
    await positions.doc(existing._id).update({ data: position })
    return { ...existing, ...position }
  }

  const created = await positions.add({ data: { ...position, createdAt: now() } })
  return { _id: created._id, ...position }
}

function sanitizePosition(position) {
  if (!position) return null
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

    const etfId = String(event.etfId || event.symbol || '').trim()
    const shares = Number(event.shares)
    if (!etfId) return fail('INVALID_PARAM', 'etfId is required')
    if (!Number.isFinite(shares) || shares <= 0) return fail('INVALID_AMOUNT', 'shares must be greater than 0')

    const quote = await findQuote(etfId)
    if (!quote) return fail('ETF_NOT_FOUND', 'quote not found')
    if (!Number.isFinite(Number(quote.price)) || Number(quote.price) <= 0) return fail('BAD_QUOTE', 'quote price invalid')

    const position = await getExistingPosition(ctx.openid, quote.etfId)
    if (!position || Number(position.shares || 0) + EPSILON < shares) {
      return fail('INSUFFICIENT_POSITION', 'position is insufficient')
    }

    const assets = await findAssets(ctx.openid)
    if (!assets) return fail('ASSET_NOT_FOUND', 'user asset not found')

    const price = Number(quote.price)
    const beforeBalance = getBalance(assets)
    const balanceKey = getBalanceKey(assets)
    const returnAmount = Math.floor(shares * price)
    const costPerShare = Number(position.avgCostPrice || 0)
    const costAmount = round(costPerShare * shares)
    const profit = round(returnAmount - costAmount)
    const afterBalance = beforeBalance + returnAmount
    const tradeId = makeId('trade')
    const trade = {
      tradeId,
      openid: ctx.openid,
      etfId: quote.etfId,
      symbol: quote.symbol || quote.etfId,
      etfName: quote.name || quote.displayName || quote.etfId,
      type: 'sell',
      price,
      amount: returnAmount,
      shares: round(shares, 6),
      profit,
      tradeDate: quote.tradeDate || '',
      isRealMarket: true,
      disclaimer: DISCLAIMER,
      createdAt: now()
    }

    await db.collection('user_assets').doc(assets._id).update({ data: { [balanceKey]: _.inc(returnAmount), updatedAt: now() } })
    await db.collection('can_ledgers').add({
      data: {
        openid: ctx.openid,
        source: 'etf_sell',
        direction: 'increase',
        type: 'income',
        amount: returnAmount,
        beforeBalance,
        afterBalance,
        balanceAfter: afterBalance,
        relatedId: tradeId,
        businessId: tradeId,
        remark: 'ETF learning sell',
        createdAt: now()
      }
    })
    await db.collection('etf_trades').add({ data: trade })

    const updatedPosition = await updateOrCreatePosition({
      openid: ctx.openid,
      quote,
      sharesDelta: -shares,
      costDelta: -costAmount
    })

    return ok({
      balance: afterBalance,
      trade: sanitizeTrade(trade),
      position: sanitizePosition(updatedPosition),
      disclaimer: DISCLAIMER
    })
  } catch (error) {
    console.error('[sellEtf] failed:', error)
    return fail('SERVER_ERROR', error.message || 'sellEtf failed')
  }
}
