import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlProps,
  SelectProps,
} from "@mui/material";

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps extends Omit<FormControlProps, "onChange"> {
  label: string;
  value: string | number | undefined;
  onChange: SelectProps["onChange"];
  options: Option[];
  selectProps?: Partial<SelectProps>;
  minWidth?: number | string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  selectProps,
  minWidth = 120,
  ...formControlProps
}) => {
  return (
    <FormControl
      size="small"
      margin="dense"
      sx={{
        minWidth,
        "& .MuiOutlinedInput-root": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: (theme) => theme.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: (theme) => theme.palette.info.light,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: (theme) => theme.palette.primary.light,
          },
        },
      }}
      {...formControlProps}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={onChange}
        MenuProps={{
          PaperProps: {
            sx: {
              "& .MuiMenuItem-root": {
                fontSize: 13,
              },
            },
          },
        }}
        inputProps={{
          sx: {
            fontSize: 13,
          },
        }}
        {...selectProps}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelect;