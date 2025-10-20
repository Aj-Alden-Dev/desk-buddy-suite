import { Badge } from "@/components/ui/badge";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

interface PriorityBadgeProps {
  priority: TicketPriority;
}

const priorityConfig = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-info text-info-foreground" },
  high: { label: "High", className: "bg-warning text-warning-foreground" },
  urgent: { label: "Urgent", className: "bg-destructive text-destructive-foreground" },
};

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const config = priorityConfig[priority];
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
