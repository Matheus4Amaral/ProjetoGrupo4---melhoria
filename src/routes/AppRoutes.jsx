import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "@/layout/MainLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Teams from "@/pages/Teams";
import Feedback from "@/pages/Feedback";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";
import NovaAvaliacao from "@/pages/NovaAvaliacao";
import MinhasAvaliacoes from "@/pages/MinhasAvaliacoes";
import DefinirSenha from "@/pages/DefinirSenha";
import Templates from "@/pages/Templates";
import TemplateEditor from "@/pages/TemplateEditor";
import Ciclos from "@/pages/Ciclos";
import { ProtectedRoute, RoleRoute } from "@/routes/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de login sem layout */}
        <Route path="/" element={<Login />} />
        <Route path="/definir-senha" element={<DefinirSenha />} />

        {/* Páginas protegidas com layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<RoleRoute allowedRoles={["admin", "rh"]} />}>
              <Route path="/users" element={<Users />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/novo" element={<TemplateEditor mode="create" />} />
              <Route path="/templates/:templateId/clonar" element={<TemplateEditor mode="clone" />} />
              <Route path="/templates/:templateId/editar" element={<TemplateEditor mode="edit" />} />
              <Route path="/templates/editor" element={<Navigate to="/templates/novo" replace />} />
              <Route path="/ciclos" element={<Ciclos />} />
            </Route>
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/minhas-avaliacoes" element={<MinhasAvaliacoes />} />
            <Route path="/nova-avaliacao" element={<NovaAvaliacao />} />
            
            {/* Redirects de caminhos legados */}
            <Route path="/NovaAvaliacao" element={<Navigate to="/nova-avaliacao" replace />} />
            <Route path="/MinhasAvaliacoes" element={<Navigate to="/minhas-avaliacoes" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
