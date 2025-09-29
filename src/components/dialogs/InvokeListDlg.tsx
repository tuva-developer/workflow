import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { IoHandLeftSharp } from "react-icons/io5";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { useInstanceQuery } from "@/hooks/query/useInstancesQuery";
import ExecuteInvokeDlg from "@/components/dialogs/ExecuteInvokeDlg";
import { defaultItemExecute } from "@/utils/defines";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import ActionButton from "@/components/common/ActionButton";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  instanceId: string;
}

const InvokeListDialog = ({ isOpen, onClose, instanceId }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [isExecuteTask, setIsExecuteTask] = useState(false);
  const [itemExecute, setItemExecute] =
    useState<ItemExecute>(defaultItemExecute);

  const { data: instance } = useInstanceQuery(instanceId, isOpen);
  const waits: ItemExecute[] = instance?.data.wait ?? [];

  const handleClickExcute = (item: ItemExecute) => {
    setItemExecute(item);
    setIsExecuteTask(true);
  };

  const columns: GridColDef<ItemExecute>[] = [
    { field: "id", headerName: t("ID"), flex: 1 },
    { field: "assigneeType", headerName: t("Assigned to"), flex: 1 },
    { field: "assigneeId", headerName: t("User/Group Assigned"), flex: 1 },
    { field: "index", headerName: t("Index"), flex: 1 },
    { field: "processId", headerName: t("Process ID"), flex: 1 },
    {
      field: "action",
      headerName: t("Action"),
      flex: 0,
      resizable: false,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      headerClassName: "no-separator",
      renderCell: (params: GridRenderCellParams<ItemExecute>) => (
        <ActionButton
          icon={<IoHandLeftSharp size={20} />}
          color={theme.palette.primary.main}
          tooltip={t("Execute")}
          onClick={() => handleClickExcute(params.row)}
        />
      ),
    },
  ];

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        sx={dialogStyles(theme)}
      >
        <DialogTitle>
          <Typography>{t("Invokes")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>

        <DialogContent>
          <GenericDataGrid<ItemExecute>
            rows={waits}
            columns={columns}
            getRowId={(row) => row.taskId}
          />
        </DialogContent>
      </Dialog>

      <ExecuteInvokeDlg
        isOpen={isExecuteTask}
        onClose={() => setIsExecuteTask(false)}
        itemExecute={itemExecute}
        instanceId={instanceId}
      />
    </>
  );
};

export default InvokeListDialog;
