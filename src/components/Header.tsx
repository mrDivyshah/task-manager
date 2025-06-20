
"use client";

import { LogoIcon } from './icons/LogoIcon';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, LogIn, LogOut, User, Settings as SettingsIcon, Bell } from "lucide-react";
import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

export function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border/50 shadow-sm bg-card">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-semibold text-foreground">
            TaskTango
          </h1>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9" aria-label="View notifications">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  Here are your latest updates.
                </SheetDescription>
              </SheetHeader>
              <div className="p-4 py-8">
                <p className="text-sm text-muted-foreground text-center">
                  No new notifications yet.
                </p>
                {/* Placeholder for actual notification items */}
              </div>
              <SheetFooter className="mt-auto">
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">Close</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                {isLoading ? (
                  <Menu className="h-5 w-5 animate-pulse" />
                ) : session?.user?.image ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image} alt={session.user.name || "User Avatar"} />
                    <AvatarFallback>{getUserInitials(session.user.name)}</AvatarFallback>
                  </Avatar>
                ) : session?.user ? ( 
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials(session.user.name)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isLoading ? (
                <DropdownMenuLabel>Loading...</DropdownMenuLabel>
              ) : session?.user ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signIn("google", { callbackUrl: "/" })} className="flex items-center cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login with Google
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => {
                      const emailForm = document.getElementById('email-login');
                      if (emailForm) emailForm.focus();
                    }} className="flex items-center cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login with Email
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
    
