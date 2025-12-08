type RuntimeConfig = {
  API_BASE_URL: string;
  SECURE_FLAG: boolean;
  VERSION: string;
};

type MultipartEntry = {
  key: string;
  type: 'file' | 'text';
  value: File | string | null;
};

type BodyType = 'none' | 'raw' | 'binary' | 'form-data';

type BodyData = Record<string, unknown> | File | MultipartEntry[];

type ReadOnlyFilter = "all" | "true" | "false";

type UserRole =
  | "User"
  | "Executor"
  | "Editor"
  | "Invoker"
  | "Admin"
  | "SuperAdmin";

type User = {
  userId: string;
  roles: UserRole[];
  created_at: string;
  updated_at: string;
  email?: string;
  phone?: string;
  address?: string;
  fullname?: string;
  permissions?: string[];
  tenantId: string;
}

type Group = {
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  members: string[];
  _id: string;
}

type Model = {
  name: string;
  description: string;
  status: string;
  _id: string;
  _id_version: string;
  config: string;
  read_only: boolean;
  categoryId: string;
  typeId: string;
  owner: string;
  created_at: string;
  updated_at: string;
}

type ModelSummary = {
  id: string;
  name: string;
}

type Template = {
  name: string;
  config: string;
  description: string;
  _id: string;
}

type FormConfig = {
  name: string;
  config: string;
  description: string;
  _id: string;
}

type InstanceData = {
  duration: number;
  activity: unknown[];
  flow: unknown[];
  wait: ItemExecute[];
  globalData: unknown;
  executed: unknown[];
}

type Instance = {
  _id: string;
  _id_version: string;
  _id_model: string;
  executor: string;
  data: InstanceData;
  model: string;
  status: string;
  input: unknown;
  logs: Log[];
  end_time: number;
  created_at: string;
  updated_at: string;
  workflow: string;
}

type Log = {
  activityId: string;
  date: string;
  level: string;
  log: string;
}

type Assignee = { user: string } | { group: string }

type Task = {
  activityId: string;
  name: string;
  index: number;
  processId: string;
  status: string;
  form: string;
  formName: string;
  instanceId: string;
  modelId: string;
  taskId: string;
  created_at: string;
  updated_at: string;
  assignee?: Assignee[]
}

type ModelType = {
  name: string;
  description?: string;
  _id: string;
  created_at: string;
  updated_at: string;
  creator?: string;
}

type ModelCategory = {
  name: string;
  description: string;
  _id: string;
  created_at: string;
  updated_at: string;
  creator?: string;
}

type ItemExecute = {
  assigneeId: string;
  assigneeType: string;
  formName: string;
  id: string;
  index: number;
  processId: string;
  taskId: string;
}

type Confirm = {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void | Promise<void>;
  message?: string;
  title?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

type ConfirmOpen = Omit<Confirm, 'isOpen' | 'onClose'> & {
  onClose?: () => void;
};

type Schedule = {
  _id: string;
  modelId: string;
  name: string;
  type?: string;
  description: string;
  creator: string;
  cron: string;
  once: boolean;
  created_at: string;
  updated_at: string;
  input: Record<string, unknown>;
  active: boolean;
}

interface Window {
  VBD_WORKFLOW_CONFIG?: {
    API_BASE_URL?: string;
    SECURE_FLAG?: boolean;
    VERSION?: string;
  };
  ace?: typeof ace;
}

type CanvasWithAuto = Canvas & {
  zoom(
    zoom?: "fit-viewport" | number,
    center?: "auto" | { x: number; y: number }
  ): number | void;
  getRootElement(): BpmnElement | null;
};
