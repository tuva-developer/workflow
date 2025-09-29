import { IconButton, Tooltip, useTheme } from "@mui/material";
import { AiFillHome } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HomeButton = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Tooltip title={t("Home")} arrow>
      <IconButton
        color="info"
        onClick={() => navigate("/home")}
        sx={{
          fontSize: 24,
          padding: "6px",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <AiFillHome />
      </IconButton>
    </Tooltip>
  );
};

export default HomeButton;
