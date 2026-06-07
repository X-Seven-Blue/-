const { initCloud } = require("./shared/cloud");

App({
  onLaunch() {
    initCloud();
  },

  globalData: {
    debugHotspots: false
  }
});
