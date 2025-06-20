
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This is your profile page. You can view and edit your profile information here.</p>
            {/* Placeholder for profile content */}
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © {new Date().getFullYear()} TaskTango. Crafted with 🧠 & ❤️.
      </footer>
    </div>
  );
}
