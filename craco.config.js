module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        // 合并原有 webpack 配置
        return webpackConfig;
      }
    },
    style: {
      less: {
        loaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
            modifyVars: {
              '@primary-color': '#1890ff'
            }
          }
        }
      }
    }
  };
  