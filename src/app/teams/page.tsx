
"use client";

import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Team } from "@/types";
import { ArrowLeft, Edit3, Users, Trash2, PlusCircle, Save, XCircle, CheckCircle2, AlertTriangle, Info, SearchX } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default function TeamsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [teams, setTeams] = useLocalStorage<Team[]>("tasktango-teams", []);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [editedTeamName, setEditedTeamName] = useState("");

  const handleOpenEditDialog = (team: Team) => {
    setTeamToEdit(team);
    setEditedTeamName(team.name);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setTeamToEdit(null);
    setEditedTeamName("");
  };

  const handleSaveTeamChanges = (e: FormEvent) => {
    e.preventDefault();
    if (!teamToEdit || editedTeamName.trim() === "") {
      toast({
        title: "Invalid Name",
        description: "Team name cannot be empty.",
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5" />,
      });
      return;
    }
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.id === teamToEdit.id ? { ...team, name: editedTeamName.trim() } : team
      )
    );
    toast({
      title: "Team Updated",
      description: `Team "${editedTeamName.trim()}" has been updated.`,
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
    });
    handleCloseEditDialog();
  };

  const handleDeleteTeam = (teamId: string) => {
    const teamToDelete = teams.find(t => t.id === teamId);
    if (teamToDelete) {
        setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
        toast({
            title: "Team Deleted",
            description: `Team "${teamToDelete.name}" has been removed.`,
            variant: "destructive",
            icon: <Trash2 className="h-5 w-5" />,
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-xl">
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => router.back()} className="self-start">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
                </Button>
                <Button onClick={() => router.push('/settings')} className="shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Team
                </Button>
            </div>
            <CardTitle className="font-headline text-2xl">Manage Teams</CardTitle>
            <CardDescription>View, edit, or delete your teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {teams.length === 0 ? (
              <div className="mt-12 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-xl bg-card/50">
                <SearchX size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">No Teams Yet</h3>
                <p className="max-w-sm">
                  You haven't created or joined any teams. Go to Settings {'>'} Advanced User Options to create a new team.
                </p>
                 <Button onClick={() => router.push('/settings')} className="mt-6">
                    Go to Settings
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teams.map(team => (
                  <Card key={team.id} className="shadow-md rounded-lg flex flex-col">
                    <CardHeader>
                      <CardTitle className="font-semibold text-xl break-all">{team.name}</CardTitle>
                      <CardDescription>
                        Code: <span className="font-mono text-primary">{team.code}</span>
                      </CardDescription>
                       <div className="text-xs text-muted-foreground pt-1">
                        Created: {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <h4 className="text-sm font-medium text-foreground mb-1">Members:</h4>
                      {team.members.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {team.members.slice(0, 3).map(member => (
                            <li key={member} className="truncate">{member}</li>
                          ))}
                          {team.members.length > 3 && <li>...and {team.members.length - 3} more</li>}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No members added yet.</p>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(team)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => handleDeleteTeam(team.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Team</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {teamToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Edit Team: {teamToEdit.name}</DialogTitle>
              <DialogDescription>
                Modify the team's name. User management is coming soon.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveTeamChanges} className="space-y-6 py-4">
              <div>
                <Label htmlFor="edit-team-name" className="text-foreground/80">Team Name</Label>
                <Input
                  id="edit-team-name"
                  value={editedTeamName}
                  onChange={(e) => setEditedTeamName(e.target.value)}
                  className="mt-1 bg-background border-input focus:ring-primary"
                  required
                />
              </div>
               <div className="space-y-2">
                <Label className="text-foreground/80">Team Code</Label>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded-md">{teamToEdit.code}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Members</Label>
                <p className="text-sm text-muted-foreground italic">
                  User management functionality will be available here in a future update.
                </p>
              </div>
              <DialogFooter className="mt-8">
                <Button type="button" variant="outline" onClick={handleCloseEditDialog}>
                   <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" variant="default">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
       <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © {new Date().getFullYear()} TaskTango. Crafted with 🧠 & ❤️.
      </footer>
    </div>
  );
}
