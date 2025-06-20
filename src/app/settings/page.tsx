
"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Sun, Cog, PanelRightClose, AppWindow, Settings2, ToggleRight, ToggleLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import useLocalStorage from "@/hooks/useLocalStorage";

export type NotificationStyle = "dock" | "float";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [notificationSoundEnabled, setNotificationSoundEnabled] = useLocalStorage<boolean>(
    "tasktango-notification-sound",
    false
  );
  const [notificationStyle, setNotificationStyle] = useLocalStorage<NotificationStyle>(
    "tasktango-notification-style",
    "dock"
  );
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useLocalStorage<boolean>(
    "tasktango-advanced-features",
    false
  );

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
            <Button variant="outline" onClick={() => router.back()} className="self-start mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
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
              <div className="space-y-4">
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

                <Label htmlFor="notification-style-group" className="text-base block pt-4">Notification Window Style</Label>
                 <RadioGroup
                  id="notification-style-group"
                  value={notificationStyle}
                  onValueChange={(value) => setNotificationStyle(value as NotificationStyle)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="notification-style-dock"
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      notificationStyle === "dock" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="dock" id="notification-style-dock" className="sr-only" />
                    <PanelRightClose className={`h-6 w-6 mb-2 ${notificationStyle === "dock" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${notificationStyle === "dock" ? "text-primary" : "text-foreground"}`}>Dock</span>
                  </Label>
                  <Label
                    htmlFor="notification-style-float"
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      notificationStyle === "float" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="float" id="notification-style-float" className="sr-only" />
                    <AppWindow className={`h-6 w-6 mb-2 ${notificationStyle === "float" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${notificationStyle === "float" ? "text-primary" : "text-foreground"}`}>Float</span>
                  </Label>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Selected notification style: {notificationStyle.charAt(0).toUpperCase() + notificationStyle.slice(1)}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium text-foreground mb-3 flex items-center">
                <Settings2 className="mr-2 h-5 w-5 text-muted-foreground" />
                Advanced User Options
              </h3>
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="advanced-features" className="text-base font-medium">
                      Enable Advanced Features
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Unlock experimental settings and developer tools. Use with caution.
                    </p>
                  </div>
                  <Switch
                    id="advanced-features"
                    checked={advancedFeaturesEnabled}
                    onCheckedChange={setAdvancedFeaturesEnabled}
                    aria-label="Toggle advanced features"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Advanced features are currently {advancedFeaturesEnabled ? 'enabled' : 'disabled'}.
                    {advancedFeaturesEnabled && " You might see new options appear in the app."}
                </p>

                {advancedFeaturesEnabled && (
                  <div className="p-4 border border-dashed border-primary/50 rounded-lg bg-primary/5">
                    <p className="text-sm text-primary flex items-center">
                      <ToggleRight className="mr-2 h-5 w-5" />
                      Advanced features are active! More settings will appear here in the future.
                    </p>
                  </div>
                )}
                 {!advancedFeaturesEnabled && (
                  <div className="p-4 border border-dashed border-border rounded-lg bg-muted/30">
                     <p className="text-sm text-muted-foreground flex items-center">
                      <ToggleLeft className="mr-2 h-5 w-5" />
                      Advanced features are currently inactive.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © {new Date().getFullYear()} TaskTango. Crafted with 🧠 & ❤️.
      </footer>
    </div>
  );
}
