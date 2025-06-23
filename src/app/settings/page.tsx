
"use client";

import * as React from "react"; 
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Sun, Cog, PanelRightClose, AppWindow, Settings2, Users, KeyRound, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, type KeyboardEvent, type FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { NotificationStyle } from "@/types";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const { theme, setTheme, systemTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
<<<<<<< HEAD
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
=======
>>>>>>> master
  
  // Settings state, initialized from session
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(false);
  const [notificationStyle, setNotificationStyle] = useState<NotificationStyle>('dock');
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);

  // Team creation state
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamCode, setTeamCode] = useState<string[]>(Array(6).fill(""));
  const teamCodeInputsRef = Array(6).fill(null).map(() => React.createRef<HTMLInputElement>());

  useEffect(() => {
    setMounted(true);
<<<<<<< HEAD
    setCurrentYear(new Date().getFullYear());
=======
>>>>>>> master
    if (session) {
      setNotificationSoundEnabled(session.user.notificationSoundEnabled ?? false);
      setNotificationStyle(session.user.notificationStyle ?? 'dock');
      setAdvancedFeaturesEnabled(session.user.advancedFeaturesEnabled ?? false);
    }
  }, [session]);

  const handleSettingChange = async (key: string, value: any) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error('Failed to save setting.');
      
      // Update local session to reflect change immediately
      await updateSession({ user: { ...session?.user, [key]: value } });

      toast({
        title: "Setting Saved",
        icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
        duration: 3000,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  const handleTeamCodeChange = (index: number, value: string) => {
    if (/^[a-zA-Z0-9]?$/.test(value)) {
      const newTeamCode = [...teamCode];
      newTeamCode[index] = value.toUpperCase();
      setTeamCode(newTeamCode);

      if (value && index < 5 && teamCodeInputsRef[index + 1]?.current) {
        teamCodeInputsRef[index + 1].current?.focus();
      }
    }
  };

  const handleTeamCodeKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !teamCode[index] && index > 0 && teamCodeInputsRef[index - 1]?.current) {
      teamCodeInputsRef[index - 1].current?.focus();
    }
  };
  
  const handleCreateTeamSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const finalTeamCode = teamCode.join("");
    if (newTeamName.trim() === "") {
      toast({ title: "Team Name Required", description: "Please enter a name for your team.", variant: "destructive" });
      return;
    }
    if (finalTeamCode.length !== 6) {
      toast({ title: "Invalid Team Code", description: "Team code must be 6 characters.", variant: "destructive" });
      return;
    }
    
    try {
        const res = await fetch('/api/teams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newTeamName.trim(), code: finalTeamCode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        toast({ title: "Team Created Successfully!", description: `Team "${data.name}" is ready.`, icon: <CheckCircle2 className="h-5 w-5 text-primary" /> });
        setNewTeamName("");
        setTeamCode(Array(6).fill(""));
        setIsCreateTeamDialogOpen(false);
    } catch (error) {
        toast({ title: "Failed to Create Team", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
           <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
<<<<<<< HEAD
          © {currentYear} TaskFlow. Crafted with 🧠 & ❤️.
=======
          © 2025 TaskFlow. All rights reserved.
>>>>>>> master
        </footer>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
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
                <RadioGroup id="theme-group" value={theme} onValueChange={setTheme} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Label htmlFor="theme-light" className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${theme === "light" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                    <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                    <Sun className={`h-6 w-6 mb-2 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${theme === "light" ? "text-primary" : "text-foreground"}`}>Light</span>
                  </Label>
                  <Label htmlFor="theme-dark" className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                    <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                    <Moon className={`h-6 w-6 mb-2 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${theme === "dark" ? "text-primary" : "text-foreground"}`}>Dark</span>
                  </Label>
                  <Label htmlFor="theme-system" className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${theme === "system" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                    <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                    <Cog className={`h-6 w-6 mb-2 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${theme === "system" ? "text-primary" : "text-foreground"}`}>System</span>
                  </Label>
                </RadioGroup>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5"><Label htmlFor="notification-sound" className="text-base font-medium">Notification Sound</Label><p className="text-sm text-muted-foreground">Enable or disable sounds for task notifications.</p></div>
                  <Switch id="notification-sound" checked={notificationSoundEnabled} onCheckedChange={(checked) => { setNotificationSoundEnabled(checked); handleSettingChange('notificationSoundEnabled', checked); }} />
                </div>
                 <Label htmlFor="notification-style-group" className="text-base block pt-4">Notification Window Style</Label>
                 <RadioGroup id="notification-style-group" value={notificationStyle} onValueChange={(value: NotificationStyle) => { setNotificationStyle(value); handleSettingChange('notificationStyle', value); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Label htmlFor="notification-style-dock" className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${notificationStyle === "dock" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                    <RadioGroupItem value="dock" id="notification-style-dock" className="sr-only" /><PanelRightClose className={`h-6 w-6 mb-2 ${notificationStyle === "dock" ? "text-primary" : "text-muted-foreground"}`} /><span className={`font-medium ${notificationStyle === "dock" ? "text-primary" : "text-foreground"}`}>Dock</span>
                  </Label>
                  <Label htmlFor="notification-style-float" className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${notificationStyle === "float" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                    <RadioGroupItem value="float" id="notification-style-float" className="sr-only" /><AppWindow className={`h-6 w-6 mb-2 ${notificationStyle === "float" ? "text-primary" : "text-muted-foreground"}`} /><span className={`font-medium ${notificationStyle === "float" ? "text-primary" : "text-foreground"}`}>Float</span>
                  </Label>
                </RadioGroup>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium text-foreground mb-3 flex items-center"><Settings2 className="mr-2 h-5 w-5 text-muted-foreground" />Advanced User Options</h3>
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5"><Label htmlFor="advanced-features" className="text-base font-medium">Enable Advanced Features</Label><p className="text-sm text-muted-foreground">Unlock team management and other experimental features.</p></div>
                  <Switch id="advanced-features" checked={advancedFeaturesEnabled} onCheckedChange={(checked) => { setAdvancedFeaturesEnabled(checked); handleSettingChange('advancedFeaturesEnabled', checked); }} />
                </div>
                {advancedFeaturesEnabled && (
                  <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto"><Users className="mr-2 h-4 w-4" />Create a New Team</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card rounded-lg shadow-xl">
                      <DialogHeader><DialogTitle className="font-headline text-2xl">Create New Team</DialogTitle><DialogDescription>Enter a name and a unique 6-character code for your team.</DialogDescription></DialogHeader>
                      <form onSubmit={handleCreateTeamSubmit} className="space-y-6 py-4">
                        <div>
                          <Label htmlFor="new-team-name" className="text-foreground/80">Team Name</Label>
                          <Input id="new-team-name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="e.g., Project Alpha Squad" className="mt-1 bg-background border-input focus:ring-primary" required />
                        </div>
                        <div>
                          <Label htmlFor="team-code-0" className="text-foreground/80">Team Code (6 characters)</Label>
                          <div className="flex justify-between gap-2 mt-1">
                            {teamCode.map((digit, index) => (
                              <Input key={index} id={`team-code-${index}`} ref={teamCodeInputsRef[index]} type="text" maxLength={1} value={digit} onChange={(e) => handleTeamCodeChange(index, e.target.value)} onKeyDown={(e) => handleTeamCodeKeyDown(index, e)} className="w-10 h-12 text-center text-lg font-mono bg-background border-input focus:ring-primary" required />
                            ))}
                          </div>
                        </div>
                        <DialogFooter className="mt-8">
                          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                          <Button type="submit" variant="default"><Users className="mr-2 h-4 w-4" /> Create Team</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
<<<<<<< HEAD
        © {currentYear} TaskFlow. Crafted with 🧠 & ❤️.
=======
        © 2025 TaskFlow. All rights reserved.
>>>>>>> master
      </footer>
    </div>
  );
}
