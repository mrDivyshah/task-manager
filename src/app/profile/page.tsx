
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit3, Save, XCircle, ShieldCheck, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormData {
  name: string;
  email: string;
  gender: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    gender: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        gender: (session.user as any).gender || "other", 
      });
    }
    setCurrentYear(new Date().getFullYear());
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleEditToggle = () => {
    if (isEditing && session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        gender: (session.user as any).gender || "other",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
    });
    setIsEditing(false);
    setIsSavingProfile(false);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5" />,
      });
      return;
    }
    if (!currentPassword || !newPassword) {
        toast({
            title: "Missing Fields",
            description: "Please fill in all password fields.",
            variant: "destructive",
            icon: <AlertTriangle className="h-5 w-5" />,
        });
        return;
    }
    setIsUpdatingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsUpdatingPassword(false);
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!session) {
    router.push("/"); 
    return null;
  }


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-xl">
          <CardHeader className="space-y-4">
            <Button variant="outline" onClick={() => router.back()} className="self-start">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline text-2xl">Profile</CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEditToggle}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
            <CardDescription>View and manage your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleSaveProfile}>
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24 border-2 border-primary/50 shadow-md">
                    <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User avatar"} data-ai-hint="profile avatar" />
                    <AvatarFallback className="text-3xl bg-muted">
                      {getUserInitials(session.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div>
                  <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 bg-background border-input focus:ring-primary"
                    />
                  ) : (
                    <p className="text-lg font-medium text-foreground mt-1">{formData.name || "Not set"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground/80">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 bg-background border-input focus:ring-primary"
                      />
                  ) : (
                    <p className="text-lg text-foreground mt-1">{formData.email || "Not set"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender" className="text-foreground/80">Gender</Label>
                  {isEditing ? (
                    <Select name="gender" value={formData.gender} onValueChange={handleGenderChange}>
                      <SelectTrigger className="w-full mt-1 bg-background border-input focus:ring-primary">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-lg text-foreground mt-1 capitalize">{formData.gender || "Not set"}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleEditToggle} disabled={isSavingProfile}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" disabled={isSavingProfile}>
                    {isSavingProfile ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </form>

            <Separator />

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-1">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                  Update your password for enhanced account security.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-background border-input focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background border-input focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-background border-input focus:ring-primary"
                  required
                />
              </div>
              <Button type="submit" variant="secondary" className="w-full sm:w-auto" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © {currentYear} TaskFlow. Crafted with 🧠 & ❤️.
      </footer>
    </div>
  );
}
    

    

