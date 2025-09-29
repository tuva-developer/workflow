type Permission = unknown;

type RuntimeConfig = {
  API_BASE_URL: string;
  SECURE_FLAG: boolean;
  MOCK_MODE: boolean;
};

type MultipartEntry = {
  key: string;
  type: 'file' | 'text';
  value: File | string | null;
};

type BodyType = 'none' | 'raw' | 'binary' | 'form-data';

type BodyData = Record<string, unknown> | File | MultipartEntry[];

type ReadOnlyFilter = "all" | "true" | "false";

interface User {
  userId: string;
  roles: string[];
  joined_at: string;
  updated_at: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  fullname?: string;
  permissions?: Permission[];
  tenantId: string;
}

interface Group {
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  members: string[];
  _id: string;
}

interface Model {
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

interface ModelSummary {
  id: string;
  name: string;
}

interface Template {
  name: string;
  config: string;
  description: string;
  _id: string;
}

interface FormConfig {
  name: string;
  config: string;
  description: string;
  _id: string;
}

interface InstanceData {
  duration: number;
  activity: unknown[];
  flow: unknown[];
  wait: ItemExecute[];
  globalData: unknown;
  executed: unknown[];
}

interface Instance {
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

interface Log {
  activityId: string;
  date: string;
  level: string;
  log: string;
}

interface Task {
  activityId: string;
  processId: string;
  index: number;
  assigneeType: string;
  status: string;
  form: string;
  formName: string;
  assigneeId: string;
  instanceId: string;
  taskId: string;
  created_at: string;
  updated_at: string;
}

interface ModelType {
  name: string;
  description?: string;
  _id: string;
  created_at: string;
  updated_at: string;
  creator?: string;
}

interface ModelCategory {
  name: string;
  description: string;
  _id: string;
  created_at: string;
  updated_at: string;
  creator?: string;
}

interface ItemExecute {
  assigneeId: string;
  assigneeType: string;
  formName: string;
  id: string;
  index: number;
  processId: string;
  taskId: string;
}

interface Confirm {
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

interface Schedule {
  _id: string;
  modelId: string;
  name: string;
  description: string;
  creator: string;
  cron: string;
  once: boolean;
  created_at: string;
  updated_at: string;
  input: unknown;
  active: boolean;
}

interface Window {
  VBD_WORKFLOW_CONFIG?: {
    API_BASE_URL?: string;
    SECURE_FLAG?: boolean;
    MOCK_MODE?: boolean;
  };
  ace?: typeof ace;
}

type CanvasWithAuto = Canvas & {
  zoom(
    zoom?: "fit-viewport" | number,
    center?: "auto" | { x: number; y: number }
  ): number | void;
  getRootElement(): BpmnElement | null;
}
