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
import CustomTextField from "@/components/common/CustomTextField";
import { useAddModelType } from "@/hooks/mutations/useModelTypeMutations";

interface AddModelTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddModelTypeDialog: React.FC<AddModelTypeDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [typeName, setTypeName] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const addModelTypeMutation = useAddModelType();

  async function handleClickOk() {
    addModelTypeMutation.mutate(
      { name: typeName, description: typeDescription },
      {
        onSuccess: () => {
          onClose?.();
        },
      }
    );
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleClickOk();
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        onKeyDown={handleKeyDown}
        sx={dialogStyles(theme)}
      >
        <DialogTitle>
          <Typography>{t("Add model type")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>
        <DialogContent>
          <CustomTextField
            label={t("Type name")}
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
          />

          <CustomTextField
            label={t("Type description")}
            value={typeDescription}
            onChange={(e) => setTypeDescription(e.target.value as string)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickOk} className="blue">
            {t("Create")}
          </Button>
          <Button onClick={onClose} className="red">
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddModelTypeDialog;
