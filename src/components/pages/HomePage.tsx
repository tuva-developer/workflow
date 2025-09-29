import { motion } from "framer-motion";
import { RiTaskLine, RiListSettingsFill } from "react-icons/ri";
import { MdManageAccounts, MdRebaseEdit } from "react-icons/md";
import { Box, Container, Grid, useTheme } from "@mui/material";
import { useUser } from "@/hooks/useUser";
import usePageTitle from "@/hooks/usePageTitle";
import UserProfile from "@/components/common/UserProfile";
import LanguageSelector from "@/components/common/LanguageSelector";
import ThemeChange from "@/components/common/ThemeChange";
import { useTranslation } from "react-i18next";
import NavigationCard from "@/components/common/NavigationCard";
import { TiFlowMerge } from "react-icons/ti";
import { FaRegCalendarAlt } from "react-icons/fa";

const IconColors = {
  design: "#6366F1",
  tasks: "#10B981",
  management: "#64748B",
  models: "#0EA5E9",
  instances: "#F59E0B",
  schedules: "#309898",
};

export default function HomePage() {
  usePageTitle("Home");
  const theme = useTheme();
  const { t } = useTranslation();
  const { isAdmin, isSuperAdmin } = useUser();
  const hasAccess = isAdmin() || isSuperAdmin();

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 2,
          pt: 1,
          pr: 2,
        }}
      >
        <ThemeChange />
        <LanguageSelector />
        <UserProfile />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: "100%",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: 32,
            marginBottom: 2,
            color: theme.palette.text.primary,
          }}
        >
          Vietbando Workflow
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: theme.palette.text.secondary,
            marginBottom: 24,
            letterSpacing: 1,
          }}
        >
          {t(
            "Welcome to the workflow platform. Choose a function below to continue"
          )}
        </motion.h2>

        <Container maxWidth="md">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <NavigationCard
                title={t("Design")}
                description={t("Design workflow, create form dynamic")}
                icon={<MdRebaseEdit size={48} color={IconColors["design"]} />}
                to="/design"
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <NavigationCard
                title={t("Tasks")}
                description={t(
                  "Organize, track, and complete your personal workflow tasks"
                )}
                icon={<RiTaskLine size={48} color={IconColors["tasks"]} />}
                to="/tasks"
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <NavigationCard
                title={t("Management")}
                description={t(
                  "Management users, groups, model types and categories"
                )}
                icon={
                  <MdManageAccounts
                    size={48}
                    color={IconColors["management"]}
                  />
                }
                to="/management"
                hasAccess={hasAccess}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <NavigationCard
                title={t("Models")}
                description={t("Manage model information and permissions")}
                icon={<TiFlowMerge size={48} color={IconColors["models"]} />}
                to="/models"
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <NavigationCard
                title={t("Instances")}
                description={t("Manage workflow instances and details")}
                icon={
                  <RiListSettingsFill
                    size={48}
                    color={IconColors["instances"]}
                  />
                }
                to="/instances"
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <NavigationCard
                title={t("Schedules")}
                description={t(
                  "Schedule, track, and manage model timelines"
                )}
                icon={<FaRegCalendarAlt size={48} color={IconColors["schedules"]} />}
                to="/schedules"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}