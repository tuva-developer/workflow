import React, { useRef, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { dialogStyles } from "@/styles/styles";
import { Form } from "@bpmn-io/form-js";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

interface FormPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formSchema: string;
}

const FormPreviewDialog: React.FC<FormPreviewDialogProps> = ({
  isOpen,
  onClose,
  formSchema,
}) => {
  const theme = useTheme();
  const formPreviewRef = useRef<HTMLDivElement>(null);
  const formPreviewViewer = useRef<Form | null>(null);
  const { t } = useTranslation();

  const handleRendered = async () => {
    if (!formPreviewRef.current) return;

    formPreviewViewer.current = new Form({
      container: formPreviewRef.current,
    });

    formPreviewViewer.current.importSchema(formSchema);
  };

  useEffect(() => {
    return () => {
      if (formPreviewViewer.current) {
        formPreviewViewer.current.destroy();
        formPreviewViewer.current = null;
      }
    };
  }, []);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      TransitionProps={{ onEntered: handleRendered }}
      maxWidth="md"
      fullWidth
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Typography>{t("Form Preview")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: 0 }}>
        <Box
          ref={formPreviewRef}
          sx={{
            height: "100%",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FormPreviewDialog;
