
"use client";

import { useState, useEffect } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { NotificationStyle } from "@/app/settings/page"; // Import the type

export function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const [mounted, setMounted] = useState(false);
  const [localNotificationStyle, setLocalNotificationStyle] = useState<NotificationStyle>("dock");
  const [localNotificationSoundEnabled, setLocalNotificationSoundEnabled] = useState<boolean>(false);

  // Values from localStorage will be undefined on first SSR pass, then update on client
  const [persistedNotificationStyle] = useLocalStorage<NotificationStyle>("tasktango-notification-style", "dock");
  const [persistedNotificationSoundEnabled] = useLocalStorage<boolean>("tasktango-notification-sound", false);

  useEffect(() => {
    setMounted(true);
    setLocalNotificationStyle(persistedNotificationStyle);
    setLocalNotificationSoundEnabled(persistedNotificationSoundEnabled);
  }, [persistedNotificationStyle, persistedNotificationSoundEnabled]);


  const handleNotificationOpenChange = (open: boolean) => {
    if (open && mounted && localNotificationSoundEnabled) {
      console.log("Playing notification sound... (beep boop!)");
      // To play an actual sound, you would do something like:
      // const audio = new Audio('/sounds/notification.mp3'); // Ensure sound file is in /public/sounds
      // audio.play().catch(error => console.error("Error playing sound:", error));
    }
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const notificationPanelContent = (
    <>
      <SheetHeader className={localNotificationStyle === 'float' ? 'p-4 border-b' : ''}>
        <SheetTitle>Notifications</SheetTitle>
        <SheetDescription>
          Here are your latest updates.
        </SheetDescription>
      </SheetHeader>
      <div className="p-4 py-8">
        <p className="text-sm text-muted-foreground text-center">
          No new notifications yet.
        </p>
      </div>
      <SheetFooter className={`mt-auto ${localNotificationStyle === 'float' ? 'p-4 border-t' : ''}`}>
         {/* Popover doesn't use SheetClose, so Button for float style */}
        {localNotificationStyle === 'dock' ? (
            <SheetClose asChild>
                <Button variant="outline" className="w-full">Close</Button>
            </SheetClose>
        ) : (
             <Button variant="outline" className="w-full" onClick={() => {
                // For Popover, manually control open state if needed or rely on default trigger behavior
                // This button could be used to programmatically close Popover if Popover's open state was managed
             }}>Close</Button>
        )}
      </SheetFooter>
    </>
  );

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

          {mounted && localNotificationStyle === "dock" && (
            <Sheet onOpenChange={handleNotificationOpenChange}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" aria-label="View notifications (Dock)">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                {notificationPanelContent}
              </SheetContent>
            </Sheet>
          )}

          {mounted && localNotificationStyle === "float" && (
             <Popover onOpenChange={handleNotificationOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" aria-label="View notifications (Float)">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                {notificationPanelContent}
              </PopoverContent>
            </Popover>
          )}
          
          {!mounted && ( // Fallback / placeholder while waiting for client-side mount
             <Button variant="outline" size="icon" className="h-9 w-9" aria-label="View notifications" disabled>
                <Bell className="h-5 w-5" />
             </Button>
          )}

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
                      // Attempt to focus the email input on the main page if it exists
                      const mainPageEmailInput = document.getElementById('email-login');
                      if (mainPageEmailInput) mainPageEmailInput.focus();
                      else router.push('/'); // Fallback if not on main page or input not found
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
