import "react-toastify/dist/ReactToastify.css";
import usePageTitle from "@/hooks/usePageTitle";
import AppBarCustom from "@/components/layout/AppBarCustom";
import { MdSchedule } from "react-icons/md";
import SchedulesTable from "@/components/tables/SchedulesTable";

function SchedulesPage() {
  usePageTitle("Schedules");

  return (
    <>
      <AppBarCustom tabs={[{ label: "Schedules", icon: MdSchedule }]} />

      <SchedulesTable />
    </>
  );
}

export default SchedulesPage;