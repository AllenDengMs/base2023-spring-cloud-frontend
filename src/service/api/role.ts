import { request } from '../request';

/**
 * 登录
 * @param username - 用户名
 * @param password - 密码
 */
export const findAllRoles = async () => {
  const { data } = await request.get<ApiRole.Role[] | null>('/roles');
  return data === null ? [] : data;
};

export const getUIPermissionByRoleId = async (roleId: string) => {
  const { data } = await request.get<ApiRole.RoleUIPermission | null>('/roles/ui-permissions', { params: { roleId } });
  return data;
};

/**
 * 登录
 * @param username - 用户名
 */
export function saveRolePermision(requestBody: object) {
  return request.put<string>('/roles/permissions', requestBody);
}
