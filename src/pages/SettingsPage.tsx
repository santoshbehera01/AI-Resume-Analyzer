import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Settings } from "lucide-react";

const SettingsPage = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center border-b border-border bg-background sticky top-0 z-50 px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </h2>
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">Settings coming soon. Configure scoring weights, theme preferences, and more.</p>
          </div>
        </main>
      </div>
    </div>
  </SidebarProvider>
);

export default SettingsPage;
