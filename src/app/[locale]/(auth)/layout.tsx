export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" role="main" className="min-h-screen bg-background">
      {children}
    </main>
  );
}
