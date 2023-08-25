import { transformObjectToOption } from './_shared';

export const loginModuleLabels: Record<UnionKey.LoginModule, string> = {
  'pwd-login': '账密登录',
  'code-login': '手机验证码登录',
  register: '注册',
  'reset-pwd': '重置密码',
  'bind-wechat': '微信绑定'
};

export const userRoleLabels: Record<Auth.RoleType, string> = {
  super: '超级管理员',
  admin: '管理员',
  user: '普通用户'
};
export const userRoleOptions = transformObjectToOption(userRoleLabels);

/** 用户性别 */
export const genderLabels: Record<UserManagement.GenderKey, string> = {
  1: '男',
  2: '女'
};
export const genderOptions = transformObjectToOption(genderLabels);

/** 用户状态 */
export const userStatusLabels: Record<UserManagement.UserStatusKey, string> = {
  1: '启用',
  0: '禁用'
};
export const userStatusOptions = transformObjectToOption(userStatusLabels);

export const userTypeLabels: Record<UserManagement.UserTypeKey, string> = {
  '0': '平台',
  '10': '代理商',
  '20': '商户',
  '30': '客服'
};
export const userTypeOptions = transformObjectToOption(userTypeLabels);
