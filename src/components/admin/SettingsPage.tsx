import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Save, Store, CreditCard, Bell, Shield, Database, Trash, Upload } from 'lucide-react';
import { adminApi } from '@/services/api';

import { useAdminRestaurant } from '@/context/AdminContext';

export function SettingsPage() {
  const { restaurant } = useAdminRestaurant();
  const restaurantId = restaurant?.id;
  // Use restaurantId for specific settings if needed
  // For now it might just be a placeholder or global user settings
  console.log("Settings for:", restaurantId);
  const [settings, setSettings] = useState({
    name: 'Cafe Resto', phone: '+91 98765 43210', email: 'hello@caferesto.com',
    address: '123 Food Street, Mumbai - 400001', taxRate: 5, deliveryCharge: 40,
    minOrder: 200, enableWhatsApp: true, whatsappNumber: '+919876543210',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    localStorage.setItem('cafe_resto_settings', JSON.stringify(settings));
    toast({ title: 'Settings saved successfully' });
  };

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      await adminApi.seed();
      toast({ title: "Database seeded successfully", description: "Refresh to see new data." });
    } catch (error) {
      toast({ title: "Seeding failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDemo = async () => {
    if (!confirm("Are you sure? This will delete all demo data.")) return;
    setIsLoading(true);
    try {
      const res = await adminApi.removeDemo();
      toast({
        title: "Demo data removed",
        description: `Deleted ${res.data.data.deletedMenus} menus and ${res.data.data.deletedOrders} orders.`
      });
    } catch (error) {
      toast({ title: "Operation failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your restaurant settings</p>
      </div>

      <div className="grid gap-6">
        {/* Data Management Section */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><Database className="w-5 h-5" />Data Management (Admin Only)</CardTitle>
            <CardDescription>Manage demo data and seed initial content.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" onClick={handleSeed} disabled={isLoading}>
              <Upload className="w-4 h-4 mr-2" /> Seed Database
            </Button>
            <Button variant="destructive" onClick={handleRemoveDemo} disabled={isLoading}>
              <Trash className="w-4 h-4 mr-2" /> Remove Demo Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5" />Business Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Restaurant Name</Label><Input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Keeping other cards as UI placeholders for now since they just use local storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Tax Rate (%)</Label><Input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })} /></div>
            <div><Label>Delivery Charge (₹)</Label><Input type="number" value={settings.deliveryCharge} onChange={(e) => setSettings({ ...settings, deliveryCharge: Number(e.target.value) })} /></div>
            <div><Label>Min Order (₹)</Label><Input type="number" value={settings.minOrder} onChange={(e) => setSettings({ ...settings, minOrder: Number(e.target.value) })} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable WhatsApp Notifications</Label>
              <Switch checked={settings.enableWhatsApp} onCheckedChange={(v) => setSettings({ ...settings, enableWhatsApp: v })} />
            </div>
            {settings.enableWhatsApp && (
              <div><Label>WhatsApp Number</Label><Input value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} /></div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-fit"><Save className="w-4 h-4 mr-2" />Save Settings</Button>
      </div>
    </div>
  );
}
