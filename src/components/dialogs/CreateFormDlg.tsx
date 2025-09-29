import React, { useState, useCallback, useEffect } from "react";
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
import { useTranslation } from "react-i18next";
import { dialogStyles } from "@/styles/styles";
import { showWarn } from "@/utils/toastConfig";
import CustomTextField from "@/components/common/CustomTextField";
import { useCreateForm } from "@/hooks/mutations/useFormMutations";
import type { AddFormInput } from "@/services/types";

interface CreateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentForm: (form: FormConfig) => void;
  formSchema: string;
}

const CreateFormDialog: React.FC<CreateFormDialogProps> = ({
  isOpen,
  onClose,
  setCurrentForm,
  formSchema,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [formName, setFormName] = useState("");

  useEffect(() => {
    if (isOpen) setFormName("");
  }, [isOpen]);

  const createFormMutation = useCreateForm();

  const handleClickCreate = useCallback(async () => {
    const trimmed = formName.trim();
    if (!trimmed) {
      showWarn(t("Please enter form name"));
      return;
    }

    try {
      const payload: AddFormInput = { name: trimmed, formSchema };
      const created = await createFormMutation.mutateAsync(payload);

      const nextForm = {
        _id: created.id,
        name: trimmed,
        config: formSchema,
        description: "",
      } as FormConfig;

      setCurrentForm(nextForm);
      onClose();
    } catch {
      onClose();
    }
  }, [formName, formSchema, createFormMutation, setCurrentForm, onClose, t]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !createFormMutation.isPending) {
      handleClickCreate();
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
        <Typography>{t("Enter Form Name")}</Typography>
        <IconButton onClick={onClose} disabled={createFormMutation.isPending}>
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <CustomTextField
          label={t("Name")}
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          disabled={createFormMutation.isPending}
          autoFocus
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClickCreate}
          className="blue"
          disabled={createFormMutation.isPending}
        >
          {createFormMutation.isPending ? t("Creating...") : t("Create")}
        </Button>
        <Button
          onClick={onClose}
          className="red"
          disabled={createFormMutation.isPending}
        >
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFormDialog;
