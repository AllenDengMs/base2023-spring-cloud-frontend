import { mockRequest, request } from '../request';

/**
 * 获取验证码
 * @param phone - 手机号
 * @returns - 返回boolean值表示是否发送成功
 */
export function fetchSmsCode(phone: string) {
  return request.post<boolean>('/login/sms/code', { phone });
}

/**
 * 用户名 + 密码登陆
 * @param username - 用户名
 * @param password - 密码
 */
export function fetchLogin(username: string, password: string) {
  return request.post<ApiAuth.Token>('/auth/login', { username, password });
}

/**
 * 手机号 + 短信验证码 登陆
 * @param phone - 用户名
 * @param smsCode - 密码
 */
export function fetchLoginWithSmsCode(phone: string, smsCode: string) {
  return request.post<ApiAuth.Token>('/auth/login/sms', { phone, captcha: smsCode });
}

/**
 * 推出登录
 */
export function logout() {
  return request.get('/auth/logout');
}

/** 获取用户信息 */
export function fetchUserInfo() {
  return request.get<ApiAuth.UserInfo>('/users/login/info');
}

/**
 * 获取用户路由数据
 * @param userId - 用户id
 * @description 后端根据用户id查询到对应的角色类型，并将路由筛选出对应角色的路由数据返回前端
 */
export function fetchUserRoutes(userId: string) {
  return mockRequest.post<ApiRoute.Route>('/getUserRoutes', { userId });
}

/**
 * 刷新token
 * @param refreshToken
 */
export function fetchUpdateToken(refreshToken: string) {
  return request.post<ApiAuth.Token>('/auth/refresh/token', { refreshToken });
}
