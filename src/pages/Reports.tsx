import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Clock, CheckCircle2 } from "lucide-react";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [ticketMetrics, setTicketMetrics] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    
    // Fetch ticket metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('ticket_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (metricsError) {
      toast({ title: "Error loading metrics", variant: "destructive" });
    } else {
      setTicketMetrics(metrics || []);
    }

    // Fetch agent performance
    const { data: agents, error: agentsError } = await supabase
      .from('agent_performance')
      .select('*');

    if (agentsError) {
      toast({ title: "Error loading agent performance", variant: "destructive" });
    } else {
      setAgentPerformance(agents || []);
    }

    setLoading(false);
  };

  const totalTickets = ticketMetrics.reduce((sum, m) => sum + (m.total_tickets || 0), 0);
  const resolvedTickets = ticketMetrics.reduce((sum, m) => sum + (m.resolved_tickets || 0), 0);
  const avgResolutionTime = ticketMetrics.length > 0 
    ? (ticketMetrics.reduce((sum, m) => sum + (m.avg_resolution_time_hours || 0), 0) / ticketMetrics.length).toFixed(1)
    : 0;
  const slaBreached = ticketMetrics.reduce((sum, m) => sum + (m.sla_breached_tickets || 0), 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Performance metrics and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">
              {totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResolutionTime}h</div>
            <p className="text-xs text-muted-foreground">Average across all tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SLA Breached</CardTitle>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slaBreached}</div>
            <p className="text-xs text-muted-foreground">
              {totalTickets > 0 ? ((slaBreached / totalTickets) * 100).toFixed(1) : 0}% breach rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="sla">SLA Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Trends</CardTitle>
              <CardDescription>Daily ticket volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ticketMetrics.slice(0, 30).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_tickets" stroke="#8B5CF6" name="Total" />
                  <Line type="monotone" dataKey="resolved_tickets" stroke="#10B981" name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ticketMetrics.slice(0, 7).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="open_tickets" fill="#8B5CF6" name="Open" />
                  <Bar dataKey="in_progress_tickets" fill="#F59E0B" name="In Progress" />
                  <Bar dataKey="resolved_tickets" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Individual agent statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformance.map((agent) => (
                  <div key={agent.agent_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{agent.agent_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.total_tickets} tickets • {agent.resolved_tickets} resolved
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {agent.avg_resolution_time_hours?.toFixed(1) || 0}h avg time
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agent.sla_met_tickets} SLA met
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Compliance</CardTitle>
              <CardDescription>Service level agreement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ticketMetrics.slice(0, 30).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avg_first_response_time_minutes" stroke="#8B5CF6" name="Avg Response (min)" />
                  <Line type="monotone" dataKey="sla_breached_tickets" stroke="#EF4444" name="SLA Breached" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;