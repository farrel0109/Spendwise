import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { PrivacyProvider } from "@/context/PrivacyContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivacyProvider>
      <div className="min-h-screen bg-[var(--color-base)] flex">
        {/* Subtle background gradient - matches landing page */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[120px]" />
        </div>

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          {/* Top Bar */}
          <TopBar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-28 md:pb-8">
            <div className="max-w-7xl mx-auto animate-fadeIn">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PrivacyProvider>
  );
}
