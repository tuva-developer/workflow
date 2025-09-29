export function saveXML(xml, fileNameToExport) {
  if (!xml) {
    throw new Error('Can not Export. XML is undefined.');
  }

  const blob = new Blob([xml], { type: 'application/xml' });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileNameToExport + '.bpmn';
  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export const parseMongoIdToTime = (objectId: string): Date => {
  if (!/^[a-fA-F0-9]{24}$/.test(objectId)) {
    throw new Error('Invalid MongoDB ObjectId format');
  }

  const timestampHex = objectId.substring(0, 8);

  const timestamp = parseInt(timestampHex, 16);

  return new Date(timestamp * 1000);
}

export const formatDate = (s?: string) => {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

export function getRuntimeConfig(): RuntimeConfig {
  const cfg = window.VBD_WORKFLOW_CONFIG ?? {};
  return {
    API_BASE_URL: cfg.API_BASE_URL ?? '/api',
    SECURE_FLAG: cfg.SECURE_FLAG ?? false,
  };
}

export const RoleColors: Record<"light" | "dark", Record<string, string>> = { light: { User: "#3f5c78", Editor: "#a15c00", Executor: "#2f6f4f", Admin: "#8a2e2e", Invoker: "#5c6e2f", SuperAdmin: "#553c9a", }, dark: { User: "#60A5FA", Editor: "#F59E0B", Executor: "#34D399", Admin: "#F87171", Invoker: "#A3E635", SuperAdmin: "#C084FC", }, };

export const defaultUser: User = {
  userId: '',
  roles: [],
  joined_at: '',
  updated_at: '',
  permissions: [],
  tenantId: '',
};

export const defaultGroup: Group = {
  name: '',
  description: '',
  created_at: '',
  updated_at: '',
  members: [],
  _id: '',
};


export const defaultModel: Model = {
  name: '',
  description: '',
  status: '',
  _id: '',
  _id_version: '',
  config: '',
  read_only: false,
  categoryId: '',
  typeId: '',
  owner: '',
  created_at: '',
  updated_at: '',
};

export const defaultTemplate: Template = {
  name: '',
  config: '',
  description: '',
  _id: '',
};

export const defaultFormConfig: FormConfig = {
  name: '',
  config: '',
  description: '',
  _id: '',
};

export const defaultInstance: Instance = {
  _id: '',
  _id_version: '',
  _id_model: '',
  executor: '',
  data: {
    duration: 0,
    activity: [],
    flow: [],
    wait: [],
    globalData: {},
    executed: [],
  },
  model: '',
  status: '',
  input: {},
  logs: [],
  end_time: 0,
  created_at: '',
  updated_at: '',
  workflow: '',
};

export const defaultTask: Task = {
  activityId: '',
  processId: '',
  index: 0,
  assigneeType: '',
  status: '',
  form: '',
  formName: '',
  assigneeId: '',
  instanceId: '',
  taskId: '',
  created_at: '',
  updated_at: '',
};

export const defaultModelType: ModelType = {
  name: '',
  description: '',
  _id: '',
  created_at: '',
  updated_at: '',
};

export const defaultModelCategory: ModelCategory = {
  name: '',
  description: '',
  _id: '',
  created_at: '',
  updated_at: '',
};

export const defaultItemExecute: ItemExecute = {
  assigneeId: '',
  assigneeType: '',
  formName: '',
  id: '',
  index: 0,
  processId: '',
  taskId: '',
};

export const defaultMultipartEntry: MultipartEntry = {
  key: 'field1',
  type: 'text',
  value: '',
};

export const defaultConfirm: Confirm = {
  isOpen: false,
  onClose: () => { },
  onOk: () => { },
  message: '',
};