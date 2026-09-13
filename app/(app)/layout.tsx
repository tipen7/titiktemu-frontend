import { AppSidebar } from "@/app/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/app/components/ui/sidebar";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
