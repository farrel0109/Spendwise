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
      <div className="min-h-screen bg-black flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <TopBar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 pb-28 md:pb-6">
            <div className="max-w-6xl mx-auto animate-fadeIn">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PrivacyProvider>
  );
}
