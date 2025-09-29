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
import { useAppContext } from "@/hooks/useAppContext";
import BodyDataSection from "@/components/common/BodyDataSection";
import { showError, showWarn, showSuccess } from "@/utils/toastConfig";
import {
  debugModel,
  debugModelWithFile,
  debugModelWithMultipart,
} from "@/services/models";

interface DebugModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
}

const DebugModelDialog: React.FC<DebugModelDialogProps> = ({
  isOpen,
  onClose,
  modelId,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setDebugData, setIsLoading } = useAppContext();
  const [bodyType, setBodyType] = useState<BodyType>("none");
  const [data, setData] = useState<BodyData>({});

  const exitWithWarning = (message: string) => {
    showWarn(t(message));
    setIsLoading(false);
    return;
  };

  const handleOk = async () => {
    setIsLoading(true);

    try {
      let result;

      switch (bodyType) {
        case "none": {
          result = await debugModel({ modelId });
          break;
        }

        case "raw": {
          if (typeof data === "object" && !Array.isArray(data)) {
            result = await debugModel({ modelId, data });
          } else {
            return exitWithWarning("Invalid JSON data");
          }
          break;
        }

        case "binary": {
          if (data instanceof File) {
            result = await debugModelWithFile({ modelId, file: data });
          } else {
            return exitWithWarning("No file selected");
          }
          break;
        }

        case "form-data": {
          if (Array.isArray(data)) {
            const formData = new FormData();

            for (const entry of data) {
              if (!entry.key || entry.value == null) continue;

              if (entry.type === "file" && entry.value instanceof File) {
                formData.append(entry.key, entry.value);
              } else if (entry.type === "text") {
                formData.append(entry.key, String(entry.value));
              }
            }

            result = await debugModelWithMultipart({ modelId, formData });
          } else {
            return exitWithWarning("Invalid form data");
          }
          break;
        }

        default: {
          return exitWithWarning("Unknown body type");
        }
      }

      showSuccess(t("Debug model success"));
      setDebugData(result || []);
    } catch (error) {
      showError(t("Debug model failed"));
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
            setBodyData={setData}
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

export default DebugModelDialog;
