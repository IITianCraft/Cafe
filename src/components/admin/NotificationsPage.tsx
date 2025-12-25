import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, MessageSquare, Mail, Smartphone } from 'lucide-react';
import { useState } from 'react';

export function NotificationsPage() {
  const [settings, setSettings] = useState({
    orderPlaced: true, orderAccepted: true, orderReady: true,
    whatsappAlerts: true, emailAlerts: false, smsAlerts: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Configure notification preferences</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Order Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'orderPlaced', label: 'New Order Placed' },
              { key: 'orderAccepted', label: 'Order Accepted' },
              { key: 'orderReady', label: 'Order Ready for Pickup/Delivery' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch checked={settings[key as keyof typeof settings]} onCheckedChange={(v) => setSettings({...settings, [key]: v})} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" />Channels</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />WhatsApp Alerts</Label><Switch checked={settings.whatsappAlerts} onCheckedChange={(v) => setSettings({...settings, whatsappAlerts: v})} /></div>
            <div className="flex items-center justify-between"><Label className="flex items-center gap-2"><Mail className="w-4 h-4" />Email Alerts</Label><Switch checked={settings.emailAlerts} onCheckedChange={(v) => setSettings({...settings, emailAlerts: v})} /></div>
            <div className="flex items-center justify-between"><Label className="flex items-center gap-2"><Smartphone className="w-4 h-4" />SMS Alerts</Label><Switch checked={settings.smsAlerts} onCheckedChange={(v) => setSettings({...settings, smsAlerts: v})} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
