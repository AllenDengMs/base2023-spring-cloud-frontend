<template>
  <n-modal v-model:show="modalVisible" preset="card" :title="title" class="w-700px">
    <n-form
      ref="formRef"
      label-placement="left"
      :label-width="80"
      :model="formModel"
      :rules="type === 'edit' ? editRules : addRules"
    >
      <n-grid :cols="24" :x-gap="18">
        <n-form-item-grid-item :span="12" label="登录账号" path="username">
          <n-input v-model:value="formModel.username" :disabled="type === 'edit'" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="密码" path="password">
          <n-input v-model:value="formModel.password" clearable />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="账号类型" path="userType">
          <n-select v-model:value="formModel.userType" :options="userTypeOptions" :disabled="type === 'edit'" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="角色" path="roleId">
          <n-select
            v-model:value="formModel.roleId"
            filterable
            placeholder="请选择角色"
            :options="roleIdOptions"
            clearable
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="昵称" path="nickname">
          <n-input v-model:value="formModel.nickname" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="性别" path="gender">
          <n-radio-group v-model:value="formModel.gender">
            <n-radio v-for="item in genderOptions" :key="item.value" :value="item.value">{{ item.label }}</n-radio>
          </n-radio-group>
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="手机号" path="phone">
          <n-input v-model:value="formModel.phone" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="邮箱" path="email">
          <n-input v-model:value="formModel.email" clearable />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="状态" path="status">
          <n-select v-model:value="formModel.status" :options="userStatusOptions" />
        </n-form-item-grid-item>
      </n-grid>
      <n-space class="w-full pt-16px" :size="24" justify="end">
        <n-button class="w-72px" @click="closeModal">取消</n-button>
        <n-button class="w-72px" type="primary" @click="handleSubmit">确定</n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import type { FormInst, FormItemRule, SelectOption } from 'naive-ui';
import { genderOptions, userStatusOptions, userTypeOptions } from '@/constants';
import { addUser, updateUser, findAllRoles } from '@/service';
import { formRules, createRequiredFormRule, notRequired } from '@/utils';

export interface Props {
  /** 弹窗可见性 */
  visible: boolean;
  /**
   * 弹窗类型
   * add: 新增
   * edit: 编辑
   */
  type?: 'add' | 'edit';
  /** 编辑的表格行数据 */
  editData?: UserManagement.User | null;
}

export type ModalType = NonNullable<Props['type']>;

defineOptions({ name: 'TableActionModal' });

const props = withDefaults(defineProps<Props>(), {
  type: 'add',
  editData: null
});

interface Emits {
  (e: 'update:visible', visible: boolean): void;
}

const emit = defineEmits<Emits>();

const modalVisible = computed({
  get() {
    return props.visible;
  },
  set(visible) {
    emit('update:visible', visible);
  }
});
const closeModal = () => {
  modalVisible.value = false;
};

const title = computed(() => {
  const titles: Record<ModalType, string> = {
    add: '添加用户',
    edit: '编辑用户'
  };
  return titles[props.type];
});

const formRef = ref<HTMLElement & FormInst>();

type FormModel = Pick<
  UserManagement.User,
  'nickname' | 'password' | 'username' | 'userType' | 'gender' | 'phone' | 'email' | 'status' | 'roleId'
>;

const formModel = reactive<FormModel>(createDefaultFormModel());

const addRules: Record<keyof FormModel, FormItemRule | FormItemRule[]> = {
  nickname: createRequiredFormRule('请输入用户名'),
  gender: notRequired(),
  phone: formRules.phone,
  email: formRules.email,
  status: createRequiredFormRule('请选择用户状态'),
  password: createRequiredFormRule('请输入密码'),
  username: createRequiredFormRule('请输入用户名'),
  userType: createRequiredFormRule('请选择用户类型'),
  roleId: createRequiredFormRule('请选择角色')
};

const editRules: Record<keyof FormModel, FormItemRule | FormItemRule[]> = {
  nickname: createRequiredFormRule('请输入用户名'),
  gender: notRequired(),
  phone: formRules.phone,
  email: formRules.email,
  status: createRequiredFormRule('请选择用户状态'),
  password: notRequired(),
  username: createRequiredFormRule('请输入用户名'),
  userType: createRequiredFormRule('请选择用户类型'),
  roleId: createRequiredFormRule('请选择角色')
};

const roleIdOptions = ref<SelectOption[]>([]);

function createDefaultFormModel(): FormModel {
  return {
    nickname: '',
    password: '',
    username: '',
    userType: null,
    gender: null,
    phone: '',
    email: null,
    status: null,
    roleId: null
  };
}

function handleUpdateFormModel(model: Partial<FormModel>) {
  Object.assign(formModel, model);
}

let hasInitRoleOptions = false;
function initRoleOptions() {
  if (hasInitRoleOptions) {
    return;
  }

  findAllRoles().then(allRoles => {
    allRoles.forEach(role =>
      roleIdOptions.value.push({
        label: role.roleName,
        value: role.roleId
      })
    );
  });

  hasInitRoleOptions = true;
}

function handleUpdateFormModelByModalType() {
  const handlers: Record<ModalType, () => void> = {
    add: () => {
      initRoleOptions();
      const defaultFormModel = createDefaultFormModel();
      handleUpdateFormModel(defaultFormModel);
    },
    edit: () => {
      initRoleOptions();
      if (props.editData) {
        handleUpdateFormModel(props.editData);
      }
    }
  };

  handlers[props.type]();
}

async function handleSubmit() {
  await formRef.value?.validate();

  if (props.type === 'add') {
    await addUser(formModel).then(res => {
      if (!res.error) {
        window.$message?.success('新增成功!');
      }
    });
  } else if (props.type === 'edit') {
    const updateUserParam: object = {
      nickname: null,
      password: null,
      gender: null,
      phone: null,
      email: null,
      status: null,
      roleId: null,
      userId: null
    };
    Object.keys(updateUserParam).forEach(key => {
      updateUserParam[key] = formModel[key];
    });
    updateUserParam.userId = props.editData?.userId;
    await updateUser(updateUserParam).then(res => {
      if (!res.error) {
        window.$message?.success('更新信息成功!');
      }
    });
  }

  closeModal();
}

watch(
  () => props.visible,
  newValue => {
    if (newValue) {
      handleUpdateFormModelByModalType();
    }
  }
);
</script>

<style scoped></style>
