import { Autocomplete, TextField, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useModelTypesQuery } from "@/hooks/query/useModelTypesQuery";

interface SelectModelTypeProps {
  label: string;
  minWidth: number;
  typeId: string;
  setTypeId: (val: string) => void;
  defaultMode?: "all" | "none";
  isOpen?: boolean;
}

type Option = Pick<ModelType, "_id" | "name">;

export default function SelectModelType({
  label,
  minWidth,
  typeId,
  setTypeId,
  defaultMode = "all",
  isOpen = true,
}: SelectModelTypeProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const { data, isLoading } = useModelTypesQuery({}, isOpen);
  const types = (data?.items ?? []) as ModelType[];

  const defaultOption: Option =
    defaultMode === "all"
      ? { _id: "all", name: t("All") }
      : { _id: "", name: t("None") };

  const options: Option[] = [defaultOption, ...types.map((x) => ({ _id: x._id, name: x.name }))];

  const value = options.find((x) => x._id === typeId) ?? defaultOption;

  return (
    <Autocomplete<Option, false, false, false>
      size="small"
      options={options}
      loading={isLoading}
      value={value}
      onChange={(_, newValue) =>
        setTypeId(newValue?._id ?? (defaultMode === "all" ? "all" : ""))
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