<template>
  <div>
    <n-card title="用户管理" :bordered="false" class="rounded-16px shadow-sm">
      <n-space class="pb-12px" justify="space-between">
        <n-space>
          <n-button v-if="hasPermission('UserManagement.addUser')" type="primary" @click="handleAddTable">
            <icon-ic-round-plus class="mr-4px text-16px" />
            新增
          </n-button>
        </n-space>
        <n-space align="center" :size="18">
          <n-button size="small" type="primary" @click="getTableData(1, pagination.pageSize)">
            <icon-mdi-refresh class="mr-4px text-16px" :class="{ 'animate-spin': loading }" />
            刷新表格
          </n-button>
          <!-- 表格列设置 -->
          <column-setting v-model:columns="userTableColumns" />
        </n-space>
      </n-space>
      <n-data-table
        :remote="true"
        :columns="userTableColumns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
      />
      <table-action-modal v-model:visible="visible" :type="modalType" :edit-data="editData" />
    </n-card>
  </div>
</template>

<script setup lang="tsx">
import { reactive, ref, onMounted } from 'vue';
import type { Ref } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag, Column } from 'naive-ui';
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import { genderLabels, userStatusLabels } from '@/constants';
import { fetchUserList } from '@/service';
import { usePermission } from '@/composables';
import { useBoolean, useLoading } from '@/hooks';
import { adapter } from '@/utils';
import { adapterOfFetchUserList } from '@/service/api/management.adapter';
import TableActionModal from './components/table-action-modal.vue';
import type { ModalType } from './components/table-action-modal.vue';
import ColumnSetting from './components/column-setting.vue';

const { loading, startLoading, endLoading } = useLoading(false);
const { bool: visible, setTrue: openModal } = useBoolean();
const { hasPermission } = usePermission();

const userTableColumns: Ref<DataTableColumns<UserManagement.User>> = ref([
  {
    type: 'selection',
    align: 'center'
  },
  {
    key: 'userId',
    title: '用户编号',
    align: 'center'
  },
  {
    key: 'nickname',
    title: '用户名',
    align: 'center'
  },
  {
    key: 'username',
    title: '登陆账号',
    align: 'center'
  },
  {
    key: 'gender',
    title: '性别',
    align: 'center',
    render: row => {
      if (row.gender) {
        const tagTypes: Record<UserManagement.GenderKey, NaiveUI.ThemeColor> = {
          2: 'success',
          1: 'warning'
        };

        return <NTag type={tagTypes[row.gender]}>{genderLabels[row.gender]}</NTag>;
      }

      return <span></span>;
    }
  },
  {
    key: 'phone',
    title: '手机号码',
    align: 'center'
  },
  {
    key: 'email',
    title: '邮箱',
    align: 'center'
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    render: row => {
      if (row.status) {
        const tagTypes: Record<UserManagement.UserStatusKey, NaiveUI.ThemeColor> = {
          '1': 'success',
          '2': 'error',
          '3': 'warning',
          '4': 'default'
        };

        return <NTag type={tagTypes[row.status]}>{userStatusLabels[row.status]}</NTag>;
      }
      return <span></span>;
    }
  },
  {
    key: 'actions',
    title: '操作',
    align: 'center',
    render: row => {
      return (
        <NSpace justify={'center'}>
          {hasPermission('UserManagement.updateUser') ? (
            <NButton size={'small'} onClick={() => handleEditTable(row.key)}>
              编辑
            </NButton>
          ) : (
            ''
          )}

          <NPopconfirm onPositiveClick={() => handleDeleteTable(row.key)}>
            {{
              default: () => '确认删除',
              trigger: () => <NButton size={'small'}>删除</NButton>
            }}
          </NPopconfirm>
        </NSpace>
      );
    }
  }
]) as Ref<DataTableColumns<UserManagement.User>>;

const modalType = ref<ModalType>('add');

function setModalType(type: ModalType) {
  modalType.value = type;
}

const editData = ref<UserManagement.User | null>(null);

function setEditData(data: UserManagement.User | null) {
  editData.value = data;
}

function handleAddTable() {
  openModal();
  setModalType('add');
}

function handleDeleteTable(rowId: string) {
  window.$message?.info(`点击了删除，userId为${rowId}`);
}

const tableData = ref<UserManagement.User[]>([]);

const pagination: PaginationProps = reactive({
  page: 1,
  pageSize: 5,
  showSizePicker: true,
  pageSizes: [5, 10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
    getTableData(pagination.page, pagination?.pageSize);
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    getTableData(pagination.page, pagination?.pageSize);
  }
});

async function getTableData(page: number | undefined, pageSize: number | undefined) {
  startLoading();
  const res = await fetchUserList({ currentPage: page ? page : 1, size: pageSize ? pageSize : 10 });

  if (!res.error) {
    const { data: userList } = adapter(adapterOfFetchUserList, res);
    tableData.value = userList ?? [];

    pagination.page = page ? page : 1;
    pagination.pageSize = pageSize ? pageSize : 10;
    pagination.itemCount = Number(res?.data?.total ?? 0);
  }
  endLoading();
}

function handleEditTable(rowId: string) {
  const findItem = tableData.value.find(item => item.userId === rowId);

  if (findItem) {
    setEditData(findItem);
  }
  setModalType('edit');
  openModal();
}

// 初始化
onMounted(async () => {
  await getTableData(1, pagination?.pageSize);
});
</script>

<style scoped></style>
