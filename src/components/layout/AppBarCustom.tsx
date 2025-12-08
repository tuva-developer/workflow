import { AppBar, Box, Tab, Tabs, Toolbar, useTheme } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ThemeChange from "@/components/common/ThemeChange";
import HomeButton from "@/components/common/HomeButton";
import UserProfile from "@/components/common/UserProfile";
import LanguageSelector from "@/components/common/LanguageSelector";
import type { IconType } from "react-icons/lib";

interface TabItem {
  label: string;
  icon?: IconType;
}

interface AppBarCustomProps {
  tabs: TabItem[];
  setTabIndex?: (tabIndex: number) => void;
  isLimit?: boolean;
}

function AppBarCustom({ tabs, setTabIndex, isLimit = false }: AppBarCustomProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setIndex(newValue);
    setTabIndex?.(newValue);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        height: 56,
        flexShrink: 0,
        zIndex: theme.zIndex.appBar,
        bgcolor: "transparent",
        boxShadow: "none",
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minHeight: 56,
          px: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          {!isLimit && (
            <Box sx={{ mr: 0.5 }}>
              <HomeButton />
            </Box>
          )}

          <Tabs
            value={index}
            onChange={handleTabChange}
            variant="scrollable"
            allowScrollButtonsMobile
            TabIndicatorProps={{
              sx: {
                display: "none",
              },
            }}
            sx={{
              minHeight: 40,
              "& .MuiTabs-flexContainer": {
                gap: 0.5,
              },
              "& .MuiTab-root": {
                textTransform: "none",
                minHeight: 36,
                height: 36,
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: 0.3,
                color: theme.palette.text.secondary,
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                transition: "all 0.18s ease",
                "& svg": {
                  fontSize: 16,
                },
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                },
                "&.Mui-selected": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.main}40)`,
                  color: theme.palette.primary.main,
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.02)",
                },
              },
            }}
          >
            {tabs.map((tab, tabIndex) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tabIndex}
                  label={t(tab.label)}
                  icon={Icon ? <Icon size={15} /> : undefined}
                  iconPosition="start"
                />
              );
            })}
          </Tabs>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          <ThemeChange />
          <LanguageSelector />
          {!isLimit && <UserProfile />}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppBarCustom;