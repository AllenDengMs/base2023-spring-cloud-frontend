/** 用户相关模块 */
declare namespace Auth {
  /**
   * 用户角色类型(前端静态路由用角色类型进行路由权限的控制)
   * - super: 超级管理员(该权限具有所有路由数据)
   * - admin: 管理员
   * - user: 用户
   */
  type RoleType = 'super' | 'admin' | 'user';

  /** 用户信息 */
  interface UserInfo {
    /** 用户id */
    userId: string;
    /** 用户名 */
    userName: string;
    /** 用户角色类型 */
    userRole: string;
  }

  interface ApiPath {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
  }
  interface ButtonPermission {
    /** 权限码 */
    code: string;
    /** 权限名称，用于前端展示 */
    title: string;
    /** 权限名称（国际化翻译） */
    i18nTitle?: string;
    /** 对应的后台api路径，一个按钮可能会调用多个后台api */
    apiPaths: Auth.ApiPath[];
  }
}

declare namespace UserManagement {
  interface User extends ApiUserManagement.User {
    /** 序号 */
    index: number;
    /** 表格的key（id） */
    key: string;
    roleId: string | null;
  }

  /**
   * 用户性别
   * - 0: 女
   * - 1: 男
   */
  type GenderKey = NonNullable<User['gender']>;

  /**
   * 用户状态
   * - 1: 启用
   * - 2: 禁用
   */
  type UserStatusKey = NonNullable<User['status']>;

  type UserTypeKey = NonNullable<User['userType']>;
}
