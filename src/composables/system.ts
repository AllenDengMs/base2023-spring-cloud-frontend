import UAParser from 'ua-parser-js';
import { useAuthStore } from '@/store';
import { isArray, isString } from '@/utils';

interface AppInfo {
  /** 项目名称 */
  name: string;
  /** 项目标题 */
  title: string;
  /** 项目描述 */
  desc: string;
}

/** 项目信息 */
export function useAppInfo(): AppInfo {
  const { VITE_APP_NAME: name, VITE_APP_TITLE: title, VITE_APP_DESC: desc } = import.meta.env;

  return {
    name,
    title,
    desc
  };
}

/** 获取设备信息 */
export function useDeviceInfo() {
  const parser = new UAParser();
  const result = parser.getResult();
  return result;
}

/** 权限判断 */
export function usePermission() {
  const auth = useAuthStore();

  function hasPermission(permissionKey: string) {
    const { userRole, permissions } = auth.userInfo;
    if (userRole === 'super') {
      return true;
    }

    const buttonPermissionsOfUser = permissions && permissions.buttonPermissions ? permissions.buttonPermissions : null;
    if (buttonPermissionsOfUser === null || buttonPermissionsOfUser.length === 0) {
      return false;
    }

    return buttonPermissionsOfUser.includes(permissionKey);
  }

  function hasRoutePermission(routeName: string | null | undefined) {
    if (!routeName) {
      return false;
    }

    const { userRole, permissions } = auth.userInfo;
    if (userRole === 'super') {
      return true;
    }

    const routePermissionsOfUser = permissions && permissions.routePermissions ? permissions.routePermissions : null;
    if (routePermissionsOfUser === null || routePermissionsOfUser.length === 0) {
      return false;
    }

    return routePermissionsOfUser.includes(routeName);
  }

  return {
    hasPermission,
    hasRoutePermission
  };
}
