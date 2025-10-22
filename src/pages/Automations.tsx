import { useState, useEffect } from "react";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_event: string;
  is_active: boolean;
  priority: number;
}

const Automations = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userRoles } = useAuth();

  const isSuperAdmin = userRoles.includes('super_admin');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      toast({ title: "Error loading automation rules", variant: "destructive" });
    } else {
      setRules(data || []);
    }
    setLoading(false);
  };

  const toggleRule = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('automation_rules')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      toast({ title: "Error updating rule", variant: "destructive" });
    } else {
      toast({ title: "Rule updated successfully" });
      fetchRules();
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Automations</h1>
          <p className="text-muted-foreground">Workflow automation and rules engine</p>
        </div>
        {isSuperAdmin && (
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : rules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No automation rules yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create automation rules to streamline your workflow
              </p>
              {isSuperAdmin && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Rule
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      {rule.is_active ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                  {isSuperAdmin && (
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Trigger: {rule.trigger_event}</span>
                  <span>Priority: {rule.priority}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Automations Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Triggers:</strong> Define when the automation should run (e.g., ticket created, status changed)</p>
          <p>• <strong>Conditions:</strong> Set criteria that must be met for the action to execute</p>
          <p>• <strong>Actions:</strong> Specify what should happen (e.g., assign to agent, send email, update field)</p>
          <p>• <strong>Priority:</strong> Higher priority rules are executed first when multiple rules match</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Automations;