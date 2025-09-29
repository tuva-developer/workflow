import React, { useEffect, useState } from "react";
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
import { useUpdateModelType } from "@/hooks/mutations/useModelTypeMutations";

interface UpdateModelTypeDialogProps {
  isOpen: boolean;
  modelType: ModelType;
  onClose: () => void;
}

const UpdateModelTypeDialog: React.FC<UpdateModelTypeDialogProps> = ({
  isOpen,
  modelType,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const updateModelTypeMutation = useUpdateModelType();

  useEffect(() => {
    setNewName(modelType.name);
    setNewDescription(modelType.description || "");
  }, [modelType]);

  async function handleClickUpdate() {
    if (updateModelTypeMutation.isPending) return;
    if (!modelType?._id) return;

    updateModelTypeMutation.mutate(
      {
        modelTypeId: modelType._id,
        name: newName,
        description: newDescription,
      },
      {
        onSuccess: () => {
          onClose?.();
        },
      }
    );
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleClickUpdate();
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
          <Typography>{t("Update type")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>
        <DialogContent>
          <CustomTextField
            label={t("Type name")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <CustomTextField
            label={t("Type description")}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickUpdate} className="blue">
            {t("Update")}
          </Button>
          <Button onClick={onClose} className="red">
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateModelTypeDialog;
