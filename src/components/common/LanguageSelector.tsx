import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Language } from "@/contexts/LanguageContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { IoEarthOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";

export default function LanguageSelector() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    handleClose();
  };

  return (
    <>
      <Tooltip title={t("Change language")} arrow>
        <IconButton
          onClick={handleClick}
          sx={{
            color: "#bbb",
            "&:hover": theme.palette.action.hover,
          }}
        >
          <IoEarthOutline size={22} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <MenuItem
          onClick={() => handleLanguageChange("vi")}
          selected={language === "vi"}
          sx={{
            minWidth: 120,
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.common.white,
            },
            "&.Mui-selected:hover": {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.common.white,
            },
            "&:hover": {
              backgroundColor: "transparent",
              color: theme.palette.primary.main,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              padding: "4px 8px",
            }}
          >
            <img
              src="https://flagcdn.com/w40/vn.png"
              alt="Tiếng Việt"
              style={{ width: 24, height: 16, borderRadius: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t("Vietnamese")}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange("en")}
          selected={language === "en"}
          sx={{
            minWidth: 120,
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.common.white,
            },
            "&.Mui-selected:hover": {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.common.white,
            },
            "&:hover": {
              backgroundColor: "transparent",
              color: theme.palette.primary.main,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              padding: "4px 8px",
            }}
          >
            <img
              src="https://flagcdn.com/w40/us.png"
              alt="English"
              style={{ width: 24, height: 16, borderRadius: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t("English")}
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
}
