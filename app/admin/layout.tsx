import { AdminNavbar } from "./_components/AdminNavbar";
import { AdminSidebar } from "./_components/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            <AdminSidebar />
            <div className="md:ml-64 min-h-screen flex flex-col">
                <AdminNavbar />
                <main className="flex-1 p-6 md:p-10 z-0 relative">
                    <div className="max-w-[1600px] mx-auto animate-fade-in text-black">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
