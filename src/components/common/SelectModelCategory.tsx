import { Autocomplete, TextField, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useModelCategoriesQuery } from "@/hooks/query/useModelCategoriesQuery";

interface SelectModelCategoryProps {
  label: string;
  minWidth: number;
  categoryId: string;
  setCategoryId: (val: string) => void;
  defaultMode?: "all" | "none";
  isOpen?: boolean;
}

type Option = Pick<ModelCategory, "_id" | "name">;

export default function SelectModelCategory({
  label,
  minWidth,
  categoryId,
  setCategoryId,
  defaultMode = "all",
  isOpen = true,
}: SelectModelCategoryProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const { data, isLoading } = useModelCategoriesQuery(undefined, isOpen);
  const categories = (data?.items ?? []) as ModelCategory[];

  const defaultOption: Option =
    defaultMode === "all"
      ? { _id: "all", name: t("All") }
      : { _id: "", name: t("None") };

  const options: Option[] = [
    defaultOption,
    ...categories.map((c) => ({ _id: c._id, name: c.name })),
  ];

  const value = options.find((c) => c._id === categoryId) ?? defaultOption;

  return (
    <Autocomplete<Option, false, false, false>
      size="small"
      options={options}
      loading={isLoading}
      value={value}
      onChange={(_, newValue) =>
        setCategoryId(newValue?._id ?? (defaultMode === "all" ? "all" : ""))
      }
      getOptionLabel={(option) =>
        option._id === "all" && defaultMode === "all"
          ? t("All")
          : option._id === "" && defaultMode === "none"
          ? t("None")
          : option.name
      }
      isOptionEqualToValue={(opt, val) => opt._id === val._id}
      noOptionsText={
        <span style={{ color: theme.palette.text.secondary, fontSize: 13 }}>
          {t("No options")}
        </span>
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          margin="dense"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& input": { fontSize: 13 },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.divider,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.info.light,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.light,
                borderWidth: 2,
              },
            },
          }}
        />
      )}
      componentsProps={{
        popper: {
          sx: {
            "& .MuiAutocomplete-option": { fontSize: 13 },
          },
        },
      }}
      sx={{
        minWidth,
        "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
          paddingTop: "8.5px",
          paddingBottom: "8.5px",
        },
        "& .MuiAutocomplete-noOptions": {
          color: theme.palette.text.secondary,
          fontSize: 13,
        },
      }}
    />
  );
}