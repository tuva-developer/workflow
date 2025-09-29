import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/components/pages/LoginPage";
import HomePage from "@/components/pages/HomePage";
import InstanceViewPage from "@/components/pages/InstanceViewPage";
import MessageError from "@/components/common/MessageError";
import GeneralProtectedRoute from "@/components/layout/GeneralProtectedRoute";
import ManagementPage from "@/components/pages/ManagementPage";
import ModelViewPage from "@/components/pages/ModelViewPage";
import TasksPage from "@/components/pages/TasksPage";
import EditorPage from "@/components/pages/EditorPage";
import ModelsPage from "@/components/pages/ModelsPage";
import InstancesPage from "@/components/pages/InstancesPage";
import SchedulesPage from "@/components/pages/SchedulesPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/message_error" element={<MessageError />} />
      <Route path="/public/instance/:instanceId" element={<InstanceViewPage />} />

      <Route element={<GeneralProtectedRoute />}>
        <Route path="/design" element={<EditorPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/management" element={<ManagementPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/instances" element={<InstancesPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/model/:modelId" element={<ModelViewPage />} />
        <Route path="/instance/:instanceId" element={<InstanceViewPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
