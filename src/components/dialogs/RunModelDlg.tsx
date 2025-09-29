import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import BodyDataSection from "@/components/common/BodyDataSection";
import { useAppContext } from "@/hooks/useAppContext";
import { showError, showSuccess, showWarn } from "@/utils/toastConfig";
import {
  runModel,
  runModelWithFile,
  runModelWithMultipart,
} from "@/services/models";

interface RunModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
}

const RunModelDialog: React.FC<RunModelDialogProps> = ({
  isOpen,
  onClose,
  modelId,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setIsLoading } = useAppContext();
  const [bodyType, setBodyType] = useState<BodyType>("none");
  const [bodyData, setBodyData] = useState<BodyData>({});

  const exitWithWarning = (message: string) => {
    showWarn(t(message));
    setIsLoading(false);
    return;
  };

  const handleOk = async () => {
    setIsLoading(true);

    try {
      switch (bodyType) {
        case "none": {
          await runModel({ modelId, data: {} });
          break;
        }

        case "raw": {
          if (typeof bodyData === "object" && !Array.isArray(bodyData)) {
            await runModel({
              modelId,
              data: bodyData as object,
            });
          } else {
            return exitWithWarning("Invalid JSON data");
          }
          break;
        }

        case "binary": {
          if (bodyData instanceof File) {
            await runModelWithFile({
              modelId,
              file: bodyData,
            });
          } else {
            return exitWithWarning("No file selected");
          }
          break;
        }

        case "form-data": {
          if (Array.isArray(bodyData)) {
            const formData = new FormData();

            for (const entry of bodyData) {
              if (!entry.key || entry.value == null) continue;

              if (entry.type === "file" && entry.value instanceof File) {
                formData.append(entry.key, entry.value);
              } else if (entry.type === "text") {
                formData.append(entry.key, String(entry.value));
              }
            }

            await runModelWithMultipart({
              modelId,
              formData,
            });
          } else {
            return exitWithWarning("Invalid form data");
          }
          break;
        }

        default: {
          return exitWithWarning("Unknown body type");
        }
      }

      showSuccess(t("Run model success"));
    } catch (error) {
      showError(t("Run model failed"));
      console.error(error);
    }

    setIsLoading(false);
    onClose();
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
          <Typography>{t("Input data for the model")}</Typography>
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
          <Button onClick={handleOk} className="blue">
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

export default RunModelDialog;
