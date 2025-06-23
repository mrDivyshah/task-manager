
"use client";

import type { Activity } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

const getUserInitials = (name?: string | null) => {
    if (!name) return "?";
    const names = name.split(" ");
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : names[0][0].toUpperCase();
};

export const ActivityLogItem = ({ activity }: { activity: Activity }) => {
    const renderDetails = () => {
        switch(activity.type) {
            case 'CREATE':
                return <p><span className="font-semibold">{activity.details.userName}</span> created task: <span className="font-medium text-primary">{activity.taskTitle || activity.details.to}</span>.</p>;
            case 'COMMENT':
                return (
                    <div>
                        <p><span className="font-semibold">{activity.details.userName}</span> commented on <span className="font-medium text-primary">{activity.taskTitle}</span></p>
                        <p className="mt-1 whitespace-pre-wrap text-foreground/80 bg-muted/50 p-2 rounded-md border">{activity.details.comment}</p>
                    </div>
                );
            case 'STATUS_CHANGE':
                return <p><span className="font-semibold">{activity.details.userName}</span> changed status of <span className="font-medium text-primary">{activity.taskTitle}</span> from <Badge variant="outline" className="capitalize">{activity.details.from}</Badge> to <Badge variant="outline" className="capitalize">{activity.details.to}</Badge>.</p>;
            case 'ASSIGNMENT_CHANGE':
                 return <p><span className="font-semibold">{activity.details.userName}</span> changed assignment for <span className="font-medium text-primary">{activity.taskTitle}</span> from <Badge variant="secondary">{activity.details.from || 'Unassigned'}</Badge> to <Badge variant="secondary">{activity.details.to || 'Unassigned'}</Badge>.</p>;
            case 'UPDATE':
                if (activity.details.field === 'Notes') {
                    return <p><span className="font-semibold">{activity.details.userName}</span> updated notes for <span className="font-medium text-primary">{activity.taskTitle}</span>.</p>;
                }
                return (
                    <p>
                        <span className="font-semibold">{activity.details.userName}</span>
                        {' '}changed the <span className="lowercase font-medium">{activity.details.field}</span> for <span className="font-medium text-primary">{activity.taskTitle}</span> from{' '}
                        <Badge variant="secondary" className="capitalize">{activity.details.from || 'none'}</Badge> to <Badge variant="secondary" className="capitalize">{activity.details.to || 'none'}</Badge>.
                    </p>
                );
            default:
                return <p><span className="font-semibold">{activity.details.userName}</span> made an update to <span className="font-medium text-primary">{activity.taskTitle}</span>.</p>;
        }
    };

    return (
        <div className="flex gap-3">
            <div className="flex-shrink-0">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-muted">{getUserInitials(activity.details.userName)}</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex-grow">
                <div className="text-sm">
                    {renderDetails()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
            </div>
        </div>
    );
};
