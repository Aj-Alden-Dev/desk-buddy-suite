import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockCustomers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    initials: "SJ",
    tickets: 5,
    status: "active",
    joinedDate: "Jan 2024",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@example.com",
    initials: "MC",
    tickets: 12,
    status: "active",
    joinedDate: "Dec 2023",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.d@example.com",
    initials: "ED",
    tickets: 3,
    status: "active",
    joinedDate: "Jan 2024",
  },
  {
    id: "4",
    name: "David Wilson",
    email: "d.wilson@example.com",
    initials: "DW",
    tickets: 8,
    status: "active",
    joinedDate: "Nov 2023",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    initials: "LA",
    tickets: 15,
    status: "active",
    joinedDate: "Oct 2023",
  },
  {
    id: "6",
    name: "Robert Taylor",
    email: "r.taylor@example.com",
    initials: "RT",
    tickets: 6,
    status: "active",
    joinedDate: "Jan 2024",
  },
];

const Customers = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Customers</h1>
          <p className="text-muted-foreground">View and manage your customer database</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers..." className="pl-10" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCustomers.map((customer) => (
          <Card key={customer.id} className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {customer.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {customer.tickets} tickets
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-success text-success-foreground">
                      {customer.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Joined {customer.joinedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Customers;
