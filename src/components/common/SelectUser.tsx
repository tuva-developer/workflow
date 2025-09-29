import { useUsersQuery } from "@/hooks/query/useUsersQuery";
import { Autocomplete, TextField, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

interface SelectUserProps {
  label: string;
  minWidth: number;
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  isOpen?: boolean;
}

export default function SelectUser({
  label,
  minWidth,
  userId,
  setUserId,
  isOpen = true,
}: SelectUserProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = useUsersQuery(undefined, isOpen);
  const users = data?.items ?? [];
  const options = [{ userId: "all", name: t("All") }, ...users];

  return (
    <Autocomplete
      size="small"
      options={options}
      loading={isLoading}
      getOptionLabel={(option) =>
        option.userId === "all" ? t("All") : option.userId
      }
      value={options.find((u) => u.userId === userId) || null}
      onChange={(_, newValue) => setUserId(newValue?.userId || "all")}
      noOptionsText={
        <span
          style={{
            color: theme.palette.text.secondary,
            fontSize: 13,
          }}
        >
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
              "& input": {
                fontSize: 13,
              },
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
            "& .MuiAutocomplete-option": {
              fontSize: 13,
            },
          },
        },
      }}
      sx={{
        minWidth: { minWidth },
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
