export type ModelsVariant = 'all' | 'editable' | 'execute';

export type ModelQuery = {
  hasConfig?: boolean;
  limit?: number;
  page?: number;
  search?: string;
  categoryId?: string;
  typeId?: string;
  owner?: string;
  readOnly?: boolean;
  sortBy?: string;
  orderBy?: string;
};

export type PagedModels = {
  items: Model[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type CreateModelInput = {
  name: string;
  categoryId: string;
  typeId: string;
  xml: string;
};

export type UpdateModelInput = {
  id: string;
  params?: { rename?: string; typeId?: string; categoryId?: string };
  xml?: string | null;
};

export type DeleteModelInput = { id: string };

export type SetReadOnlyInput = { id: string; readOnly: boolean };


export type ModelPermissionBlock = {
  users: string[];
  groups: string[];
};

export type ModelPermission = {
  edit: ModelPermissionBlock;
  execute: ModelPermissionBlock;
};

export interface InstanceQuery {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  executor?: string;
  sortBy?: string;
  orderBy?: string;
  modelId?: string;
}

export interface PagedInstances {
  items: Instance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type DeleteInstanceInput = { instanceId: string };

export type InvokeItemInput = { instanceId: string; items: ItemExecute };

export type DebugInvokeInput = { instanceId: string; items: ItemExecute };

export type UserQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
  roles?: string;
};

export type PagedUsers = {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type CreateUserInput = {
  username: string;
  password: string;
  fullname: string;
  email: string;
  phone: string;
  address: string;
};

export type UpdateUserInput = {
  userId: string;
  tenantId?: string;
  new_password?: string;
  fullname: string;
  email: string;
  phone: string;
  address: string;
};

export type DeleteUserInput = { userId: string, tenantId: string };

export type UpdateUserRoleInput = { userId: string; tenantId:string, roles: UserRole[] };

export type GroupQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
};

export type PagedGroups = {
  items: Group[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type AddGroupInput = {
  name: string;
  description: string;
};

export type UpdateGroupInput = {
  id: string,
  name: string,
  description: string,
  members?: string[]
}

export type DeleteGroupInput = { groupId: string };

export type ModelTypeQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
};

export type PagedModelTypes = {
  items: ModelType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type AddModelTypeInput = {
  name: string;
  description: string;
};

export type UpdateModelTypeInput = {
  modelTypeId: string,
  name: string,
  description: string,
}

export type DeleteModelTypeInput = { modelTypeId: string };

export type ModelCategoryQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
};

export type PagedModelCategories = {
  items: ModelCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type AddModelCategoryInput = {
  name: string;
  description: string;
};

export type UpdateModelCategoryInput = {
  modelCategoryId: string,
  name: string,
  description: string,
}

export type DeleteModelCategoryInput = { modelCategoryId: string };

export type TaskQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  userId?: string;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
}

export type PagedTasks = {
  items: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ScheduleQuery = {
  page?: number;
  limit?: number;
  search?: string;
  modelId?: string;
  owner?: string,
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
}

export type PagedSchedules = {
  items: Schedule[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type AddScheduleInput = {
  modelId: string,
  name: string,
  type: string,
  description: string,
  cron: string,
  once: boolean,
  active: boolean,
  data?: unknown,
};

export type UpdateScheduleInput = {
  scheduleId: string,
  name?: string,
  type?: string,
  description?: string,
  cron?: string,
  once?: boolean,
  active?: boolean,
  data?: unknown,
}

export type DeleteScheduleInput = { scheduleId: string };

export type FormQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
}

export type PagedForms = {
  items: FormConfig[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type AddFormInput = {
  name: string,
  formSchema: unknown,
};

export type UpdateFormInput = {
  id: string,
  formSchema: unknown,
}

export type DeleteFormInput = { formName?: string, formId?: string };

export type AIChatInput = { modelName: string, message: string };

export type ChangePassWordInput = { oldPassword: string, newPassword: string }

export interface DebugModelInput {
  modelId: string;
  data?: object;
}

export interface DebugModelWithFileInput {
  modelId: string;
  file: File;
}

export interface DebugModelWithMultipartInput {
  modelId: string;
  formData: FormData;
}

export interface RunModelInput {
  modelId: string;
  data?: object;
}

export interface RunModelWithFileInput {
  modelId: string;
  file: File;
}

export interface RunModelWithMultipartInput {
  modelId: string;
  formData: FormData;
}

export type TemplateQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
  role?: string;
};

export type PagedTemplates = {
  items: Template[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type AddTemplateInput = {
  name: string,
  description?: string,
  config: unknown,
};

export type DeleteTemplateInput = { templateId: string };

export interface RemoteFunction {
  _id: string;
  name: string;
  description?: string;
  script: string;
  created_at?: string;
  updated_at?: string;
}

export interface PagedRemoteFunctions {
  items: RemoteFunction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}