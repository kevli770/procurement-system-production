// app/(dashboard)/layout.tsx
// Dashboard layout with header and sidebar

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="mr-64 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
