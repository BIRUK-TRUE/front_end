import { LanguageSwitcher } from '@/components/auth/language-switcher';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold text-foreground">SMS</span>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main content */}
      <main
        className="flex flex-1 items-center justify-center px-4 py-8"
        id="main-content"
        role="main"
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} School Management System</p>
      </footer>
    </div>
  );
}
