
"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium text-foreground">Account Information</Label>
              <p className="text-sm text-muted-foreground mt-1">This is your profile page. You can view and edit your profile information here.</p>
              {/* Placeholder for profile content */}
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium text-foreground">Subsidiary Options</Label>
              <div className="mt-2 p-4 border rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Subsidiary options will be displayed here.
                  {/* Example: <Input type="text" placeholder="Enter subsidiary ID" /> */}
                </p>
              </div>
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
