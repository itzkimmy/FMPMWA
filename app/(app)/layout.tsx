import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/ui/ToastProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col md:flex-row w-full overflow-x-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <TopBar />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 overflow-x-hidden">
          <ToastProvider>{children}</ToastProvider>
        </main>
        {/* Mobile bottom navigation bar */}
        <BottomNav />
      </div>
    </div>
  );
}