import { useThemeMode } from "@/hooks/useThemeMode";
import { useTheme } from "@mui/material/styles";
import { Box, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function Switch() {
  const { setThemeMode } = useThemeMode();
  const theme = useTheme();
  const { t } = useTranslation();

  const isLight = theme.palette.mode === "light";

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThemeMode(e.target.checked ? "light" : "dark");
  };

  return (
    <Tooltip title={t("Change theme")} arrow>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          padding: 0.5,
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <Box
          component="label"
          htmlFor="themeToggle"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            position: "relative",
          }}
        >
          <Box
            component="input"
            type="checkbox"
            id="themeToggle"
            checked={isLight}
            onChange={handleThemeChange}
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              zIndex: 1,
              cursor: "pointer",
              margin: 0,
            }}
          />
          <Box
            component="svg"
            width={24}
            height={24}
            viewBox="0 0 20 20"
            fill="#bbb"
            stroke="none"
            sx={{
              width: 24,
              height: 24,
              transform: isLight ? "rotate(90deg)" : "rotate(40deg)",
              transition: "transform 0.4s ease",
              "& .sunMoon": {
                transformOrigin: "center center",
                transition: "transform 0.4s ease",
                transform: isLight ? "scale(0.55)" : "scale(1)",
              },
              "& .sunRay": {
                transformOrigin: "center center",
                transform: isLight ? "scale(1)" : "scale(0)",
                transition: "transform 0.4s ease",
              },
              "& mask > circle": {
                transform: isLight
                  ? "translate(16px, -3px)"
                  : "translate(0, 0)",
                transition:
                  "transform 0.64s cubic-bezier(0.41, 0.64, 0.32, 1.575)",
              },
            }}
          >
            <mask id="moon-mask">
              <rect x={0} y={0} width={20} height={20} fill="white" />
              <circle cx={11} cy={3} r={8} fill="black" />
            </mask>
            <circle
              className="sunMoon"
              cx={10}
              cy={10}
              r={8}
              mask="url(#moon-mask)"
            />
            <g>
              <circle className="sunRay" cx={18} cy={10} r="1.5" />
              <circle className="sunRay" cx={14} cy="16.928" r="1.5" />
              <circle className="sunRay" cx={6} cy="16.928" r="1.5" />
              <circle className="sunRay" cx={2} cy={10} r="1.5" />
              <circle className="sunRay" cx={6} cy="3.1718" r="1.5" />
              <circle className="sunRay" cx={14} cy="3.1718" r="1.5" />
            </g>
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
}