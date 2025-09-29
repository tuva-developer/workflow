import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  useTheme,
  Box,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { showWarn } from "@/utils/toastConfig";
import CustomTextField from "@/components/common/CustomTextField";
import SelectModelCategory from "@/components/common/SelectModelCategory";
import SelectModelType from "@/components/common/SelectModelType";
import { useCreateModel } from "@/hooks/mutations/useModelMutations";

interface CreateModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentModel: (model: Model) => void;
  modelXML: string;
}

const CreateModelDialog: React.FC<CreateModelDialogProps> = ({
  isOpen,
  onClose,
  setCurrentModel,
  modelXML,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [modelName, setModelName] = useState("");
  const [modelCategory, setModelCategory] = useState("");
  const [modelType, setModelType] = useState("");

  const createModelMutation = useCreateModel();

  const payload = useMemo(
    () => ({
      name: modelName.trim(),
      categoryId: modelCategory,
      typeId: modelType,
      xml: modelXML,
    }),
    [modelName, modelCategory, modelType, modelXML]
  );

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!payload.name) {
      showWarn(t("Please enter model name"));
      return;
    }

    try {
      const created = await createModelMutation.mutateAsync(payload);

      setCurrentModel({
        name: payload.name,
        description: "",
        status: "",
        _id: created.id,
        _id_version: "",
        config: payload.xml,
        read_only: false,
        categoryId: payload.categoryId ?? "",
        typeId: payload.typeId ?? "",
        owner: "",
        created_at: "",
        updated_at: "",
      });
    } finally {
      onClose();
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={dialogStyles(theme)}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography>{t("Save Model")}</Typography>
          <IconButton onClick={onClose} aria-label={t("Cancel") as string}>
            ×
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <CustomTextField
              label={t("Name")}
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              autoFocus
              required
              disabled={createModelMutation.isPending}
            />

            <SelectModelCategory
              label={t("Category")}
              minWidth={160}
              categoryId={modelCategory}
              setCategoryId={setModelCategory}
              defaultMode="none"
              isOpen={isOpen}
            />

            <SelectModelType
              label={t("Type")}
              minWidth={160}
              typeId={modelType}
              setTypeId={setModelType}
              defaultMode="none"
              isOpen={isOpen}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            type="submit"
            className="blue"
            disabled={createModelMutation.isPending}
          >
            {t("Create")}
          </Button>
          <Button
            onClick={onClose}
            className="red"
            disabled={createModelMutation.isPending}
          >
            {t("Cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateModelDialog;
