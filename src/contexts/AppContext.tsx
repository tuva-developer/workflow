import { createContext } from "react";

export interface AppContextType {
  debugData: unknown;
  templateSelected: Template;
  confirmDialog: Confirm;
  recentModels: ModelSummary[];
  isLoading: boolean;

  setDebugData: React.Dispatch<React.SetStateAction<unknown>>;
  setTemplateSelected: (template: Template) => void;
  addRecentModel: (model: ModelSummary) => void;
  openConfirm: (confirm: ConfirmOpen) => void;
  closeConfirm: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);