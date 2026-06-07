const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const ALLOWED_KEYS = {
  limitLevel: true,
  canRewardRate: true,
  disclaimer: true,
  jumpMode: true
}

function sanitizeGrowthInfo(data = {}) {
  const result = {}
  Object.keys(data).forEach((key) => {
    if (ALLOWED_KEYS[key]) result[key] = data[key]
  })
  return result
}

exports.main = async () => ({
  success: true,
  data: sanitizeGrowthInfo({
    limitLevel: 'display_only',
    canRewardRate: true,
    disclaimer: 'Growth fund content is display and learning guidance only. It does not show real balance, income, or principal.',
    jumpMode: 'confirm_before_jump'
  })
})

exports.sanitizeGrowthInfo = sanitizeGrowthInfo
