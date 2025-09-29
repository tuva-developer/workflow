import { useState, useEffect, ReactNode, useCallback } from "react";
import { defaultConfirm, defaultTemplate } from "@/utils/defines";
import { AppContext } from "@/contexts/AppContext";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [debugData, setDebugData] = useState<unknown>(null);
  const [templateSelected, setTemplateSelected] = useState<Template>(defaultTemplate);
  const [confirmDialog, setConfirmDialog] = useState<Confirm>(defaultConfirm);
  const [recentModels, setRecentModels] = useState<ModelSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("recentModels");
    if (saved) {
      setRecentModels(JSON.parse(saved));
    }
  }, []);

  const addRecentModel = useCallback((m: {id: string; name: string}) => {
    setRecentModels(prev => {
      if (prev.some(x => x.id === m.id)) return prev;
      return [m, ...prev].slice(0, 10);
    });
  }, []);

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const openConfirm = (confirm: ConfirmOpen) => {
    setConfirmDialog((prev) => ({
      ...prev,
      ...confirm,
      isOpen: true,
      onClose: () => {
        confirm.onClose?.();
        closeConfirm();
      },
    }));
  };

  return (
    <AppContext.Provider
      value={{
        debugData,
        templateSelected,
        confirmDialog,
        recentModels,
        isLoading,
        setDebugData,
        setTemplateSelected,
        addRecentModel,
        openConfirm,
        closeConfirm,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};