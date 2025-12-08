import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { MdInfoOutline } from "react-icons/md";
import { motion } from "framer-motion";
import { getRuntimeConfig } from "@/utils/defines";
import { useTranslation } from "react-i18next";

export default function VersionBadge() {
  const { t } = useTranslation();
  const { VERSION } = getRuntimeConfig();
  const color = "#10B981";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ display: "flex", alignItems: "center", gap: 8 }}
    >
      <Tooltip
        title={
          <Box sx={{ p: 0.5 }}>
            <Typography variant="caption" display="block">
              {[`${t("Version")}: ${VERSION}`].filter(Boolean).join(" | ")}
            </Typography>
          </Box>
        }
        arrow
        placement="top"
        enterTouchDelay={0}
      >
        <Chip
          icon={<MdInfoOutline size={16} />}
          label={
            <Typography
              variant="caption"
              sx={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {VERSION}
            </Typography>
          }
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.03)",
            border: `1px solid ${color}33`,
            color,
            ".MuiChip-icon": { color },
            px: 1,
            height: 28,
            cursor: "help",
          }}
          variant="outlined"
        />
      </Tooltip>
    </motion.div>
  );
}
