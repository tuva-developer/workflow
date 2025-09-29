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
import FormInputDialog from "@/components/dialogs/FormInputDlg";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import BodyDataSection from "@/components/common/BodyDataSection";
import { useAppContext } from "@/hooks/useAppContext";
import { useInstanceQuery } from "@/hooks/query/useInstancesQuery";
import { executeTask } from "@/services/tasks";
import { showSuccess, showWarn } from "@/utils/toastConfig";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/hooks/queryKeys";

interface ExecuteInvokeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemExecute: ItemExecute;
  instanceId: string;
}

/** Kiểu dữ liệu JSON “thô” sau khi build cho invoke */
type JsonPayload = Record<string, unknown>;

const ExecuteInvokeDialog = ({
  isOpen,
  onClose,
  itemExecute,
  instanceId,
}: ExecuteInvokeDialogProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setIsLoading } = useAppContext();

  const [isFormInputOpen, setIsFormInputOpen] = useState(false);
  const [bodyType, setBodyType] = useState<BodyType>("none");

  const [bodyData, setBodyData] = useState<Record<string, unknown> | File | MultipartEntry[]>({});
  const [jsonInput, setJsonInput] = useState<unknown>(null);

  const { refetch } = useInstanceQuery(instanceId, isOpen);
  const qc = useQueryClient();

  const handleClickFormInput = () => setIsFormInputOpen(true);
  const setFormInput = (data: unknown) => setJsonInput(data);

  const buildJsonPayload = (): JsonPayload | null => {
    switch (bodyType) {
      case "none":
        return {};
      case "raw": {
        if (typeof bodyData === "object" && bodyData !== null && !Array.isArray(bodyData) && !(bodyData instanceof File)) {
          return bodyData as JsonPayload;
        }
        return null;
      }
      case "form-data": {
        if (Array.isArray(bodyData)) {
          const obj: JsonPayload = {};
          for (const entry of bodyData) {
            if (!entry.key || entry.value == null) continue;
            if (entry.type === "file") {
              obj[entry.key] =
                entry.value instanceof File ? entry.value.name : String(entry.value);
            } else {
              obj[entry.key] = String(entry.value);
            }
          }
          return obj;
        }
        return null;
      }
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

      await executeTask(itemExecute.taskId, payload);

      await refetch();
      await qc.invalidateQueries({ queryKey: qk.instancesRoot, exact: false });

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
          <Typography>{t("Input data for invoke")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>

        <DialogContent>
          <BodyDataSection
            jsonImport={jsonInput}
            bodyType={bodyType}
            setBodyType={setBodyType}
            setBodyData={setBodyData}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClickFormInput}
            className="blue"
            disabled={!itemExecute.formName}
          >
            {t("Form Input")}
          </Button>
          <Button onClick={handleClickOk} className="blue">
            {t("OK")}
          </Button>
          <Button onClick={onClose} className="red">
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>

      <FormInputDialog
        isOpen={isFormInputOpen}
        onClose={() => setIsFormInputOpen(false)}
        setFormInput={setFormInput}
        formName={itemExecute.formName}
      />
    </>
  );
};

export default ExecuteInvokeDialog;