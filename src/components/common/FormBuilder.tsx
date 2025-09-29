import { FormEditor } from "@bpmn-io/form-js";
import { Box, Tooltip, useTheme } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
import "@bpmn-io/form-js/dist/assets/form-js.css";
import { LuView } from "react-icons/lu";
import { VscNewFile } from "react-icons/vsc";
import { BsSave } from "react-icons/bs";
import { RxUpdate } from "react-icons/rx";
import { AiOutlineDelete } from "react-icons/ai";
import { CiCircleList } from "react-icons/ci";
import FormListDialog from "@/components/dialogs/FormListDlg";
import CreateFormDialog from "@/components/dialogs/CreateFormDlg";
import { ToolbarButton, ToolbarButtonRed } from "@/styles/styles";
import FormPreviewDialog from "@/components/dialogs/FormPreviewDlg";
import { useTranslation } from "react-i18next";
import { defaultFormConfig } from "@/utils/defines";
import { useAppContext } from "@/hooks/useAppContext";
import { showWarn } from "@/utils/toastConfig";
import {
  useDeleteForm,
  useUpdateForm,
} from "@/hooks/mutations/useFormMutations";

const defaultFormSchema = {
  schemaVersion: 18,
  exporter: {
    name: "form-js",
    version: "0.1.0",
  },
  components: [],
  type: "default",
};

export default function FormBuilder() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { openConfirm, closeConfirm } = useAppContext();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const formEditor = useRef<FormEditor | null>(null);
  const [isCreateFormDialogOpen, setIsCreateFormDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewFormSchema, setPreviewFormSchema] = useState("");
  const [isFormListDialogOpen, setIsFormListDialogOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState<FormConfig>(defaultFormConfig);
  const [formSchema, setFormSchema] = useState("");

  const updateFormMutation = useUpdateForm();
  const deleteFormMutation = useDeleteForm();

  useEffect(() => {
    if (!editorRef.current) return;

    formEditor.current = new FormEditor({ container: editorRef.current });
    (async () => {
      try {
        await formEditor.current?.importSchema(defaultFormSchema);
      } catch (err) {
        console.error("Error:", err);
      }
    })();

    return () => {
      formEditor.current?.destroy();
      formEditor.current = null;
    };
  }, []);

  useEffect(() => {
    if (currentForm._id === "" || !formEditor.current) return;

    formEditor.current?.importSchema(JSON.parse(currentForm.config));
  }, [currentForm]);

  async function handleFormList() {
    setIsFormListDialogOpen(true);
  }

  const handleNew = useCallback(async () => {
    await formEditor.current?.importSchema(defaultFormSchema);

    setCurrentForm({ name: "", config: "", description: "", _id: "" });

    closeConfirm();
  }, [closeConfirm]);

  async function handleSave() {
    const schema = await formEditor.current?.getSchema();

    setFormSchema(JSON.stringify(schema) || "");
    setIsCreateFormDialogOpen(true);
  }

  async function handleUpdate() {
    if (currentForm._id === "") {
      showWarn(t("Form has not been saved"));

      return;
    }

    const formSchema = await formEditor.current?.getSchema();

    updateFormMutation.mutate({
      id: currentForm._id,
      formSchema,
    });
  }

  const handlePreview = async () => {
    const schema = await formEditor.current?.getSchema();
    setPreviewFormSchema(schema);
    setIsPreviewDialogOpen(true);
  };

  const handleClickDelete = useCallback(
    (id: string) => {
      openConfirm({
        title: t("Delete Form"),
        message: t("Are you sure you want to delete this form?"),
        onOk: () => {
          deleteFormMutation.mutate(
            { formId: id },
            {
              onSettled: () => {
                handleNew();
              },
            }
          );
        },
      });
    },
    [deleteFormMutation, t, openConfirm, handleNew]
  );

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: theme.palette.background.default,
          display: "flex",
          flexDirection: "row",
          position: "relative",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "60px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
            padding: "5px",
            borderRight: `1px solid ${theme.palette.divider}`,
            "& button": {
              padding: "8px 10px",
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              borderRadius: 2,
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <Tooltip title={t("Form list")} arrow placement="right">
            <ToolbarButton
              onClick={handleFormList}
              onMouseDown={(e) => e.preventDefault()}
            >
              <CiCircleList />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title={t("Preview form")} arrow placement="right">
            <ToolbarButton
              onClick={handlePreview}
              onMouseDown={(e) => e.preventDefault()}
            >
              <LuView />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title={t("New form")} arrow placement="right">
            <ToolbarButton
              onClick={handleNew}
              onMouseDown={(e) => e.preventDefault()}
            >
              <VscNewFile />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title={t("Save form")} arrow placement="right">
            <ToolbarButton onClick={handleSave}>
              <BsSave />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title={t("Update form")} arrow placement="right">
            <ToolbarButton
              onClick={handleUpdate}
              onMouseDown={(e) => e.preventDefault()}
            >
              <RxUpdate />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title={t("Delete form")} arrow placement="right">
            <ToolbarButtonRed
              onClick={() => handleClickDelete(currentForm._id)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <AiOutlineDelete />
            </ToolbarButtonRed>
          </Tooltip>
        </Box>
        <Box
          ref={editorRef}
          sx={{ width: "calc(100% - 60px)", height: "100%" }}
        />
      </Box>

      <CreateFormDialog
        isOpen={isCreateFormDialogOpen}
        onClose={() => setIsCreateFormDialogOpen(false)}
        setCurrentForm={setCurrentForm}
        formSchema={formSchema}
      />

      <FormPreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        formSchema={previewFormSchema}
      />

      <FormListDialog
        isOpen={isFormListDialogOpen}
        onClose={() => setIsFormListDialogOpen(false)}
        currentForm={currentForm}
        setCurrentForm={setCurrentForm}
      />
    </>
  );
}
