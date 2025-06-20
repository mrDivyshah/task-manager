import { LogoIcon } from './icons/LogoIcon';

export function Header() {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border/50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-semibold text-foreground">
            TaskTango
          </h1>
        </div>
        {/* Future additions: Theme toggle, User Profile Dropdown */}
      </div>
    </header>
  );
}
