import { Box } from "@mui/material";
import Instance from "@/components/common/InstanceView";
import { useParams } from "react-router-dom";
import usePageTitle from "@/hooks/usePageTitle";

function InstanceViewPage() {
  usePageTitle("Instance");
  const { instanceId } = useParams();

  return (
    <Box display="flex" height="100vh" width={"100vw"}>
      <Instance instanceId={instanceId ?? ""} />
    </Box>
  );
}

export default InstanceViewPage;
