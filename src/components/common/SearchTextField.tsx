import React, { useEffect } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  SxProps,
  Theme,
  Tooltip,
} from "@mui/material";
import { RiSearchLine } from "react-icons/ri";
import { useDebouncedCallback } from "use-debounce";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

interface SearchTextFieldProps {
  value: string;
  onChangeDebounced: (value: string) => void;
  placeholder?: string;
  debounceDelay?: number;
  width?: number | string;
  sx?: SxProps<Theme>;
  tooltip?: string;
}

const SearchTextField: React.FC<SearchTextFieldProps> = ({
  value,
  onChangeDebounced,
  placeholder = "Search...",
  debounceDelay = 300,
  width = 300,
  sx,
  tooltip = "",
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [inputValue, setInputValue] = React.useState(value);

  const debounced = useDebouncedCallback((val: string) => {
    onChangeDebounced(val);
  }, debounceDelay);

  useEffect(() => {
    debounced(inputValue);
  }, [inputValue, debounced]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <Tooltip title={t(tooltip)}>
      <TextField
        placeholder={t(placeholder)}
        fullWidth
        variant="outlined"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <RiSearchLine style={{ color: theme.palette.text.primary }} />
            </InputAdornment>
          ),
          endAdornment: inputValue && (
            <InputAdornment position="end">
              <IconButton
                sx={{ width: "34px", height: "34px" }}
                onClick={() => setInputValue("")}
              >
                <Typography sx={{ fontSize: 16, color: "#888" }}>×</Typography>
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          backgroundColor: theme.palette.background.default,
          width: width,
          borderRadius: 2,
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: theme.palette.divider },
            "&:hover fieldset": { borderColor: "#2A95FC" },
            "&.Mui-focused fieldset": {
              borderColor: "#2A95FC",
              borderWidth: "1px",
              boxShadow: "0 0 0 3px rgba(42, 149, 252, 0.1)",
            },
          },
          "& input": {
            padding: "12px 14px",
            fontSize: "12px",
            color: theme.palette.text.primary,
          },
          "& .MuiInputBase-input::placeholder": {
            color: theme.palette.text.primary,
            opacity: 1,
          },
          ...sx,
        }}
      />
    </Tooltip>
  );
};

export default SearchTextField;
