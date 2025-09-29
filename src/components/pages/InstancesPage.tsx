import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import usePageTitle from "@/hooks/usePageTitle";
import { Box } from "@mui/material";
import InstanceTable from "@/components/tables/InstancesTable";
import AppBarCustom from "@/components/layout/AppBarCustom";
import { RiListSettingsFill } from "react-icons/ri";

function InstancesPage() {
  usePageTitle("Instances");
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <AppBarCustom
        tabs={[
          { label: "Instances", icon: RiListSettingsFill },
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
          <InstanceTable />
        </Box>
      </Box>
    </>
  );
}

export default InstancesPage;
