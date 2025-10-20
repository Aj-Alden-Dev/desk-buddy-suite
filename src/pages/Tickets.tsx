import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockTickets = [
  {
    id: "TKT-001",
    title: "Unable to login to account",
    customer: { name: "Sarah Johnson", email: "sarah.j@example.com", initials: "SJ" },
    status: "open" as const,
    priority: "high" as const,
    assignee: { name: "John Doe", initials: "JD" },
    createdAt: "2024-01-15",
  },
  {
    id: "TKT-002",
    title: "Payment not processing",
    customer: { name: "Michael Chen", email: "m.chen@example.com", initials: "MC" },
    status: "in-progress" as const,
    priority: "urgent" as const,
    assignee: { name: "Jane Smith", initials: "JS" },
    createdAt: "2024-01-15",
  },
  {
    id: "TKT-003",
    title: "Feature request: Dark mode",
    customer: { name: "Emily Davis", email: "emily.d@example.com", initials: "ED" },
    status: "open" as const,
    priority: "low" as const,
    assignee: { name: "John Doe", initials: "JD" },
    createdAt: "2024-01-14",
  },
  {
    id: "TKT-004",
    title: "Bug report: Image upload failing",
    customer: { name: "David Wilson", email: "d.wilson@example.com", initials: "DW" },
    status: "in-progress" as const,
    priority: "medium" as const,
    assignee: { name: "Jane Smith", initials: "JS" },
    createdAt: "2024-01-14",
  },
  {
    id: "TKT-005",
    title: "Account settings not saving",
    customer: { name: "Lisa Anderson", email: "lisa.a@example.com", initials: "LA" },
    status: "resolved" as const,
    priority: "medium" as const,
    assignee: { name: "John Doe", initials: "JD" },
    createdAt: "2024-01-13",
  },
];

const Tickets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tickets</h1>
          <p className="text-muted-foreground">Manage and track all customer support tickets</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter ticket title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the issue" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Email</Label>
                  <Input id="customer" type="email" placeholder="customer@example.com" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-primary hover:opacity-90">Create Ticket</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="border border-border rounded-lg bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTickets.map((ticket) => (
              <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                        {ticket.customer.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{ticket.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{ticket.customer.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {ticket.assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ticket.assignee.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{ticket.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Tickets;
