export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-white border-r p-4">Sidebar</aside>
      <section className="p-6">{children}</section>
    </div>
  );
}
