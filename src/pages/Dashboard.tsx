import { Ticket, Users, CheckCircle, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";

const recentTickets = [
  {
    id: "1",
    title: "Unable to login to account",
    customer: "Sarah Johnson",
    status: "open" as const,
    priority: "high" as const,
    time: "5 minutes ago",
  },
  {
    id: "2",
    title: "Payment not processing",
    customer: "Michael Chen",
    status: "in-progress" as const,
    priority: "urgent" as const,
    time: "1 hour ago",
  },
  {
    id: "3",
    title: "Feature request: Dark mode",
    customer: "Emily Davis",
    status: "open" as const,
    priority: "low" as const,
    time: "2 hours ago",
  },
  {
    id: "4",
    title: "Bug report: Image upload failing",
    customer: "David Wilson",
    status: "in-progress" as const,
    priority: "medium" as const,
    time: "3 hours ago",
  },
];

const Dashboard = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your support tickets.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tickets"
          value={1247}
          icon={Ticket}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Open Tickets"
          value={89}
          icon={Clock}
          trend={{ value: -5, isPositive: false }}
        />
        <StatCard
          title="Resolved Today"
          value={24}
          icon={CheckCircle}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Customers"
          value={842}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-card transition-shadow cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.customer} • {ticket.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ticket Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Open</span>
                  <span className="text-sm text-muted-foreground">89 tickets</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-info" style={{ width: "35%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">In Progress</span>
                  <span className="text-sm text-muted-foreground">124 tickets</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-warning" style={{ width: "48%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Resolved</span>
                  <span className="text-sm text-muted-foreground">186 tickets</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: "72%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Closed</span>
                  <span className="text-sm text-muted-foreground">848 tickets</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-muted-foreground" style={{ width: "95%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
