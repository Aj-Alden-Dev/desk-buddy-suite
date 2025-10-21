import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "./StatusBadge";
import { ChevronDown, ChevronUp, Clock, Mail, User, Building2, Languages } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TicketDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: any;
}

const CollapsibleSection = ({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <h3 className="font-semibold text-sm">{title}</h3>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <div className={cn("overflow-hidden transition-all", isOpen ? "max-h-[1000px]" : "max-h-0")}>
        {children}
      </div>
    </div>
  );
};

export const TicketDetailSheet = ({ open, onOpenChange, ticket }: TicketDetailSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[90vw] p-0 flex gap-0">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-border bg-card overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Ticket Properties</h2>
          </div>

          {/* Contact Info */}
          <CollapsibleSection title="Contact Info">
            <div className="px-4 pb-4 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {ticket.customer.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{ticket.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{ticket.customer.email}</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Key Information */}
          <CollapsibleSection title="Key Information">
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Ticket Owner</label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {ticket.assignee?.initials || "NA"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{ticket.assignee?.name || "Unassigned"}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <div className="mt-1">
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
              {ticket.closedTime && (
                <div>
                  <label className="text-xs text-muted-foreground">Closed time</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{ticket.closedTime}</span>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground">Tags</label>
                <div className="mt-1 text-sm text-muted-foreground">-</div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Ticket Information */}
          <CollapsibleSection title="Ticket Information">
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="text-xs text-red-500">Email *</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.customer.email}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Product Name</label>
                <div className="mt-1 text-sm text-muted-foreground">-</div>
              </div>
              <div>
                <label className="text-xs text-red-500">Role *</label>
                <div className="mt-1 text-sm">{ticket.role || "Organization Admin"}</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Skills</label>
                <div className="mt-1 text-sm text-muted-foreground">-</div>
              </div>
              <div>
                <label className="text-xs text-red-500">Organization *</label>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.organization || "-"}</span>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Additional Information */}
          <CollapsibleSection title="Additional Information">
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Language</label>
                <div className="flex items-center gap-2 mt-1">
                  <Languages className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">English</span>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-background">
          <SheetHeader className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">New Support Ticket from {ticket.customer.name}</h2>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    {ticket.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>#{ticket.id}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ticket.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    00:00:00
                  </span>
                </div>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90">
                Reply All
              </Button>
            </div>
          </SheetHeader>

          <Tabs defaultValue="conversations" className="flex-1 flex flex-col">
            <div className="border-b border-border px-6">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="conversations" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  4 CONVERSATIONS
                </TabsTrigger>
                <TabsTrigger value="resolution" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  RESOLUTION
                </TabsTrigger>
                <TabsTrigger value="time-entry" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  TIME ENTRY
                </TabsTrigger>
                <TabsTrigger value="attachment" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  ATTACHMENT
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  ACTIVITY
                </TabsTrigger>
                <TabsTrigger value="approval" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  APPROVAL
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  HISTORY
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="conversations" className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Conversation Thread */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {ticket.customer.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">{ticket.customer.name}</span>
                      <span className="text-xs text-muted-foreground">09:35 AM (responded in 2 hours)</span>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm">{ticket.title}</p>
                      <p className="text-sm mt-2 text-muted-foreground">
                        This is a test<br />
                        Best Regards,<br />
                        <br />
                        {ticket.customer.name}<br />
                        Customer Support Specialist
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resolution" className="flex-1 overflow-y-auto p-6">
              <p className="text-muted-foreground">Resolution details will appear here</p>
            </TabsContent>

            <TabsContent value="time-entry" className="flex-1 overflow-y-auto p-6">
              <p className="text-muted-foreground">Time entry details will appear here</p>
            </TabsContent>

            <TabsContent value="attachment" className="flex-1 overflow-y-auto p-6">
              <p className="text-muted-foreground">Attachments will appear here</p>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 overflow-y-auto p-6">
              <p className="text-muted-foreground">Activity log will appear here</p>
            </TabsContent>

            <TabsContent value="approval" className="flex-1 overflow-y-auto p-6">
              <p className="text-muted-foreground">Approval workflow will appear here</p>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto p-6">
              <p className="text-muted-foreground">Ticket history will appear here</p>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
