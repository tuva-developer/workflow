import "react-toastify/dist/ReactToastify.css";
import usePageTitle from "@/hooks/usePageTitle";
import AppBarCustom from "@/components/layout/AppBarCustom";
import TasksTable from "@/components/tables/TasksTable";
import { RiTaskLine } from "react-icons/ri";

function TasksPage() {
  usePageTitle("Tasks");

  return (
    <>
      <AppBarCustom tabs={[{ label: "Tasks", icon: RiTaskLine }]} />

      <TasksTable />
    </>
  );
}

export default TasksPage;
