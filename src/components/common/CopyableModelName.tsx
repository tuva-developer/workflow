import { useState } from "react";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/defines";
import { useModelCategoriesQuery } from "@/hooks/query/useModelCategoriesQuery";
import { useModelTypesQuery } from "@/hooks/query/useModelTypesQuery";

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

interface CopyableModelNameProps {
  name?: string;
  model?: {
    _id?: string;
    name?: string;
    created_at?: string;
    updated_at?: string;
    owner?: string;
    typeId?: string;
    categoryId?: string;
    description?: string;
  };
}

const CopyableModelName = ({
  name: nameProp,
  model,
}: CopyableModelNameProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const { data: dataModelCategories } = useModelCategoriesQuery({}, false);
  const { data: dataModelTypes } = useModelTypesQuery({}, false);
  const modelCategories = dataModelCategories?.items ?? [];
  const modelTypes = dataModelTypes?.items ?? [];

  const name = nameProp ?? model?.name;
  const isEmpty = !name;
  const textColor = isEmpty
    ? theme.palette.text.disabled
    : theme.palette.text.primary;
  const lineColor = theme.palette.text.primary;

  const handleClick = () => {
    if (!name) return;
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasDetails = !!model && model._id;

  const detailTooltip = hasDetails && (
    <Box sx={{ p: 1, fontSize: 12, maxWidth: 320 }}>
      {copied && (
        <Box
          sx={{
            mb: 0.75,
            fontSize: 11,
            color: "success.main",
          }}
        >
          {t("Name copied")}
        </Box>
      )}

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("ID")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {model?._id || t("N/A")}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Created at")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {formatDate(model?.created_at)}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Updated at")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {formatDate(model?.updated_at)}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Owner")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {model?.owner || t("N/A")}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Type")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {modelTypes.find((cat) => cat._id === model.typeId)?.name ||
            t("N/A")}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Category")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {modelCategories.find((cat) => cat._id === model.categoryId)?.name ||
            t("N/A")}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Description")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {model?.description || t("N/A")}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Tooltip
      arrow
      placement="bottom"
      title={hasDetails ? detailTooltip : copied ? t("Name copied") : ""}
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
