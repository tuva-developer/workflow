import { IconButton, Tooltip, useTheme } from "@mui/material";
import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactElement;
  color?: string;
  tooltip?: string;
  size?: number;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  color = "#1976D2",
  tooltip,
  size = 20,
  disabled = false,
}) => {
  const theme = useTheme();

  const effectiveColor = disabled ? theme.palette.action.disabled : color;

  const button = (
    <IconButton
      size="small"
      onClick={!disabled ? onClick : () => {}}
      sx={{
        borderRadius: 2,
        color: effectiveColor,
        backgroundColor: `${effectiveColor}30`,
        "&:hover": {
          backgroundColor: `${effectiveColor}50`,
        },
        ...(disabled && {
          opacity: 0.6,
          cursor: "not-allowed",
          pointerEvents: "auto",
        }),
      }}
    >
      {React.cloneElement(icon, { size })}
    </IconButton>
  );

  return tooltip && !disabled ? (
    <Tooltip title={tooltip}>{button}</Tooltip>
  ) : (
    button
  );
};

export default ActionButton;
