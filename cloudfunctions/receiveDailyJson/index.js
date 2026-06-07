const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const BATCH_COLLECTION = 'daily_json_batches'
const ITEM_COLLECTION = 'daily_json_items'
const LATEST_COLLECTION = 'market_quotes_latest'
const DEFAULT_SOURCE = 'etf_daily'
const MAX_ITEMS = 2000

function ok(data = {}, message = 'ok') {
  return { success: true, data, message, serverTime: Date.now() }
}

function fail(code, message, data) {
  const res = { success: false, code, message, serverTime: Date.now() }
  if (data !== undefined) res.data = data
  return res
}

function getHeader(headers = {}, name) {
  const lowerName = name.toLowerCase()
  const found = Object.keys(headers).find((key) => key.toLowerCase() === lowerName)
  return found ? headers[found] : ''
}

function safeJsonParse(value) {
  if (!value || typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

function parseBody(event = {}) {
  if (event.body !== undefined) {
    let body = event.body
    if (event.isBase64Encoded && typeof body === 'string') {
      body = Buffer.from(body, 'base64').toString('utf8')
    }
    if (typeof body === 'string') {
      const parsed = safeJsonParse(body)
      if (parsed) return parsed
      throw Object.assign(new Error('body is not valid JSON'), { code: 'BAD_JSON' })
    }
    if (body && typeof body === 'object') return body
  }
  return event
}

function todayString() {
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000)
  return now.toISOString().slice(0, 10)
}

function cleanPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload
  const copy = Array.isArray(payload) ? payload.slice() : { ...payload }
  delete copy.token
  delete copy.pushToken
  delete copy.secret
  return copy
}

function pickFirst(item, keys) {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && String(item[key]).trim() !== '') {
      return item[key]
    }
  }
  return undefined
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeTrend(item) {
  const trend = pickFirst(item, ['trend', 'prices', 'history', 'sparkline', 'kline'])
  if (Array.isArray(trend)) {
    return trend.map((value) => toNumber(value, null)).filter((value) => value !== null)
  }
  return []
}

function normalizeMarketItem(item, index, source, tradeDate) {
  if (!item || typeof item !== 'object') {
    throw Object.assign(new Error(`list[${index}] must be object`), { code: 'BAD_ITEM' })
  }

  const symbol = String(pickFirst(item, ['symbol', 'code', 'fundCode', 'etfCode', 'id']) || '').trim()
  const name = String(pickFirst(item, ['name', 'displayName', 'shortName', 'title']) || symbol).trim()
  const price = toNumber(pickFirst(item, ['price', 'lastPrice', 'close', 'nav', 'latestPrice']), NaN)
  const changeRate = toNumber(pickFirst(item, ['changeRate', 'pctChange', 'changePercent', '涨跌幅']), 0)

  if (!symbol && !name) {
    throw Object.assign(new Error(`list[${index}] missing symbol/name`), { code: 'BAD_ITEM' })
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw Object.assign(new Error(`list[${index}] missing valid price`), { code: 'BAD_ITEM' })
  }

  return {
    etfId: symbol || name,
    symbol: symbol || name,
    name,
    displayName: String(item.displayName || name).trim(),
    price,
    changeRate,
    trend: normalizeTrend(item),
    source,
    tradeDate,
    raw: cleanPayload(item)
  }
}

function normalize(payload) {
  const root = Array.isArray(payload) ? { list: payload } : payload
  if (!root || typeof root !== 'object') {
    throw Object.assign(new Error('JSON root must be object or array'), { code: 'BAD_JSON' })
  }

  const source = String(root.source || root.type || DEFAULT_SOURCE).trim() || DEFAULT_SOURCE
  const tradeDate = String(root.tradeDate || root.date || root.day || todayString()).trim()
  const list = Array.isArray(root.list)
    ? root.list
    : Array.isArray(root.data)
      ? root.data
      : []

  if (!list.length) {
    throw Object.assign(new Error('list/data must contain at least one quote'), { code: 'EMPTY_LIST' })
  }
  if (list.length > MAX_ITEMS) {
    throw Object.assign(new Error(`list supports at most ${MAX_ITEMS} items`), { code: 'TOO_MANY_ITEMS' })
  }

  const normalizedList = list.map((item, index) => normalizeMarketItem(item, index, source, tradeDate))

  return {
    source,
    tradeDate,
    batchKey: `${source}:${tradeDate}`,
    list: normalizedList,
    rawPayload: cleanPayload(root)
  }
}

function getTokenFromEvent(event = {}, payload = {}) {
  const headers = event.headers || {}
  const auth = getHeader(headers, 'authorization')
  if (auth && /^bearer\s+/i.test(auth)) return auth.replace(/^bearer\s+/i, '').trim()
  return (
    getHeader(headers, 'x-push-token') ||
    event.token ||
    (event.queryStringParameters && event.queryStringParameters.token) ||
    payload.token ||
    payload.pushToken ||
    payload.secret ||
    ''
  )
}

function assertToken(event, payload) {
  const expected = process.env.PUSH_TOKEN
  if (!expected) return
  const actual = String(getTokenFromEvent(event, payload) || '')
  if (actual !== expected) {
    throw Object.assign(new Error('invalid push token'), { code: 'UNAUTHORIZED' })
  }
}

async function upsertByKey(collectionName, keyName, keyValue, data) {
  const collection = db.collection(collectionName)
  const found = await collection.where({ [keyName]: keyValue }).limit(1).get()
  if (found.data.length) {
    await collection.doc(found.data[0]._id).update({ data })
    return { id: found.data[0]._id, inserted: false }
  }
  const created = await collection.add({ data: { ...data, createdAt: db.serverDate() } })
  return { id: created._id, inserted: true }
}

async function saveBatch(normalized) {
  return upsertByKey(BATCH_COLLECTION, 'batchKey', normalized.batchKey, {
    source: normalized.source,
    tradeDate: normalized.tradeDate,
    batchKey: normalized.batchKey,
    itemCount: normalized.list.length,
    rawPayload: normalized.rawPayload,
    receivedAt: db.serverDate(),
    updatedAt: db.serverDate()
  })
}

async function saveItems(normalized, batchId) {
  let inserted = 0
  let updated = 0

  for (let index = 0; index < normalized.list.length; index += 1) {
    const item = normalized.list[index]
    const itemKey = `${normalized.batchKey}:${item.etfId}`
    const data = {
      source: normalized.source,
      tradeDate: normalized.tradeDate,
      batchKey: normalized.batchKey,
      batchId,
      itemKey,
      itemId: item.etfId,
      etfId: item.etfId,
      symbol: item.symbol,
      sort: index,
      data: item,
      receivedAt: db.serverDate(),
      updatedAt: db.serverDate()
    }

    const itemResult = await upsertByKey(ITEM_COLLECTION, 'itemKey', itemKey, data)
    if (itemResult.inserted) inserted += 1
    else updated += 1

    await upsertByKey(LATEST_COLLECTION, 'etfId', item.etfId, {
      ...item,
      itemKey,
      batchKey: normalized.batchKey,
      latestAt: db.serverDate(),
      updatedAt: db.serverDate()
    })
  }

  return { inserted, updated }
}

exports.main = async (event = {}) => {
  try {
    const payload = parseBody(event)
    assertToken(event, payload)

    const normalized = normalize(payload)
    const batch = await saveBatch(normalized)
    const items = await saveItems(normalized, batch.id)

    return ok({
      batchId: batch.id,
      batchInserted: batch.inserted,
      batchKey: normalized.batchKey,
      source: normalized.source,
      tradeDate: normalized.tradeDate,
      itemCount: normalized.list.length,
      itemInserted: items.inserted,
      itemUpdated: items.updated,
      latestUpdated: normalized.list.length
    }, 'market quotes received')
  } catch (error) {
    const code = error.code || (error.message && error.message.includes('JSON') ? 'BAD_JSON' : 'INTERNAL_ERROR')
    console.error('[receiveDailyJson] failed:', error)
    return fail(code, error.message || 'receive failed')
  }
}
