<template>
  <div>
    <n-grid x-gap="5" :cols="3">
      <n-gi>
        <n-card title="角色">
          <!-- <template #header-extra>添加</template> -->
          <n-space vertical :size="12">
            <n-input v-model:value="searchRoleContent" placeholder="搜索" />
            <n-tree
              :show-irrelevant-nodes="false"
              :pattern="searchRoleContent"
              :node-props="roleListNodeProps"
              :selected-keys="selectedRoles"
              :data="roles"
              block-line
            />
          </n-space>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="页面权限">
          <n-tree
            block-line
            cascade
            checkable
            :data="routeTree"
            :checked-keys="checkRoutePermissionKeys"
            @update:checked-keys="updateRouteTreeCheckedKeys"
          />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="页面内容权限">
          <template #header-extra>
            <!-- <n-checkbox v-model:checked="checkAllButtonPermissionsBoxValue">全选</n-checkbox> -->
          </template>
          <n-collapse>
            <n-collapse-item
              v-for="(permissionList, index) in buttonPermissionList"
              :key="index"
              :name="index"
              :title="permissionList.listTitle"
            >
              <n-checkbox-group v-model:value="checkButtonPermissions" @update:value="handleUpdateButtonPermissions">
                <n-space item-style="display: flex;">
                  <n-checkbox
                    v-for="permission in permissionList.permissions"
                    :key="permission.code"
                    :value="permission.code"
                    :label="permission.title"
                  />
                </n-space>
              </n-checkbox-group>
            </n-collapse-item>
          </n-collapse>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import type { TreeOption } from 'naive-ui';
import { routes as allRoutes } from '@/router';
import { findAllRoles, getUIPermissionByRoleId, saveRolePermision, fetchUserInfo } from '@/service';
import { localStg } from '@/utils';

const message = useMessage();
let currentRoleId = '';
const checkRoutePermissionKeys = ref<string[]>([]);
const checkButtonPermissions = ref<string[]>([]);
const selectedRoles = ref<string[]>([]);
const rolePermission: ApiRole.SaveRolePermissionParam = {
  roleId: '',
  apiPermissions: [],
  uiPermissions: {
    routePermissions: [],
    buttonPermissions: []
  }
};
async function savePermissions() {
  rolePermission.roleId = currentRoleId;
  const { data } = await saveRolePermision(rolePermission);
  if (data) {
    await refreshCurrentUserInfo();
    message.success('权限已更新！');
  }
}

/** 如果变更了当前用户的角色的权限，则刷新前端缓存的用户数据 */
async function refreshCurrentUserInfo() {
  const userInfo = localStg.get('userInfo');
  const userRole = userInfo?.userRole;
  if (userRole && userRole === currentRoleId) {
    const { data } = await fetchUserInfo();
    if (data) {
      localStg.set('userInfo', data);
    }
  }
}

// ------------------- 角色 -------------------
const roles = ref<TreeOption[]>([]);
const searchRoleContent = ref('');

async function initRoleList() {
  const roleList = await findAllRoles();
  roleList.forEach(r => {
    roles.value.push({
      key: r.roleId,
      label: r.roleName
    });
  });
  if (roleList && roleList.length > 1) {
    const role = roleList[0];
    selectedRoles.value = [role.roleId];
    await initRoleRoutePermission(role.roleId);
  }
}

// 点击角色，加载页面权限
async function initRoleRoutePermission(roleId: string) {
  currentRoleId = roleId;
  // 先清空数据
  checkRoutePermissionKeys.value = [];
  checkButtonPermissions.value = [];
  // 查数据库，查到数据再回填
  const data = await getUIPermissionByRoleId(roleId);
  if (data && data.permissions) {
    rolePermission.uiPermissions = data.permissions;
    checkRoutePermissionKeys.value = rolePermission.uiPermissions.routePermissions
      ? rolePermission.uiPermissions.routePermissions
      : [];
    checkButtonPermissions.value = rolePermission.uiPermissions.buttonPermissions
      ? rolePermission.uiPermissions.buttonPermissions
      : [];
  }
}
const roleListNodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick() {
      initRoleRoutePermission(option.key as string);
      selectedRoles.value = [option.key as string];
    }
  };
};

// ------------------- 页面权限 -------------------
function createRouteTreeNode(route: AuthRoute.Route) {
  const treeNode: TreeOption = {};
  treeNode.key = route.name;
  treeNode.label = route.meta.title;
  if (route.children && route.children.length > 0) {
    treeNode.children = [];
    for (const r of route.children) {
      treeNode.children.push(createRouteTreeNode(r));
    }
  }
  return treeNode;
}
function createRouteNodeTree() {
  const tree: TreeOption[] = [];
  allRoutes.forEach(route => tree.push(createRouteTreeNode(route)));
  return tree;
}

const routeTree = createRouteNodeTree();
// 用户更改权限
const updateRouteTreeCheckedKeys = (keys: Array<string | number>) => {
  if (currentRoleId === 'super') {
    message.error('超级管理员拥有所用权限，无需更改！');
    return;
  }

  if (!rolePermission.uiPermissions) {
    rolePermission.uiPermissions = {
      routePermissions: []
    };
  }
  rolePermission.uiPermissions.routePermissions = keys;
  checkRoutePermissionKeys.value = keys;
  savePermissions();
};

// --------------- 页面内容权限 -------------
const checkAllButtonPermissionsBoxValue = ref(false);
interface ButtonPermissionNode {
  listTitle: string;
  permissions: Auth.ButtonPermission[];
}

function createButtonPermissionNode(route: AuthRoute.Route, nodes: ButtonPermissionNode[], listTitle: string | null) {
  const finalListTitle = listTitle ? listTitle.concat(' > ', route.meta.title) : route.meta.title;
  if (route.children && route.children.length > 0) {
    for (const r of route.children) {
      createButtonPermissionNode(r, nodes, finalListTitle);
    }
  } else {
    const buttonPermissions = route.meta.buttonPermissions ? route.meta.buttonPermissions : [];
    if (buttonPermissions.length > 0) {
      const node: ButtonPermissionNode = {
        listTitle: finalListTitle,
        permissions: buttonPermissions
      };
      nodes.push(node);
    }
  }
}
function createButtonPermissionList() {
  const nodes: ButtonPermissionNode[] = [];
  allRoutes.forEach(route => {
    createButtonPermissionNode(route, nodes, null);
  });
  return nodes;
}
function createButtonPermissionMap(buttonPermissionList: ButtonPermissionNode[]) {
  const map = new Map();
  buttonPermissionList.forEach(list => {
    list.permissions.forEach(permission => {
      map.set(permission.code, permission.apiPaths);
    });
  });
  return map;
}
const buttonPermissionList: ButtonPermissionNode[] = createButtonPermissionList();
const buttonPermissionMap = createButtonPermissionMap(buttonPermissionList);

function handleUpdateButtonPermissions(value: (string | number)[]) {
  if (currentRoleId === 'super') {
    message.error('超级管理员拥有所用权限，无需更改！');
    return;
  }

  checkButtonPermissions.value = value;
  rolePermission.uiPermissions.buttonPermissions = value;
  const apiPaths: Auth.ApiPath[] = [];
  value.forEach(code => {
    const paths = buttonPermissionMap.get(code);
    if (paths) {
      paths.forEach(element => {
        apiPaths.push(element);
      });
    }
  });
  rolePermission.apiPermissions = apiPaths;
  savePermissions();
}

// ---------- 初始化数据 ---------
// 生命周期钩子
onMounted(() => {
  initRoleList();
});
</script>

<style scoped></style>
