import { defineStore } from 'pinia';
import { ROOT_ROUTE, constantRoutes, router, routes as allRoutes } from '@/router';
import { getUIPermissionByRoleId } from '@/service';
import {
  localStg,
  filterAuthRoutesByUserPermission,
  getCacheRoutes,
  getConstantRouteNames,
  transformAuthRouteToVueRoutes,
  transformAuthRouteToVueRoute,
  transformAuthRouteToMenu,
  transformAuthRouteToSearchMenus,
  transformRouteNameToRoutePath,
  transformRoutePathToRouteName,
  sortRoutes
} from '@/utils';
import { useAuthStore } from '../auth';
import { useTabStore } from '../tab';

interface RouteState {
  /**
   * 权限路由模式:
   * - static - 前端声明的静态
   * - dynamic - 后端返回的动态
   */
  authRouteMode: ImportMetaEnv['VITE_AUTH_ROUTE_MODE'];
  /** 是否初始化了权限路由 */
  isInitAuthRoute: boolean;
  /** 路由首页name(前端静态路由时生效，后端动态路由该值会被后端返回的值覆盖) */
  routeHomeName: AuthRoute.AllRouteKey;
  /** 菜单 */
  menus: App.GlobalMenuOption[];
  /** 搜索的菜单 */
  searchMenus: AuthRoute.Route[];
  /** 缓存的路由名称 */
  cacheRoutes: string[];
}

export const useRouteStore = defineStore('route-store', {
  state: (): RouteState => ({
    authRouteMode: import.meta.env.VITE_AUTH_ROUTE_MODE,
    isInitAuthRoute: false,
    routeHomeName: transformRoutePathToRouteName(import.meta.env.VITE_ROUTE_HOME_PATH),
    menus: [],
    searchMenus: [],
    cacheRoutes: []
  }),
  actions: {
    /** 重置路由的store */
    resetRouteStore() {
      this.resetRoutes();
      this.$reset();
    },
    /** 重置路由数据，保留固定路由 */
    resetRoutes() {
      const routes = router.getRoutes();
      routes.forEach(route => {
        const name = (route.name || 'root') as AuthRoute.AllRouteKey;
        if (!this.isConstantRoute(name)) {
          router.removeRoute(name);
        }
      });
    },
    /**
     * 是否是固定路由
     * @param name 路由名称
     */
    isConstantRoute(name: AuthRoute.AllRouteKey) {
      const constantRouteNames = getConstantRouteNames(constantRoutes);
      return constantRouteNames.includes(name);
    },
    /**
     * 是否是有效的固定路由
     * @param name 路由名称
     */
    isValidConstantRoute(name: AuthRoute.AllRouteKey) {
      const NOT_FOUND_PAGE_NAME: AuthRoute.NotFoundRouteKey = 'not-found';
      const constantRouteNames = getConstantRouteNames(constantRoutes);
      return constantRouteNames.includes(name) && name !== NOT_FOUND_PAGE_NAME;
    },
    /**
     * 处理权限路由
     * @param routes - 权限路由
     */
    handleAuthRoute(routes: AuthRoute.Route[]) {
      (this.menus as App.GlobalMenuOption[]) = transformAuthRouteToMenu(routes);
      this.searchMenus = transformAuthRouteToSearchMenus(routes);

      const vueRoutes = transformAuthRouteToVueRoutes(routes);

      vueRoutes.forEach(route => {
        router.addRoute(route);
      });

      this.cacheRoutes = getCacheRoutes(vueRoutes);
    },
    /** 动态路由模式下：更新根路由的重定向 */
    handleUpdateRootRedirect(routeKey: AuthRoute.AllRouteKey) {
      if (routeKey === 'root' || routeKey === 'not-found') {
        throw new Error('routeKey的值不能为root或者not-found');
      }
      const rootRoute: AuthRoute.Route = { ...ROOT_ROUTE, redirect: transformRouteNameToRoutePath(routeKey) };
      const rootRouteName: AuthRoute.AllRouteKey = 'root';
      router.removeRoute(rootRouteName);
      const rootVueRoute = transformAuthRouteToVueRoute(rootRoute)[0];
      router.addRoute(rootVueRoute);
    },
    /** 初始化动态路由 */
    async initDynamicRoute() {
      const { resetAuthStore } = useAuthStore();
      const { initHomeTab } = useTabStore();

      const { userId, userRole, permissions } = localStg.get('userInfo') || {};

      if (!userId) {
        throw new Error('userId 不能为空!');
      }
      if (!userRole) {
        throw new Error('userRole 不能为空!');
      }

      let authRoutes = null;
      if (userRole !== 'super') {
        if (!permissions) {
          // 无权限，退回登陆页面
          resetAuthStore();
          return;
        }

        if (!permissions || !permissions.routePermissions || permissions.routePermissions.length === 0) {
          // 无权限，退回登陆页面
          resetAuthStore();
        }
        authRoutes = filterAuthRoutesByUserPermission(allRoutes, new Set(permissions.routePermissions), userRole);
      } else {
        // 超级管理员不过滤权限
        authRoutes = allRoutes;
      }
      this.routeHomeName = 'dashboard_analysis';
      this.handleUpdateRootRedirect(this.routeHomeName); // 跳转到首页
      this.handleAuthRoute(sortRoutes(authRoutes));

      initHomeTab(this.routeHomeName, router);

      this.isInitAuthRoute = true;
    },
    /** 初始化静态路由 */
    async initStaticRoute() {
      const { initHomeTab } = useTabStore();

      const routes = allRoutes;
      this.handleAuthRoute(routes);

      initHomeTab(this.routeHomeName, router);

      this.isInitAuthRoute = true;
    },
    /** 初始化权限路由 */
    async initAuthRoute() {
      if (this.authRouteMode === 'dynamic') {
        await this.initDynamicRoute();
      } else {
        await this.initStaticRoute();
      }
    },

    /** 从缓存路由中去除某个路由 */
    removeCacheRoute(name: AuthRoute.AllRouteKey) {
      const index = this.cacheRoutes.indexOf(name);
      if (index > -1) {
        this.cacheRoutes.splice(index, 1);
      }
    },

    /** 添加某个缓存路由 */
    addCacheRoute(name: AuthRoute.AllRouteKey) {
      const index = this.cacheRoutes.indexOf(name);
      if (index === -1) {
        this.cacheRoutes.push(name);
      }
    }
  }
});
