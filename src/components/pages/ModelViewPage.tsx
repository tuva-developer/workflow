import "@/App.css";
import "react-toastify/dist/ReactToastify.css";
import "flexlayout-react/style/light.css";
import BpmnEditor from "@/components/common/BpmnEditor";
import FormBuilder from "@/components/common/FormBuilder";
import { useState } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import usePageTitle from "@/hooks/usePageTitle";
import AIChatbox from "@/components/common/AIChatbox";
import AppBarCustom from "@/components/layout/AppBarCustom";
import { MdDynamicForm, MdRebaseEdit } from "react-icons/md";

function ModelViewPage() {
  usePageTitle("Model");
  const { modelId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <AIChatbox />

      <AppBarCustom
        tabs={[
          { label: "Workflow design", icon: MdRebaseEdit },
          { label: "Form builder", icon: MdDynamicForm },
        ]}
        setTabIndex={setTabIndex}
        isLimit={true}
      />
      <AIChatbox />

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
          <BpmnEditor modelId={modelId} isLimit={true} />
        </Box>
        <Box
          sx={{ display: tabIndex === 1 ? "block" : "none", height: "100%" }}
        >
          <FormBuilder />
        </Box>
      </Box>
    </>
  );
}

export default ModelViewPage;
