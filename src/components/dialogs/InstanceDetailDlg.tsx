import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import LogListDialog from "@/components/dialogs/LogListDlg.js";
import { dialogStyles } from "@/styles/styles";
import InstanceView from "@/components/common/InstanceView";
import { useTranslation } from "react-i18next";

interface InstanceListProps {
  isOpen: boolean;
  onClose: () => void;
  instanceId: string;
}

const InstanceDetailDialog: React.FC<InstanceListProps> = ({
  isOpen,
  onClose,
  instanceId,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [isOpenLogs, setIsOpenLogs] = useState(false);

  function handleClickLogs() {
    setIsOpenLogs(true);
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullScreen
        sx={{
          ...dialogStyles(theme),
          "& .MuiDialog-paper": {
            width: "90vw",
            height: "90vh",
            margin: 0,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Typography>{t("Instance detail")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", padding: 0, overflow: "hidden" }}>
          <InstanceView isOpen={isOpen} instanceId={instanceId} />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClickLogs} className="blue">
            {t("Logs")}
          </Button>
        </DialogActions>
      </Dialog>

      <LogListDialog
        isOpen={isOpenLogs}
        onClose={() => setIsOpenLogs(false)}
        instanceId={instanceId}
      />
    </>
  );
};

export default InstanceDetailDialog;
