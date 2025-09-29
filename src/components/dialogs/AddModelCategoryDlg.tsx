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
import { useAddModelCategory } from "@/hooks/mutations/useModelCategoryMutations";

interface AddModelCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddModelCategoryDialog: React.FC<AddModelCategoryDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const addModelCategoryMutation = useAddModelCategory();

  async function handleClickOk() {
    addModelCategoryMutation.mutate(
      { name: categoryName, description: categoryDescription },
      {
        onSuccess: () => {
          onClose?.();
        },
      }
    );
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleClickOk();
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
        <Typography>{t("Add model category")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>

      <DialogContent>
        <CustomTextField
          label={t("Category name")}
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />

        <CustomTextField
          label={t("Category description")}
          value={categoryDescription}
          onChange={(e) => setCategoryDescription(e.target.value as string)}
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
  );
};

export default AddModelCategoryDialog;