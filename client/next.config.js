module.exports = {
  // Enforce file change detection in docker containers
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
