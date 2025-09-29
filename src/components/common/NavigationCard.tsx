import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardActionArea, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { motion } from "framer-motion";

interface NavigationCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  to: string;
  hasAccess?: boolean;
}

const MotionCard = motion.create(Card);

const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  description,
  icon,
  to,
  hasAccess = true,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <MotionCard
      whileHover={{ scale: hasAccess ? 1.03 : 1 }}
      whileTap={{ scale: hasAccess ? 0.97 : 1 }}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        borderRadius: 4,
        boxShadow: 5,
      }}
    >
      <Card
        sx={{
          bgcolor: theme.palette.background.paper,
          opacity: hasAccess ? 1 : 0.5,
          pointerEvents: hasAccess ? "auto" : "none",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          width: "100%",
        }}
      >
        <CardActionArea
          onClick={() => navigate(to)}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
            justifyContent: "start",
            flexGrow: 1,
          }}
        >
          {icon && <Box sx={{ mb: 2 }}>{icon}</Box>}
          <Typography
            sx={{ fontWeight: 600, mb: 1, fontSize: 16, letterSpacing: 1, textTransform: 'uppercase' }}
            align="center"
          >
            {title}
          </Typography>
          {description && (
            <Typography
              align="center"
              sx={{
                minHeight: "40px",
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                color: theme.palette.text.secondary,
                letterSpacing: 1,
              }}
            >
              {description}
            </Typography>
          )}
        </CardActionArea>
      </Card>
    </MotionCard>
  );
};

export default NavigationCard;
