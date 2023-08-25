import { request } from '../request';

/** 获取用户列表 */
export const fetchUserList = async (requestPatam: object) => {
  const data = await request.get<ApiUserManagement.User[] | null>('/users/mine', { params: requestPatam });
  return data;
};
