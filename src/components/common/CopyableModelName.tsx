import { useState } from "react";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

const CornerLine = ({
  position,
  lineColor,
}: {
  position: "tl" | "tr" | "bl" | "br";
  lineColor?: string;
}) => {
  const size = 10;
  const thickness = 1.5;

  const baseStyle = {
    position: "absolute" as const,
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: "none" as const,
    zIndex: 1,
    boxSizing: "border-box" as const,
  };

  const cornerStyles = {
    tl: {
      top: 0,
      left: 0,
      borderTop: `${thickness}px solid ${lineColor}`,
      borderLeft: `${thickness}px solid ${lineColor}`,
    },
    tr: {
      top: 0,
      right: 0,
      borderTop: `${thickness}px solid ${lineColor}`,
      borderRight: `${thickness}px solid ${lineColor}`,
    },
    bl: {
      bottom: 0,
      left: 0,
      borderBottom: `${thickness}px solid ${lineColor}`,
      borderLeft: `${thickness}px solid ${lineColor}`,
    },
    br: {
      bottom: 0,
      right: 0,
      borderBottom: `${thickness}px solid ${lineColor}`,
      borderRight: `${thickness}px solid ${lineColor}`,
    },
  };

  return <Box sx={{ ...baseStyle, ...cornerStyles[position] }} />;
};

const CopyableModelName = ({ name }: { name?: string }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (!name) return;
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isEmpty = !name;
  const textColor = isEmpty
    ? theme.palette.text.disabled
    : theme.palette.text.primary;
  const lineColor = theme.palette.text.primary;

  return (
    <Tooltip
      title={copied ? t("Copied") : isEmpty ? t("No name") : name}
      arrow
      placement="top"
    >
      <Box
        onClick={handleClick}
        sx={{
          position: "relative",
          px: 2,
          py: 1,
          ml: 4,
          bgcolor: "transparent",
          cursor: isEmpty ? "default" : "pointer",
          userSelect: "none",
          textAlign: "center",
          minWidth: 160,
          maxWidth: 240,
          "&:hover": {
            bgcolor: `${theme.palette.action.hover}60`,
          },
        }}
      >
        <CornerLine position="tl" lineColor={lineColor} />
        <CornerLine position="tr" lineColor={lineColor} />
        <CornerLine position="bl" lineColor={lineColor} />
        <CornerLine position="br" lineColor={lineColor} />

        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 0.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: textColor,
          }}
        >
          {name || t("Unsaved")}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default CopyableModelName;
