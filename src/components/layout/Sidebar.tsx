import { Home, Ticket, Users, Settings, BarChart3, Building2, UserCog, LogOut, BookOpen, Phone, BarChart, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen },
  { title: "Calls", url: "/calls", icon: Phone },
  { title: "Reports", url: "/reports", icon: BarChart },
  { title: "Automations", url: "/automations", icon: Zap },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Departments", url: "/departments", icon: Building2, adminOnly: true },
  { title: "Agents & Team", url: "/agents", icon: UserCog, adminOnly: true },
  { title: "Settings", url: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const { open } = useSidebar();
  const { hasRole, signOut } = useAuth();

  return (
    <SidebarUI className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          {open && <span className="font-semibold text-sidebar-foreground">HelpDesk CRM</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.adminOnly && !hasRole("super_admin")) return null;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className={({ isActive }) =>
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="w-5 h-5" />
              {open && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarUI>
  );
};
