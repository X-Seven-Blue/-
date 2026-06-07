const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

function ok(data = {}) {
  return { code: 0, message: 'success', data }
}

function fail(code, message) {
  return { code, message, data: null }
}

function now() {
  return db.serverDate()
}

async function ensureUser(openid, event) {
  const users = db.collection('users')
  const found = await users.where({ openid }).limit(1).get()
  const patch = {
    updatedAt: now(),
    lastLoginAt: now()
  }

  if (event.nickName) patch.nickName = event.nickName
  if (event.avatarUrl) patch.avatarUrl = event.avatarUrl

  if (found.data.length) {
    await users.doc(found.data[0]._id).update({ data: patch })
    return { ...found.data[0], ...patch }
  }

  const user = {
    openid,
    nickName: event.nickName || '',
    avatarUrl: event.avatarUrl || '',
    status: 'active',
    isFirstVisit: true,
    guideCompleted: false,
    createdAt: now(),
    updatedAt: now(),
    lastLoginAt: now()
  }
  const created = await users.add({ data: user })
  return { _id: created._id, ...user }
}

async function ensureDefaultCat(openid) {
  const cats = db.collection('cats')
  const found = await cats.where({ openid }).limit(1).get()
  if (found.data.length) return found.data[0]

  const cat = {
    openid,
    name: '橘子',
    breed: 'orange',
    level: 1,
    exp: 0,
    intimacy: 0,
    mood: 'normal',
    hunger: 0,
    status: 'normal',
    canHarvest: false,
    outfit: { current: 'default', owned: ['default'] },
    createdAt: now(),
    updatedAt: now()
  }
  const created = await cats.add({ data: cat })
  return { _id: created._id, ...cat }
}

async function ensureAssets(openid) {
  const assets = db.collection('user_assets')
  const found = await assets.where({ openid }).limit(1).get()
  if (found.data.length) return found.data[0]

  const initialCans = 5
  const asset = {
    openid,
    cans: initialCans,
    coins: 0,
    exp: 0,
    level: 1,
    props: {
      completedTasks: {},
      dailyCheckins: {},
      lastCheckinDate: ''
    },
    createdAt: now(),
    updatedAt: now()
  }
  const created = await assets.add({ data: asset })
  await db.collection('can_ledgers').add({
    data: {
      openid,
      type: 'income',
      amount: initialCans,
      balanceAfter: initialCans,
      source: 'initial_grant',
      businessId: created._id,
      remark: '新用户初始猫罐头',
      createdAt: now()
    }
  })
  return { _id: created._id, ...asset }
}

// 入参：{ nickName?: string, avatarUrl?: string }
// 出参：{ code, message, data: { openid, userInfo, cat, assets } }
// 测试：wx.cloud.callFunction({ name: 'login', data: { nickName: 'tester' } })
exports.main = async (event) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail(1001, '无法获取 openid')

    const userInfo = await ensureUser(OPENID, event || {})
    const cat = await ensureDefaultCat(OPENID)
    const assets = await ensureAssets(OPENID)

    return ok({ openid: OPENID, userInfo, cat, assets })
  } catch (error) {
    console.error('[login] failed:', error)
    return fail(5001, error.message || '登录失败')
  }
}
