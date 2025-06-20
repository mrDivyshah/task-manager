
"use client";

import React, { useState, useEffect } from 'react'; // Added React import
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
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { NotificationStyle } from "@/app/settings/page";

const NotificationTriggerButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { 'aria-label': string }
>((props, ref) => (
  <Button ref={ref} variant="outline" size="icon" className="h-9 w-9" {...props}>
    <Bell className="h-5 w-5" />
    <span className="sr-only">Notifications</span>
  </Button>
));
NotificationTriggerButton.displayName = "NotificationTriggerButton";

const ActualNotificationList = () => (
  <div className="p-4 py-8">
    <p className="text-sm text-muted-foreground text-center">
      No new notifications yet.
    </p>
  </div>
);

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";

  const [mounted, setMounted] = useState(false);
  const [localNotificationStyle, setLocalNotificationStyle] = useState<NotificationStyle>("dock");
  const [localNotificationSoundEnabled, setLocalNotificationSoundEnabled] = useState<boolean>(false);

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
                <NotificationTriggerButton aria-label="View notifications (Dock)" />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                  <SheetDescription>Here are your latest updates.</SheetDescription>
                </SheetHeader>
                <ActualNotificationList />
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full">Close</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )}

          {mounted && localNotificationStyle === "float" && (
             <Popover onOpenChange={handleNotificationOpenChange}>
              <PopoverTrigger asChild>
                <NotificationTriggerButton aria-label="View notifications (Float)" />
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold leading-none tracking-tight">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Here are your latest updates.</p>
                </div>
                <ActualNotificationList />
                {/* Popovers typically close via Escape or clicking outside. 
                    A close button here would require controlling Popover's open state.
                    Omitting footer for simplicity in Popover.
                */}
              </PopoverContent>
            </Popover>
          )}
          
          {!mounted && ( 
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
                      const mainPageEmailInput = document.getElementById('email-login');
                      if (mainPageEmailInput) mainPageEmailInput.focus();
                      else router.push('/'); 
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
