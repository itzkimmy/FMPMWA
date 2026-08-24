import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/ui/ToastProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-studio-bg">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}