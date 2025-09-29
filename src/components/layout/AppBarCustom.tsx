import { AppBar, Box, Tab, Tabs, Toolbar, useTheme } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ThemeChange from "@/components/common/ThemeChange";
import HomeButton from "@/components/common/HomeButton";
import UserProfile from "@/components/common/UserProfile";
import LanguageSelector from "@/components/common/LanguageSelector";
import { IconType } from "react-icons/lib";

interface TabItem {
  label: string;
  icon?: IconType;
}

interface AppBarCustomProps {
  tabs: TabItem[];
  setTabIndex?: (tabIndex) => void;
  isLimit?: boolean;
}

function AppBarCustom({
  tabs,
  setTabIndex,
  isLimit = false,
}: AppBarCustomProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setIndex(newValue);
    if (setTabIndex) setTabIndex(newValue);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        height: 50,
        flexShrink: 0,
        zIndex: theme.zIndex.appBar,
        bgcolor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        borderRadius: 0,
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          pr: 1,
          gap: 1,
          "&.MuiToolbar-root": {
            minHeight: 50,
            pl: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Tabs
            value={index}
            onChange={handleTabChange}
            textColor="primary"
            TabIndicatorProps={{
              sx: {
                top: "unset",
                bottom: "unset",
              },
            }}
            sx={{
              "& .MuiTab-root": {
                color: theme.palette.text.secondary,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.5,
                "&:hover": {
                  color: theme.palette.primary.main,
                },
                "&.Mui-selected": {
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.primary.main,
                  borderLeft: `1px solid ${theme.palette.divider}`,
                  borderRight: `1px solid ${theme.palette.divider}`,
                  borderTop: `2px solid ${theme.palette.primary.main}`,
                  zIndex: 1,
                },
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={t(tab.label)}
                icon={tab.icon ? <tab.icon size={16} /> : undefined}
                iconPosition="start"
                sx={{
                  color: theme.palette.text.primary,
                  minHeight: 50,
                }}
              />
            ))}
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
          {!isLimit && <HomeButton />}
          <ThemeChange />
          <LanguageSelector />
          {!isLimit && <UserProfile />}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppBarCustom;
