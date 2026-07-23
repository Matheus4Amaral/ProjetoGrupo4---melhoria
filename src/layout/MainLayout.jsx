import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "./Header";

function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="md:mt-0! md:mr-0! md:rounded-t-none md:rounded-r-none">
        <Header />
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default MainLayout;
