import type { ProxyOptions } from 'vite';

/**
 * 设置网络代理
 * @param isOpenProxy - 是否开启代理
 * @param envConfig - env环境配置
 */
export function createViteProxy(isOpenProxy: boolean, envConfig: ServiceEnvConfigWithProxyPattern) {
  if (!isOpenProxy) return undefined;

  const proxy: Record<string, string | ProxyOptions> = {
    [envConfig.proxyPattern]: {
      target: envConfig.url, // 接口的域名
      changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
      rewrite: path => path.replace(new RegExp(`^${envConfig.proxyPattern}`), '')
    }
  };

  return proxy;
}
