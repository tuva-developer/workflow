import { useState } from "react";
import {
  Avatar,
  Typography,
  Box,
  Menu,
  IconButton,
  Divider,
  Tooltip,
  Button,
  Stack,
  Chip,
  Theme,
} from "@mui/material";
import { FaUser } from "react-icons/fa";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import ChangePasswordDialog from "@/components/dialogs/ChangePasswordDlg";
import { PiLockKeyFill } from "react-icons/pi";
import { logout } from "@/auth/auth-api";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { RoleColors } from "@/utils/defines";
import MyProfileDlg from "@/components/dialogs/MyProfileDlg";

type ActionItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  theme?: Theme;
};

const ActionItem = ({
  icon,
  title,
  subtitle,
  onClick,
  theme,
}: ActionItemProps) => {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      py={1}
      px={1}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: 2,
        "&:hover": {
          backgroundColor: onClick
            ? theme?.palette.action.hover
            : "transparent",
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          backgroundColor: `${theme?.palette.primary.main}33`,
          color: theme?.palette.primary.main,
          p: 1.2,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography fontSize={14} fontWeight={600}>
          {title}
        </Typography>
        <Typography fontSize={12} color={theme?.palette.text.secondary}>
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
};

export default function UserProfile() {
  const { user, clearUser, setAuthChecked } = useUser();
  const { t } = useTranslation();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Error:", err);
    } finally {
      await queryClient.cancelQueries();
      queryClient.clear();

      clearUser();
      setAuthChecked(true);
      setAnchorEl(null);
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title={t("User")} arrow>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ p: 1 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar
              alt={user?.userId}
              src="/static/images/avatar/1.jpg"
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: "left", vertical: "top" }}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          PaperProps={{
            elevation: 1,
            sx: {
              minWidth: 300,
              p: 2,
              borderRadius: 2,
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar
              alt={user?.userId}
              src="/static/images/avatar/1.jpg"
              sx={{ width: 64, height: 64 }}
            />
            <Box>
              <Typography fontSize={15} fontWeight={600}>
                {user?.userId || ""}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {user?.roles.map((role) => {
                  const mode = theme.palette.mode;
                  const color = RoleColors[mode][role];

                  return (
                    <Chip
                      key={role}
                      label={t(role)}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: 11,
                        borderRadius: 1,
                        color: color,
                        bgcolor: `${color}30`,
                        borderColor: "transparent",
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <ActionItem
              icon={<FaUser />}
              title={t("My profile")}
              subtitle={t("View and update your profile")}
              theme={theme}
              onClick={() => {
                setProfileDialogOpen(true);
              }}
            />

            <ActionItem
              icon={<PiLockKeyFill />}
              title={t("Change password")}
              subtitle={t("Update your password")}
              theme={theme}
              onClick={() => {
                setChangePasswordOpen(true);
              }}
            />
          </Stack>

          <Box mt={2}>
            <Button
              onClick={handleLogout}
              fullWidth
              variant="outlined"
              color="error"
              sx={{ textTransform: "none" }}
            >
              {t("Logout")}
            </Button>
          </Box>
        </Menu>
      </Box>

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      <MyProfileDlg
        open={isProfileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        loading={false}
        keepMounted={false}
        maxWidth="sm"
        fullWidth
      />
    </>
  );
}
