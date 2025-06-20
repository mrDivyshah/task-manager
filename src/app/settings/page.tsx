
"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Sun, Cog, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          {/* You can add a loader here if you prefer */}
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          © {new Date().getFullYear()} TaskTango. Crafted with 🧠 & ❤️.
        </footer>
      </div>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Appearance</h3>
              <div className="space-y-4">
                <Label htmlFor="theme-group" className="text-base">Change Theme</Label>
                <RadioGroup
                  id="theme-group"
                  value={theme}
                  onValueChange={setTheme}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="theme-light"
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      theme === "light" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                    <Sun className={`h-6 w-6 mb-2 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${theme === "light" ? "text-primary" : "text-foreground"}`}>Light</span>
                  </Label>
                  <Label
                    htmlFor="theme-dark"
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                    <Moon className={`h-6 w-6 mb-2 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${theme === "dark" ? "text-primary" : "text-foreground"}`}>Dark</span>
                  </Label>
                  <Label
                    htmlFor="theme-system"
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      theme === "system" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                    <Cog className={`h-6 w-6 mb-2 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${theme === "system" ? "text-primary" : "text-foreground"}`}>System</span>
                  </Label>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Current active theme: {currentTheme ? currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1) : 'Loading...'}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Notifications</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="notification-sound" className="text-base font-medium">
                    Notification Sound
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable sounds for task notifications.
                  </p>
                </div>
                <Switch
                  id="notification-sound"
                  checked={notificationSoundEnabled}
                  onCheckedChange={setNotificationSoundEnabled}
                  aria-label="Toggle notification sound"
                />
              </div>
               <p className="text-xs text-muted-foreground mt-2">
                  Notification sounds are currently {notificationSoundEnabled ? 'enabled' : 'disabled'}.
                </p>
            </div>

          </CardContent>
          <CardFooter className="flex justify-start border-t pt-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © {new Date().getFullYear()} TaskTango. Crafted with 🧠 & ❤️.
      </footer>
    </div>
  );
}
