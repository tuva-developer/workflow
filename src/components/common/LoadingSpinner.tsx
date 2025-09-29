import { useAppContext } from "@/hooks/useAppContext";
import { Dialog, Box, useTheme } from "@mui/material";
import { keyframes } from "@mui/system";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const wobble1 = keyframes`
  0%, 100% {
    transform: translateY(0%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-66%) scale(0.65);
    opacity: 0.8;
  }
`;

const wobble2 = keyframes`
  0%, 100% {
    transform: translateY(0%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(66%) scale(0.65);
    opacity: 0.8;
  }
`;

export default function LoadingSpinner() {
  const theme = useTheme();
  const { isLoading } = useAppContext();

  return (
    <Dialog
      open={isLoading}
      sx={{ zIndex: 9999 }}
      PaperProps={{
        elevation: 0,
        sx: {
          backgroundColor: "transparent",
          overflow: "hidden",
          padding: 2,
          boxShadow: "none",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        },
      }}
    >
      <Box
        sx={{
          "--uib-size": "35px",
          "--uib-speed": "0.8s",
          "--uib-color": theme.palette.primary.main,
          position: "relative",
          display: "inline-block",
          height: "var(--uib-size)",
          width: "var(--uib-size)",
          animation: `${spin} calc(var(--uib-speed) * 2.5) linear infinite`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              height: "100%",
              width: "30%",
              ...(i === 0 && {
                bottom: "5%",
                left: 0,
                transform: "rotate(60deg)",
                transformOrigin: "50% 85%",
              }),
              ...(i === 1 && {
                bottom: "5%",
                right: 0,
                transform: "rotate(-60deg)",
                transformOrigin: "50% 85%",
              }),
              ...(i === 2 && {
                bottom: "-5%",
                left: 0,
                transform: "translateX(116.666%)",
              }),
              "&::after": {
                content: '""',
                position: "absolute",
                width: "100%",
                paddingBottom: "100%",
                borderRadius: "50%",
                backgroundColor: "var(--uib-color)",
                ...(i === 0 && {
                  bottom: 0,
                  left: 0,
                  animation: `${wobble1} var(--uib-speed) ease-in-out infinite`,
                  animationDelay: "calc(var(--uib-speed) * -0.3)",
                }),
                ...(i === 1 && {
                  bottom: 0,
                  left: 0,
                  animation: `${wobble1} var(--uib-speed) ease-in-out infinite`,
                  animationDelay: "calc(var(--uib-speed) * -0.15)",
                }),
                ...(i === 2 && {
                  top: 0,
                  left: 0,
                  animation: `${wobble2} var(--uib-speed) ease-in-out infinite`,
                }),
              },
            }}
          />
        ))}
      </Box>
    </Dialog>
  );
}
