import { formatDate } from "@/utils/defines";
import { Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

export function DateCell({ value }: { value?: string | null }) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!value || String(value).trim() === "") {
    return (
      <Typography
        component="span"
        fontSize={13}
        sx={{ fontStyle: "italic", color: theme.palette.text.secondary }}
      >
        {t("No data")}
      </Typography>
    );
  }

  return (
    <Typography component="span" fontSize={13}>
      {formatDate(value)}
    </Typography>
  );
}
