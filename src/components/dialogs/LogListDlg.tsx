import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import LogsTable from "@/components/tables/LogsTable";
import { useInstanceQuery } from "@/hooks/query/useInstancesQuery";

const LogListDialog = ({ isOpen, onClose, instanceId }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: instance } = useInstanceQuery(instanceId, isOpen);

  const logs = instance?.logs ?? [];

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        sx={dialogStyles(theme)}
      >
        <DialogTitle>
          <Typography>{t("Logs")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>
        <DialogContent>
          <LogsTable logs={logs} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogListDialog;
