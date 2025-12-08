import { useState } from "react";
import { Box } from "@mui/material";
import BpmnEditor from "@/components/common/BpmnEditor";
import FormBuilder from "@/components/common/FormBuilder";
import usePageTitle from "@/hooks/usePageTitle";
import AppBarCustom from "@/components/layout/AppBarCustom";
import { MdDynamicForm, MdRebaseEdit } from "react-icons/md";

const EditorPage = () => {
  usePageTitle("Design");
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <AppBarCustom
        tabs={[
          { label: "Workflow design", icon: MdRebaseEdit },
          { label: "Form builder", icon: MdDynamicForm },
        ]}
        setTabIndex={setTabIndex}
      />

      <Box
        sx={{
          overflow: "hidden",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{ display: tabIndex === 0 ? "block" : "none", height: "100%" }}
        >
          <BpmnEditor />
        </Box>
        <Box
          sx={{ display: tabIndex === 1 ? "block" : "none", height: "100%" }}
        >
          <FormBuilder />
        </Box>
      </Box>
    </>
  );
};

export default EditorPage;
