import { useState, useEffect } from "react";
import { Phone, PhoneCall, PhoneOff, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CallRecord {
  id: string;
  phone_number: string;
  call_type: string;
  duration_seconds: number;
  call_status: string;
  started_at: string;
  ended_at: string;
  ticket_id?: string;
  customer_id?: string;
}

const Calls = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    const { data, error } = await supabase
      .from('call_records')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      toast({ title: "Error loading calls", variant: "destructive" });
    } else {
      setCalls(data || []);
    }
  };

  const handleMakeCall = async () => {
    if (!phoneNumber) {
      toast({ title: "Please enter a phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    // This is a placeholder for actual Twilio integration
    // In production, this would connect to a Twilio edge function
    
    const { error } = await supabase
      .from('call_records')
      .insert({
        phone_number: phoneNumber,
        call_type: 'outbound',
        call_status: 'initiated',
        agent_id: user?.id,
        duration_seconds: 0,
      });

    if (error) {
      toast({ title: "Error initiating call", variant: "destructive" });
    } else {
      toast({ title: "Call initiated", description: "WebRTC integration would start here" });
      setIsDialogOpen(false);
      setPhoneNumber("");
      fetchCalls();
    }
    
    setLoading(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Calls</h1>
          <p className="text-muted-foreground">WebRTC voice communication system</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setIsDialogOpen(true)}>
          <Phone className="w-4 h-4 mr-2" />
          Make Call
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Calls Today</CardTitle>
            <PhoneCall className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calls.filter(c => new Date(c.started_at).toDateString() === new Date().toDateString()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Call Duration</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(
                calls.reduce((sum, c) => sum + c.duration_seconds, 0) / (calls.length || 1)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Missed Calls</CardTitle>
            <PhoneOff className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calls.filter(c => c.call_status === 'missed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>Recent voice communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calls.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No calls yet</p>
            ) : (
              calls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      call.call_type === 'inbound' ? 'bg-primary/10' : 'bg-accent/10'
                    }`}>
                      {call.call_type === 'inbound' ? (
                        <PhoneCall className="w-4 h-4 text-primary" />
                      ) : (
                        <Phone className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{call.phone_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(call.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDuration(call.duration_seconds)}</p>
                      <Badge variant={
                        call.call_status === 'completed' ? 'default' :
                        call.call_status === 'missed' ? 'destructive' : 'secondary'
                      }>
                        {call.call_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This is a placeholder interface. In production, this would integrate with Twilio or 
                another WebRTC provider to enable real-time voice communication.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90" onClick={handleMakeCall} disabled={loading}>
                <Phone className="w-4 h-4 mr-2" />
                {loading ? "Connecting..." : "Call Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calls;