import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/hooks/useAppContext";
import BodyDataSection from "@/components/common/BodyDataSection";
import { showSuccess, showWarn } from "@/utils/toastConfig";
import { executeTask } from "@/services/tasks";
import { qk } from "@/hooks/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

interface ExecuteTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

const ExecuteTaskDialog = ({
  isOpen,
  onClose,
  taskId,
}: ExecuteTaskDialogProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setIsLoading } = useAppContext();

  const [bodyType, setBodyType] = useState<BodyType>("none");
  const [bodyData, setBodyData] = useState<BodyData>({});

  const qc = useQueryClient();

  const buildJsonPayload = (): unknown | null => {
    switch (bodyType) {
      case "none":
        return {};
      case "raw":
        if (typeof bodyData === "object" && !Array.isArray(bodyData)) {
          return bodyData;
        }
        return null;
      case "form-data":
        if (Array.isArray(bodyData)) {
          const obj: Record<string, unknown> = {};
          for (const entry of bodyData) {
            if (!entry.key || entry.value == null) continue;
            if (entry.type === "file") {
              obj[entry.key] =
                entry.value instanceof File
                  ? entry.value.name
                  : String(entry.value);
            } else {
              obj[entry.key] = String(entry.value);
            }
          }
          return obj;
        }
        return null;
      case "binary":
        return null;
      default:
        return null;
    }
  };

  const handleClickOk = async () => {
      setIsLoading(true);
      try {
        const payload = buildJsonPayload();
        if (payload === null) {
          setIsLoading(false);
          return;
        }
  
        await executeTask(taskId, payload ?? {});
        await qc.invalidateQueries({ queryKey: qk.tasksRoot, exact: false });
  
        showSuccess(t("Task has been executed successfully"));
        onClose();
      } catch {
        showWarn(t("Failed to execute task"));
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        sx={dialogStyles(theme)}
      >
        <DialogTitle>
          <Typography>{t("Input data for task execution")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>
        <DialogContent>
          <BodyDataSection
            bodyType={bodyType}
            setBodyType={setBodyType}
            setBodyData={setBodyData}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickOk} className="blue">
            {t("OK")}
          </Button>
          <Button onClick={onClose} className="red">
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExecuteTaskDialog;
