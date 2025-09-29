import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { Form } from "@bpmn-io/form-js-viewer";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { loadFormByName } from "@/services/forms";

interface FormInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  setFormInput: (data: unknown) => void;
  formName: string;
}

const FormInputDialog = ({
  isOpen,
  onClose,
  setFormInput,
  formName,
}: FormInputDialogProps) => {
  const theme = useTheme();
  const formInput = useRef<Form | null>(null);
  const formInputRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    (event: unknown) => {
      if (typeof event === "object" && event !== null && "data" in event) {
        const { data } = event as { data: unknown };
        setFormInput(data);
        onClose();
      }
    },
    [onClose, setFormInput]
  );

  const handleRendered = async () => {
    if (!formInputRef.current) return;

    formInput.current = new Form({ container: formInputRef.current });

    try {
      const formSchema = await loadFormByName(formName);

      if (formSchema?.config) {
        formInput.current.importSchema(JSON.parse(formSchema.config));
        formInput.current.on("submit", handleSubmit);
      }
    } catch (error) {
      console.error("Failed to load form schema:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (formInput.current) {
        formInput.current.off("submit", handleSubmit);
        formInput.current = null;
      }
    };
  }, [handleSubmit]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={dialogStyles(theme)}
      TransitionProps={{ onEntered: handleRendered }}
    >
      <DialogTitle>
        <Typography>{t("Form Input")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: 0 }}>
        <div ref={formInputRef}></div>
      </DialogContent>
    </Dialog>
  );
};

export default FormInputDialog;
