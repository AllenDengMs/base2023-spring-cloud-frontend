import { request } from '../request';

/**
 * 新增用户
 * @param username - 用户名
 */
export function addUser(requestBody: object) {
  return request.post<string>('/users', requestBody);
}

/**
 * 新增用户
 * @param username - 用户名
 */
export function updateUser(requestBody: object) {
  return request.put<string>('/users', requestBody);
}
