const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function ok(data = {}) {
  return { code: 0, message: 'success', data }
}

function fail(code, message) {
  return { code, message, data: null }
}

function now() {
  return db.serverDate()
}

async function ensureUser(openid) {
  const found = await db.collection('users').where({ openid }).limit(1).get()
  if (found.data.length) return found.data[0]
  const user = {
    openid,
    nickName: '',
    avatarUrl: '',
    status: 'active',
    isFirstVisit: true,
    guideCompleted: false,
    createdAt: now(),
    updatedAt: now(),
    lastLoginAt: now()
  }
  const created = await db.collection('users').add({ data: user })
  return { _id: created._id, ...user }
}

async function ensureDefaultCat(openid) {
  const found = await db.collection('cats').where({ openid }).limit(1).get()
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
  const created = await db.collection('cats').add({ data: cat })
  return { _id: created._id, ...cat }
}

async function ensureAssets(openid) {
  const found = await db.collection('user_assets').where({ openid }).limit(1).get()
  if (found.data.length) return found.data[0]
  const initialCans = 5
  const asset = {
    openid,
    cans: initialCans,
    coins: 0,
    exp: 0,
    level: 1,
    props: { completedTasks: {}, dailyCheckins: {}, lastCheckinDate: '' },
    createdAt: now(),
    updatedAt: now()
  }
  const created = await db.collection('user_assets').add({ data: asset })
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

// 入参：{}
// 出参：{ code, message, data: { openid, userInfo, cat, assets } }
// 测试：wx.cloud.callFunction({ name: 'initUserData' })
exports.main = async () => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail(1001, '无法获取 openid')

    const userInfo = await ensureUser(OPENID)
    const cat = await ensureDefaultCat(OPENID)
    const assets = await ensureAssets(OPENID)

    return ok({ openid: OPENID, userInfo, cat, assets })
  } catch (error) {
    console.error('[initUserData] failed:', error)
    return fail(5003, error.message || '初始化用户数据失败')
  }
}
