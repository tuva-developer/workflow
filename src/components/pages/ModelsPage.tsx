import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import usePageTitle from "@/hooks/usePageTitle";
import MyModelTable from "@/components/tables/MyModelTable";
import EditableModelTable from "@/components/tables/EditableModelTable";
import ExecutableModelTable from "@/components/tables/ExecutableModelTable";
import AppBarCustom from "@/components/layout/AppBarCustom";
import { MdRebaseEdit } from "react-icons/md";
import { IoPlay } from "react-icons/io5";
import { TiFlowMerge } from "react-icons/ti";
import { Box } from "@mui/material";

const panelSx = (active: boolean) => ({
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  display: "block",
  opacity: active ? 1 : 0,
  pointerEvents: active ? "auto" : "none",
});

function ModelsPage() {
  usePageTitle("Models");
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "hidden",
      }}
    >
      <AppBarCustom
        tabs={[
          { label: "My model", icon: TiFlowMerge },
          { label: "Editable model", icon: MdRebaseEdit },
          { label: "Executable model", icon: IoPlay },
        ]}
        setTabIndex={setTabIndex}
      />

      <Box sx={{ position: "relative", minHeight: 0, overflow: "hidden" }}>
        <Box sx={panelSx(tabIndex === 0)}>
          <MyModelTable />
        </Box>
        <Box sx={panelSx(tabIndex === 1)}>
          <EditableModelTable />
        </Box>
        <Box sx={panelSx(tabIndex === 2)}>
          <ExecutableModelTable />
        </Box>
      </Box>
    </Box>
  );
}

export default ModelsPage;
