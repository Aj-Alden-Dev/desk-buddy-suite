import { Badge } from "@/components/ui/badge";

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";

interface StatusBadgeProps {
  status: TicketStatus;
}

const statusConfig = {
  open: { label: "Open", variant: "default" as const },
  "in-progress": { label: "In Progress", variant: "secondary" as const },
  resolved: { label: "Resolved", variant: "outline" as const },
  closed: { label: "Closed", variant: "outline" as const },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant}
      className={
        status === "open" ? "bg-info text-info-foreground hover:bg-info/90" :
        status === "in-progress" ? "bg-warning text-warning-foreground hover:bg-warning/90" :
        status === "resolved" ? "bg-success text-success-foreground hover:bg-success/90" :
        "bg-muted text-muted-foreground"
      }
    >
      {config.label}
    </Badge>
  );
};
