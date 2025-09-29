import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  useTheme,
  Box,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { showError, showWarn } from "@/utils/toastConfig";
import { FiUpload } from "react-icons/fi";

interface ImportModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (xml: string) => void;
}

const ImportModelDialog: React.FC<ImportModelDialogProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".bpmn")) {
        setSelectedFile(file);
      } else {
        showError(t("Please select a .bpmn file"));
        event.target.value = "";
      }
    }
  };

  const handleClickFileButton = () => {
    inputRef.current?.click();
  };

  const handleClickOk = async () => {
    if (!selectedFile) {
      showWarn(t("Please select a file"));
      return;
    }

    try {
      const fileContent = await readFileAsText(selectedFile);
      onImport(fileContent);
      onClose();
    } catch (error) {
      showError(t("Error reading file"));
      console.error(error);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleClickOk();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      onKeyDown={handleKeyDown}
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Typography>{t("Import BPMN Model")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>
      <DialogContent>
        <input
          type="file"
          accept=".bpmn"
          ref={inputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            padding: 1,
            fontSize: 14,
            color: theme.palette.text.secondary,
            backgroundColor: theme.palette.background.default,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<FiUpload />}
            onClick={handleClickFileButton}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {t("Choose file")}
          </Button>
          {selectedFile ? (
            <>
              {t("Selected file")}:{" "}
              <strong style={{ color: theme.palette.text.primary }}>
                {selectedFile.name}
              </strong>
            </>
          ) : (
            t("No file chosen")
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClickOk} className="blue">
          {t("Import")}
        </Button>
        <Button onClick={onClose} className="red">
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModelDialog;
