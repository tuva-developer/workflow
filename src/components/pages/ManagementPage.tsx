import "react-toastify/dist/ReactToastify.css";
import "flexlayout-react/style/light.css";
import { useState } from "react";
import { Box } from "@mui/material";
import usePageTitle from "@/hooks/usePageTitle";
import UserTable from "@/components/tables/UsersTable";
import GroupsTable from "@/components/tables/GroupsTable";
import ModelCategoriesTable from "@/components/tables/ModelCategoriesTable";
import ModelTypesTable from "@/components/tables/ModelTypesTable";
import AppBarCustom from "@/components/layout/AppBarCustom";
import { MdGroups, MdManageAccounts } from "react-icons/md";
import { TiFlowParallel, TiFlowSwitch } from "react-icons/ti";

const panelSx = (active: boolean) => ({
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  display: "block",
  opacity: active ? 1 : 0,
  pointerEvents: active ? "auto" : "none",
});

function ManagementPage() {
  usePageTitle("Management");
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
          { label: "Users ", icon: MdManageAccounts },
          { label: "Groups", icon: MdGroups },
          { label: "Workflow categories", icon: TiFlowParallel },
          { label: "Workflow types", icon: TiFlowSwitch },
        ]}
        setTabIndex={setTabIndex}
      />

      <Box sx={{ position: "relative", minHeight: 0, overflow: "hidden" }}>
        <Box sx={panelSx(tabIndex === 0)}>
          <UserTable />
        </Box>
        <Box sx={panelSx(tabIndex === 1)}>
          <GroupsTable />
        </Box>
        <Box sx={panelSx(tabIndex === 2)}>
          <ModelCategoriesTable />
        </Box>
        <Box sx={panelSx(tabIndex === 3)}>
          <ModelTypesTable />
        </Box>
      </Box>
    </Box>
  );
}

export default ManagementPage;
