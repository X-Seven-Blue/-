const CLOUD_ENV_ID = "";

function getCloudInitOptions() {
  const options = {
    traceUser: true
  };

  if (CLOUD_ENV_ID) {
    options.env = CLOUD_ENV_ID;
  }

  return options;
}

module.exports = {
  CLOUD_ENV_ID,
  getCloudInitOptions
};
