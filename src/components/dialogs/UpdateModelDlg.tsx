import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  useTheme,
  Typography,
  IconButton,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import CustomSelect from "@/components/common/CustomSelect";
import CustomTextField from "@/components/common/CustomTextField";
import { useModelCategoriesQuery } from "@/hooks/query/useModelCategoriesQuery";
import { useModelTypesQuery } from "@/hooks/query/useModelTypesQuery";

type UpdateModelDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onOk: (data: { rename: string; type: string; category: string }) => void;
  initialValue: Model;
};

export default function UpdateModelDialog({
  isOpen,
  onClose,
  onOk,
  initialValue,
}: UpdateModelDialogProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  const { data: dataModelCategories } = useModelCategoriesQuery({}, isOpen);
  const { data: dataModelTypes } = useModelTypesQuery({}, isOpen);

  const categories = useMemo(
    () => dataModelCategories?.items ?? [],
    [dataModelCategories]
  );

  const types = useMemo(() => dataModelTypes?.items ?? [], [dataModelTypes]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categories]
  );

  const typeOptions = useMemo(
    () =>
      types.map((type) => ({
        value: type._id,
        label: type.name,
      })),
    [types]
  );

  useEffect(() => {
    if (!isOpen || !initialValue) return;

    setName(initialValue.name ?? "");

    const isValidType = types.some((t) => t._id === initialValue.typeId);
    setType(isValidType ? initialValue.typeId ?? "" : "");

    const isValidCategory = categories.some(
      (c) => c._id === initialValue.categoryId
    );
    setCategory(isValidCategory ? initialValue.categoryId ?? "" : "");
  }, [isOpen, initialValue, types, categories]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={dialogStyles(theme)}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography>{t("Quick update")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <CustomTextField
            label={t("Name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <CustomSelect
            label={t("Type")}
            value={type}
            onChange={(e) => setType(e.target.value as string)}
            options={typeOptions}
          />

          <CustomSelect
            label={t("Category")}
            value={category}
            onChange={(e) => setCategory(e.target.value as string)}
            options={categoryOptions}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onOk({ rename: name, type, category })}
          className="blue"
        >
          {t("Save")}
        </Button>
        <Button onClick={onClose} className="red">
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
