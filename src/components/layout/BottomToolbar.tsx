import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  useTheme,
  Theme,
  SxProps,
  Toolbar,
} from "@mui/material";
import { motion } from "framer-motion";
import DebugView from "@/components/common/DebugView";
import TemplateList from "@/components/layout/TemplateList";
import { useAppContext } from "@/hooks/useAppContext";
import { useTranslation } from "react-i18next";

type BottomToolbarProps = {
  sx?: SxProps<Theme>;
};

const BottomToolbar: React.FC<BottomToolbarProps> = ({ sx }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { debugData } = useAppContext();
  const { t } = useTranslation();

  useEffect(() => {
    if (!debugData) return;

    setActiveTab("debug");
  }, [debugData]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }
    return () => {
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  const handleTabClick = (tab: string) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(panelHeight);
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      const newHeight = startHeight - deltaY;
      if (newHeight >= 100 && newHeight <= window.innerHeight * 0.8) {
        setPanelHeight(newHeight);
      }
    },
    [isDragging, startY, startHeight, setPanelHeight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <Box sx={{ position: "absolute", bottom: 0, ...sx }}>
      {activeTab && (
        <motion.div
          ref={panelRef}
          initial={{ height: 0 }}
          animate={{ height: panelHeight }}
          transition={{ type: "tween", duration: 0, ease: "easeOut" }}
          style={{
            borderTop: `1px solid ${theme.palette.divider}`,
            position: "relative",
            zIndex: theme.zIndex.appBar,
          }}
        >
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              height: "3px",
              cursor: "ns-resize",
              backgroundColor: theme.palette.divider,
            }}
          />

          <Box
            sx={{
              height: `calc(100% - 3px)`,
              backgroundColor: theme.palette.background.default,
              overflow: "auto",
            }}
          >
            {activeTab === "debug" && <DebugView />}
            {activeTab === "template" && (
              <TemplateList isOpen={activeTab === "template" ? true : false} />
            )}
          </Box>
        </motion.div>
      )}

      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "center",
          bgcolor: theme.palette.background.default,
          borderTop: `1px solid ${theme.palette.divider}`,
          "&.MuiToolbar-root": {
            minHeight: 30,
          },
        }}
      >
        <Tabs
          value={activeTab || false}
          onChange={(_, newValue) => handleTabClick(newValue)}
          centered
          textColor="primary"
          indicatorColor="primary"
          TabIndicatorProps={{
            sx: {
              top: 0,
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
              },
            },
          }}
        >
          <Tab
            onClick={() => setActiveTab(activeTab === "debug" ? null : "debug")}
            value="debug"
            label={t("Debug")}
            sx={{
              fontSize: 12,
              color: theme.palette.text.primary,
            }}
          />
          <Tab
            onClick={() =>
              setActiveTab(activeTab === "template" ? null : "template")
            }
            value="template"
            label={t("Template")}
            sx={{
              fontSize: 12,
              color: theme.palette.text.primary,
            }}
          />
        </Tabs>
      </Toolbar>
    </Box>
  );
};

export default BottomToolbar;
