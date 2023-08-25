/**
 * 根据用户权限过滤路由
 * @param routes - 权限路由
 * @param permission - 权限
 */
export function filterAuthRoutesByUserPermission(routes: AuthRoute.Route[], permissions: Set<string>, roleId: string) {
  return routes.map(route => filterAuthRouteByUserPermission(route, permissions, roleId)).flat(1);
}

/**
 * 根据用户权限过滤单个路由
 * @param route - 单个权限路由
 * @param permission - 权限
 */
function filterAuthRouteByUserPermission(
  route: AuthRoute.Route,
  permissions: Set<string>,
  roleId: string
): AuthRoute.Route[] {
  const filterRoute = { ...route };
  const hasPermission = roleId === 'super' || permissions.has(route.name);

  if (filterRoute.children) {
    const filterChildren = filterRoute.children
      .map(item => filterAuthRouteByUserPermission(item, permissions, roleId))
      .flat(1);
    Object.assign(filterRoute, { children: filterChildren });
  }
  return hasPermission ? [filterRoute] : [];
}
