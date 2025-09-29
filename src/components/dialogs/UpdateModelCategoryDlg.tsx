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
import { useUpdateModelCategory } from "@/hooks/mutations/useModelCategoryMutations";

interface UpdateModelCategoryDialogProps {
  isOpen: boolean;
  modelCategory: ModelCategory;
  onClose: () => void;
}

const UpdateModelCategoryDialog: React.FC<UpdateModelCategoryDialogProps> = ({
  isOpen,
  modelCategory,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const updateModelCategoryMutation = useUpdateModelCategory();

  useEffect(() => {
    if (isOpen) {
      setNewName(modelCategory?.name ?? "");
      setNewDescription(modelCategory?.description ?? "");
    }
  }, [isOpen, modelCategory]);

  async function handleClickUpdate() {
    if (updateModelCategoryMutation.isPending) return;
    if (!modelCategory?._id) return;

    updateModelCategoryMutation.mutate(
      {
        modelCategoryId: modelCategory._id,
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleClickUpdate();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      onKeyDown={handleKeyDown}
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Typography>{t("Update category")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>

      <DialogContent>
        <CustomTextField
          label={t("Category name")}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <CustomTextField
          label={t("Category description")}
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
  );
};

export default UpdateModelCategoryDialog;