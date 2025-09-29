import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";
import { Form } from "@bpmn-io/form-js";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  Card,
  useTheme,
} from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import { FixedSizeList as List } from "react-window";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { defaultFormConfig } from "@/utils/defines";
import { useAppContext } from "@/hooks/useAppContext";
import SearchTextField from "@/components/common/SearchTextField";
import { useFormsQuery } from "@/hooks/query/useFormsQuery";
import AutoSizer from "react-virtualized-auto-sizer";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import { showWarn } from "@/utils/toastConfig";
import { useDeleteForm } from "@/hooks/mutations/useFormMutations";
import { FormQuery } from "@/services/types";

interface FormListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentForm: FormConfig;
  setCurrentForm: Dispatch<SetStateAction<FormConfig>>;
}

const Item = ({ data, index, style }) => {
  const theme = useTheme();
  const form = data.items[index];

  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOnClick = async () => {
    if (clickTimeout.current) return;

    clickTimeout.current = setTimeout(async () => {
      clickTimeout.current = null;
      try {
        data.handleClick(form);
      } catch (err) {
        console.error("Error:", err);
      }
    }, 200);
  };

  const handleOnDoubleClick = async () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }

    try {
      data.handleDoubleClick(form);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      data.handleKeyDown(data.formViewSelected);
    }
  };

  return (
    <Box style={{ ...style, display: "flex", alignItems: "center" }}>
      <Card
        key={form._id}
        variant="outlined"
        tabIndex={0}
        sx={{
          border:
            form._id === data.formViewSelected?._id
              ? `1px solid ${theme.palette.primary.main}`
              : `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          boxShadow:
            form._id === data.formViewSelected?._id
              ? "0 0 0 3px rgba(42, 149, 252, 0.2)"
              : "none",
          cursor: "pointer",
          borderRadius: 2,
          padding: "8px 12px",
          width: "100%",
          transition: "all 0.2s ease-in-out",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          "&:hover": {
            borderColor: theme.palette.primary.main,
          },
          "&:focus": {
            borderColor: theme.palette.primary.main,
            boxShadow: "0 0 0 3px rgba(42, 149, 252, 0.2)",
          },
        }}
        onClick={handleOnClick}
        onDoubleClick={handleOnDoubleClick}
        onKeyDown={handleOnKeyDown}
      >
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            color: theme.palette.text.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flexGrow: 1,
          }}
        >
          {form.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            visibility: "hidden",
            ".MuiCard-root:hover &": {
              visibility: "visible",
            },
          }}
        >
          <IconButton
            size="small"
            sx={{
              color: theme.palette.error.main,
              padding: "4px",
              "&:hover": {
                color: theme.palette.error.dark,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              data.handleClickDelete(form._id);
            }}
          >
            <AiOutlineDelete size={18} />
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
};

const FormListDialog: React.FC<FormListDialogProps> = ({
  isOpen,
  onClose,
  currentForm,
  setCurrentForm,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { openConfirm, closeConfirm } = useAppContext();
  const [formViewSelected, setFormViewSelected] =
    useState<FormConfig>(defaultFormConfig);
  const viewFormRef = useRef<HTMLDivElement>(null);
  const viewerForm = useRef<Form | null>(null);
  const listRef = useRef<unknown>(null);

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const params: FormQuery = useMemo(
    () => ({
      hasConfig: true,
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      sortBy: undefined,
      orderBy: undefined,
    }),
    [rowsPerPage, page, searchText]
  );

  const { data: dataForms, refetch } = useFormsQuery(params, isOpen);
  const forms = dataForms?.items ?? [];
  const totalModels = dataForms?.total ?? 0;

  const deleteFormMutation = useDeleteForm();

  useEffect(() => {
    if (isOpen) {
      setFormViewSelected(currentForm ?? ({} as FormConfig));
    }
  }, [isOpen, currentForm]);

  useEffect(() => {
    if (!isOpen) return;
    if (!viewerForm.current) return;
    if (!formViewSelected?._id) return;

    try {
      const schema = JSON.parse(formViewSelected.config);
      viewerForm.current.importSchema(schema);
    } catch (err) {
      console.error("Error:", err);
    }
  }, [isOpen, formViewSelected?._id, formViewSelected?.config]);

  useEffect(() => {
    setPage(0);
  }, [searchText]);

  const handleEntered = () => {
    if (!viewFormRef.current) return;

    viewerForm.current?.destroy();
    viewerForm.current = new Form({ container: viewFormRef.current });

    if (formViewSelected?._id) {
      try {
        const schema = JSON.parse(formViewSelected.config);
        viewerForm.current.importSchema(schema);
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  const handleExited = () => {
    viewerForm.current?.destroy();
    viewerForm.current = null;
  };

  const handleClick = (form: FormConfig) => {
    setFormViewSelected(form);
  };

  function handleDoubleClick(form: FormConfig) {
    setCurrentForm(form);
    setFormViewSelected(form);
    onClose();
  }

  const handleKeyDown = (form: FormConfig) => {
    setCurrentForm(form);
    setFormViewSelected(form);
    onClose();
  };

  async function handleClickOk() {
    if (formViewSelected._id) {
      setCurrentForm(formViewSelected);
      onClose();
    } else {
      showWarn(t("No form selected"));
    }
  }

  async function handleClickRefresh() {
    refetch();
  }

  const handleClickDelete = useCallback(
    (formId: string) => {
      openConfirm({
        title: t("Delete Model"),
        message: t("Are you sure you want to delete this model?"),
        onOk: () => {
          deleteFormMutation.mutate(
            { formId },
            {
              onSettled: () => closeConfirm(),
            }
          );
        },
      });
    },
    [deleteFormMutation, t, openConfirm, closeConfirm]
  );

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullScreen
        sx={{
          ...dialogStyles(theme),
          "& .MuiDialog-paper": {
            width: "95vw",
            height: "95vh",
            margin: 0,
            borderRadius: 2,
          },
        }}
        TransitionProps={{
          onEntered: handleEntered,
          onExited: handleExited,
        }}
        keepMounted
      >
        <DialogTitle>
          <Typography>{t("Forms")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", padding: 0, overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: 670,
              height: "100%",
              gap: 0.5,
              p: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <SearchTextField
              value={searchText}
              onChangeDebounced={(val) => setSearchText(val)}
              tooltip="Search forms"
              width={"100%"}
            />

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={forms.length}
                    itemSize={50}
                    itemData={{
                      items: forms,
                      handleClick,
                      handleDoubleClick,
                      handleKeyDown,
                      handleClickDelete,
                      formViewSelected,
                    }}
                  >
                    {Item}
                  </List>
                )}
              </AutoSizer>
            </Box>

            <CustomTablePagination
              count={totalModels}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>

          <Box
            className="form-container"
            ref={viewFormRef}
            sx={{
              flex: 1,
              backgroundColor: theme.palette.background.paper,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClickOk} className="blue">
            {t("OK")}
          </Button>
          <Button onClick={handleClickRefresh} className="blue">
            {t("Refresh")}
          </Button>
          <Button
            onClick={() => handleClickDelete(formViewSelected._id)}
            className="red"
          >
            {t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormListDialog;
