const { getCloudInitOptions } = require("../config/cloud");

let cloudReady = false;

function initCloud() {
  if (cloudReady) return true;
  if (!wx.cloud) {
    console.warn("当前基础库不支持 wx.cloud，请在微信开发者工具中启用云开发。");
    return false;
  }

  wx.cloud.init(getCloudInitOptions());
  cloudReady = true;
  return true;
}

function callCloudFunction(name, data = {}) {
  if (!initCloud()) {
    return Promise.reject(new Error("wx.cloud is not available"));
  }

  return wx.cloud.callFunction({ name, data }).then((res) => res.result);
}

module.exports = {
  initCloud,
  callCloudFunction
};
