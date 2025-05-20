const { override, adjustStyleLoaders } = require('customize-cra');

module.exports = override(
  (config) => {
    // Update Webpack Dev Server configuration
    if (config.devServer) {
      config.devServer.setupMiddlewares = (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('WebpackDevServer is not defined');
        }
        // Add your middleware setup here if needed
        return middlewares;
      };
      // Remove deprecated options
      delete config.devServer.onBeforeSetupMiddleware;
      delete config.devServer.onAfterSetupMiddleware;
    }
    return config;
  },
  adjustStyleLoaders(({ use: [, css] }) => {
    css.options.modules = {
      localIdentName: '[name]__[local]___[hash:base64:5]',
    };
  })
);