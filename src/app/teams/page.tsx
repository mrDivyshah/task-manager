
"use client";

import type { FormEvent, KeyboardEvent } from "react";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Team, TeamMember } from "@/types";
import { ArrowLeft, Edit3, Users, Trash2, PlusCircle, Save, XCircle, CheckCircle2, AlertTriangle, Info, SearchX, UserPlus, Loader2, Check, X } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Separator } from "@/components/ui/separator";

function PendingRequestItem({ teamId, request, onHandleRequest }: { teamId: string, request: TeamMember, onHandleRequest: (teamId: string, userId: string) => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<'accept' | 'reject' | null>(null);

  const handleRequest = async (action: 'accept' | 'reject') => {
    setIsLoading(action);
    try {
      const res = await fetch(`/api/teams/${teamId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestingUserId: request.id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({ title: `Request ${action}ed`, description: `${request.name} has been ${action}ed.`, icon: <CheckCircle2 className="h-5 w-5 text-primary" /> });
      onHandleRequest(teamId, request.id);
    } catch (error) {
      toast({ title: `Failed to ${action} request`, description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex flex-col">
        <span className="font-medium">{request.name}</span>
        <span className="text-xs text-muted-foreground">{request.email}</span>
      </div>
      <div className="flex gap-2">
        <Button size="icon" className="h-7 w-7 bg-green-500 hover:bg-green-600" onClick={() => handleRequest('accept')} disabled={!!isLoading}>
          {isLoading === 'accept' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button size="icon" className="h-7 w-7" variant="destructive" onClick={() => handleRequest('reject')} disabled={!!isLoading}>
          {isLoading === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [editedTeamName, setEditedTeamName] = useState("");

  const [isJoinTeamDialogOpen, setIsJoinTeamDialogOpen] = useState(false);
  const [isJoinTeamLoading, setIsJoinTeamLoading] = useState(false);
  const [joinTeamCodeDigits, setJoinTeamCodeDigits] = useState<string[]>(Array(6).fill(""));
  const joinTeamCodeInputsRef = Array(6).fill(null).map(() => React.createRef<HTMLInputElement>());

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    if (status === 'authenticated') {
      fetchTeams();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router, fetchTeams]);

  const handleRequestHandled = (teamId: string, userId: string) => {
    setTeams(prevTeams => prevTeams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          pendingRequests: team.pendingRequests?.filter(req => req.id !== userId)
        };
      }
      return team;
    }));
    // Optionally, re-fetch all teams to get updated member lists
    fetchTeams();
  };

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

  const handleSaveTeamChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!teamToEdit || editedTeamName.trim() === "") {
      toast({ title: "Invalid Name", description: "Team name cannot be empty.", variant: "destructive" });
      return;
    }
    
    try {
      const res = await fetch(`/api/teams/${teamToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedTeamName.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update team');

      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === teamToEdit.id ? { ...team, name: editedTeamName.trim() } : team
        )
      );
      toast({ title: "Team Updated", description: `Team name changed to "${editedTeamName.trim()}".`, icon: <CheckCircle2 className="h-5 w-5 text-primary" /> });
      handleCloseEditDialog();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    const teamToDelete = teams.find(t => t.id === teamId);
    if (teamToDelete) {
        try {
            const res = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.message || 'Failed to delete team');
            }
            setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
            toast({ title: "Team Deleted", description: `Team "${teamToDelete.name}" has been removed.`, variant: "destructive" });
        } catch(error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    }
  };

  const handleJoinTeamCodeChange = (index: number, value: string) => {
    if (/^[a-zA-Z0-9]?$/.test(value)) {
      const newCode = [...joinTeamCodeDigits];
      newCode[index] = value.toUpperCase();
      setJoinTeamCodeDigits(newCode);

      if (value && index < 5 && joinTeamCodeInputsRef[index + 1]?.current) {
        joinTeamCodeInputsRef[index + 1].current?.focus();
      }
    }
  };

  const handleJoinTeamCodeKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !joinTeamCodeDigits[index] && index > 0 && joinTeamCodeInputsRef[index - 1]?.current) {
      joinTeamCodeInputsRef[index - 1].current?.focus();
    }
  };

  const handleJoinTeamSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsJoinTeamLoading(true);
    const finalJoinTeamCode = joinTeamCodeDigits.join("");
    
    try {
        const res = await fetch('/api/teams/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: finalJoinTeamCode })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        toast({ title: "Request Sent!", description: `Your request to join the team has been sent to the owner.`, icon: <CheckCircle2 className="h-5 w-5 text-primary" /> });
        setIsJoinTeamDialogOpen(false);
        setJoinTeamCodeDigits(Array(6).fill(""));
    } catch(error) {
        toast({ title: "Failed to Send Request", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsJoinTeamLoading(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
           <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          © {currentYear} TaskFlow. Crafted with 🧠 & ❤️.
        </footer>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <Button variant="outline" onClick={() => router.back()} className="self-start">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
                </Button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button onClick={() => setIsJoinTeamDialogOpen(true)} variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join a Team
                    </Button>
                    <Button onClick={() => router.push('/settings')} className="shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90 w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Team
                    </Button>
                </div>
            </div>
            <CardTitle className="font-headline text-2xl">Manage Teams</CardTitle>
            <CardDescription>View, edit, or delete your teams. You can also join an existing team using a team code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {teams.length === 0 ? (
              <div className="mt-12 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-xl bg-card/50">
                <SearchX size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">No Teams Yet</h3>
                <p className="max-w-sm">
                  You haven't created or joined any teams. Use the buttons above to create a new team or join an existing one.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teams.map(team => (
                  <Card key={team.id} className="shadow-md rounded-lg flex flex-col">
                    <CardHeader>
                      <CardTitle className="font-semibold text-xl break-all">{team.name}</CardTitle>
                      <CardDescription>Code: <span className="font-mono text-primary">{team.code}</span></CardDescription>
                       <div className="text-xs text-muted-foreground pt-1">
                        Created: {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">Members ({team.members.length}):</h4>
                        {team.members.length > 0 ? (
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                            {team.members.slice(0, 3).map(member => (
                              <li key={member} className="truncate" title={member}>
                                {member === session?.user?.email ? `${member} (You)` : member}
                              </li>
                            ))}
                            {team.members.length > 3 && <li>...and {team.members.length - 3} more</li>}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No members yet.</p>
                        )}
                      </div>
                      {team.pendingRequests && team.pendingRequests.length > 0 && (
                        <div>
                          <Separator className="my-3" />
                          <h4 className="text-sm font-medium text-foreground mb-2">Pending Requests ({team.pendingRequests.length}):</h4>
                          <div className="space-y-2">
                             {team.pendingRequests.map(request => (
                               <PendingRequestItem key={request.id} teamId={team.id} request={request} onHandleRequest={handleRequestHandled} />
                             ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(team)} disabled={team.ownerId !== session?.user.id}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => handleDeleteTeam(team.id)} disabled={team.ownerId !== session?.user.id}>
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
              <DialogDescription>Modify the team's name. Only the team owner can do this.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveTeamChanges} className="space-y-6 py-4">
              <div>
                <Label htmlFor="edit-team-name" className="text-foreground/80">Team Name</Label>
                <Input id="edit-team-name" value={editedTeamName} onChange={(e) => setEditedTeamName(e.target.value)} className="mt-1 bg-background border-input focus:ring-primary" required />
              </div>
              <DialogFooter className="mt-8">
                <Button type="button" variant="outline" onClick={handleCloseEditDialog}><XCircle className="mr-2 h-4 w-4" />Cancel</Button>
                <Button type="submit" variant="default"><Save className="mr-2 h-4 w-4" />Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isJoinTeamDialogOpen} onOpenChange={setIsJoinTeamDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Join a Team</DialogTitle>
            <DialogDescription>Enter the 6-digit code of the team you want to join.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoinTeamSubmit} className="space-y-6 py-4">
            <div>
              <Label htmlFor="join-team-code-0" className="text-foreground/80">Team Code (6 digits)</Label>
              <div className="flex justify-between gap-2 mt-1">
                {joinTeamCodeDigits.map((digit, index) => (
                  <Input key={index} id={`join-team-code-${index}`} ref={joinTeamCodeInputsRef[index]} type="text" maxLength={1} value={digit} onChange={(e) => handleJoinTeamCodeChange(index, e.target.value)} onKeyDown={(e) => handleJoinTeamCodeKeyDown(index, e)} className="w-10 h-12 text-center text-lg font-mono bg-background border-input focus:ring-primary" pattern="[a-zA-Z0-9]*" inputMode="text" required />
                ))}
              </div>
            </div>
            <DialogFooter className="mt-8">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isJoinTeamLoading}>Cancel</Button></DialogClose>
              <Button type="submit" variant="default" disabled={isJoinTeamLoading}>
                {isJoinTeamLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} 
                Send Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

       <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © {currentYear} TaskFlow. Crafted with 🧠 & ❤️.
      </footer>
    </div>
  );
}
