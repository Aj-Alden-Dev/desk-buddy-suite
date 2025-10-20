import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Shield, ShieldCheck, Eye, UserCog } from "lucide-react";

interface Agent {
  id: string;
  full_name: string;
  email: string;
  department: { name: string } | null;
  roles: { role: string }[];
}

const roleIcons = {
  super_admin: ShieldCheck,
  agent: UserCog,
  light_agent: Shield,
  viewer: Eye,
};

const roleColors = {
  super_admin: "destructive",
  agent: "default",
  light_agent: "secondary",
  viewer: "outline",
} as const;

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { toast } = useToast();
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    // Get all profiles with their departments and roles
    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("id, full_name, department:departments(name)");

    if (error) {
      toast({
        title: "Error fetching agents",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Fetch roles for each profile  
    const agentsWithDetails = await Promise.all(
      (profilesData || []).map(async (profile) => {
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id);

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: "", // Will be populated from auth
          department: profile.department,
          roles: rolesData || [],
        };
      })
    );

    setAgents(agentsWithDetails);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Remove existing roles
    await supabase.from("user_roles").delete().eq("user_id", userId);

    // Add new role - note the type assertion to match the enum
    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role: newRole as any }]);

    if (error) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Role updated successfully" });
    fetchAgents();
  };

  const isSuperAdmin = hasRole("super_admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agents & Team</h1>
        <p className="text-muted-foreground mt-1">Manage team members and their access levels</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter((a) => a.roles.some((r) => r.role === "super_admin")).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter((a) => a.roles.some((r) => r.role === "agent")).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Light Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter((a) => a.roles.some((r) => r.role === "light_agent")).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Viewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter((a) => a.roles.some((r) => r.role === "viewer")).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                {isSuperAdmin && <TableHead>Manage Role</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => {
                const role = agent.roles[0]?.role || "viewer";
                const RoleIcon = roleIcons[role as keyof typeof roleIcons];
                
                return (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.full_name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.department?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={roleColors[role as keyof typeof roleColors]} className="gap-1">
                        <RoleIcon className="h-3 w-3" />
                        {role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <Select
                          value={role}
                          onValueChange={(value) => handleRoleChange(agent.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="light_agent">Light Agent</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Super Admin</p>
                <p className="text-sm text-muted-foreground">Full access to all features, manage departments, users, and roles</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserCog className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Agent</p>
                <p className="text-sm text-muted-foreground">Manage tickets, customers, and delete records</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Light Agent</p>
                <p className="text-sm text-muted-foreground">View and update tickets, view customers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Viewer</p>
                <p className="text-sm text-muted-foreground">Read-only access to all data</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agents;
