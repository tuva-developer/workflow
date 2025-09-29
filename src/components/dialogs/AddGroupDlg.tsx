import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import CustomTextField from "@/components/common/CustomTextField";
import { useAddGroup } from "@/hooks/mutations/useGroupMutations";

interface AddGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const addGroupMutation = useAddGroup();

  async function handleClickOk() {
    addGroupMutation.mutate(
      { name: groupName, description: groupDescription },
      {
        onSuccess: () => {
          onClose?.();
        },
      }
    );
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleClickOk();
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        onKeyDown={handleKeyDown}
        sx={dialogStyles(theme)}
      >
        <DialogTitle>
          <Typography>{t("Add group")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>
        <DialogContent>
          <CustomTextField
            label={t("Group name")}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <CustomTextField
            label={t("Group description")}
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value as string)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickOk} className="blue">
            {t("Create")}
          </Button>
          <Button onClick={onClose} className="red">
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddGroupDialog;
