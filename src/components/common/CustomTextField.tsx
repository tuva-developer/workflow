import React, { useState } from "react";
import {
  TextField,
  TextFieldProps,
  useTheme,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";

interface CustomTextFieldProps extends Omit<TextFieldProps, "onChange"> {
  label: string;
  value: string | number | undefined;
  onChange: TextFieldProps["onChange"];
  toggleVisibility?: boolean;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  toggleVisibility = false,
  InputProps,
  sx,
  ...rest
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const renderAdornment = () => (
    <InputAdornment position="end">
      <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
        {showPassword ? <MdOutlineVisibility /> : <MdOutlineVisibilityOff />}
      </IconButton>
    </InputAdornment>
  );

  const isPasswordField = type === "password" && toggleVisibility;

  return (
    <TextField
      label={label}
      type={isPasswordField ? (showPassword ? "text" : "password") : type}
      fullWidth
      margin="dense"
      variant="outlined"
      value={value}
      onChange={onChange}
      size="small"
      sx={{
        "& .MuiOutlinedInput-root": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.info.light,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.light,
          },
        },
        ...sx,
      }}
      InputProps={{
        endAdornment: isPasswordField
          ? renderAdornment()
          : InputProps?.endAdornment,
        ...InputProps,
      }}
      {...rest}
    />
  );
};

export default CustomTextField;
