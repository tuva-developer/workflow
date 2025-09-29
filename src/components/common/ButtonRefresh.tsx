import { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { FiRefreshCcw, FiFilter } from "react-icons/fi";
import { MdRefresh } from "react-icons/md";
import { useTranslation } from "react-i18next";

const ButtonRefresh = ({ onRefreshData, onRefreshFilter, sx = {} }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefreshData = () => {
    onRefreshData && onRefreshData();
    handleClose();
  };

  const handleRefreshFilter = () => {
    onRefreshFilter && onRefreshFilter();
    handleClose();
  };

  return (
    <>
      <Tooltip title={t("Refresh")}>
        <IconButton
          onClick={handleClick}
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.light",
            },
            ...sx,
          }}
        >
          <MdRefresh size={24} />
        </IconButton>
      </Tooltip>

      <Menu
        id="refresh-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180 },
        }}
      >
        <MenuItem onClick={handleRefreshData}>
          <ListItemIcon>
            <FiRefreshCcw size={16} />
          </ListItemIcon>
          <Typography fontSize={13}>{t("Refresh data")}</Typography>
        </MenuItem>
        <MenuItem onClick={handleRefreshFilter}>
          <ListItemIcon>
            <FiFilter size={16} />
          </ListItemIcon>
          <Typography fontSize={13}>{t("Refresh filter")}</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ButtonRefresh;
