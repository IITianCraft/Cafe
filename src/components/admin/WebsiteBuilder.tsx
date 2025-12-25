import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAdminRestaurant } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { settingsApi } from '@/services/api';
import {
  Palette, Image, Type, Save, Eye, Globe, Clock, Phone, Mail,
  MapPin, Upload, Sun, Moon, Sparkles, Loader2
} from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export function WebsiteBuilder() {
  const navigate = useNavigate();
  const { restaurant } = useAdminRestaurant();
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState<any>(null); // Use any or RestaurantSettings
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (restaurant) {
      const initialSettings = restaurant.settings || {};

      // Initialize opening hours if missing or incomplete
      const existingHours = initialSettings.openingHours || [];
      const initializedHours = DAYS_OF_WEEK.map(day => {
        const existing = existingHours.find((h: any) => h.day === day);
        return existing || { day, open: '09:00', close: '22:00' };
      });

      setLocalSettings({
        name: restaurant.name,
        primaryColor: initialSettings.primaryColor || '#000000',
        secondaryColor: initialSettings.secondaryColor || '#ffffff',
        openingHours: initializedHours,
        socialLinks: initialSettings.socialLinks || [],
        email: initialSettings.email || user?.email || '', // Pre-fill from admin login
        phone: initialSettings.phone || user?.phone || '',
        ...initialSettings
      });

      // setIsDarkTheme(restaurant.settings?.theme === 'dark'); 
    }
  }, [restaurant, user]);

  const handleSave = async () => {
    if (!restaurant?.id || !localSettings) return;
    setIsSaving(true);
    try {
      await settingsApi.update(restaurant.id, localSettings);
      toast({ title: 'Settings saved!', description: 'Changes will reflect on your website.' });
    } catch (error) {
      console.error("Failed to save settings", error);
      toast({ title: 'Error saving settings', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      toast({
        title: 'Website Published!',
        description: 'Your changes are now live.',
      });
    }, 2000);
  };

  const handlePreviewSite = () => {
    if (restaurant?.slug) {
      // Preview home page instead of menu
      window.open(`/${restaurant.slug}`, '_blank');
    } else {
      toast({ title: "Restaurant slug not found" });
    }
  };

  const updateOpeningHour = (index: number, field: 'open' | 'close', value: string) => {
    if (!localSettings) return;
    const newHours = [...(localSettings.openingHours || [])];
    if (!newHours[index]) return;
    newHours[index] = { ...newHours[index], [field]: value };
    setLocalSettings({ ...localSettings, openingHours: newHours });
  };

  const predefinedThemes = [
    { name: 'Warm Orange', primary: '#f97316', secondary: '#1e293b' },
    { name: 'Ocean Blue', primary: '#3b82f6', secondary: '#1e3a5f' },
    { name: 'Forest Green', primary: '#22c55e', secondary: '#14532d' },
    { name: 'Royal Purple', primary: '#8b5cf6', secondary: '#2e1065' },
    { name: 'Rose Pink', primary: '#ec4899', secondary: '#4a0519' },
    { name: 'Golden Yellow', primary: '#eab308', secondary: '#422006' },
  ];

  if (!localSettings) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /> Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Website Builder</h1>
          <p className="text-muted-foreground">Customize your customer-facing website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviewSite}>
            <Eye className="w-4 h-4 mr-2" />Preview Menu
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Publishing...</>
            ) : (
              <><Globe className="w-4 h-4 mr-2" />Publish Website</>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />Theme Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={localSettings.primaryColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={localSettings.primaryColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={localSettings.secondaryColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={localSettings.secondaryColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block">Quick Themes</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {predefinedThemes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setLocalSettings({
                          ...localSettings,
                          primaryColor: theme.primary,
                          secondaryColor: theme.secondary
                        })}
                        className="p-2 rounded-lg border hover:border-primary transition-colors text-center"
                      >
                        <div className="flex gap-1 justify-center mb-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
                        </div>
                        <span className="text-xs">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {isDarkTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <Label>Dark Theme</Label>
                  </div>
                  <Switch checked={isDarkTheme} onCheckedChange={setIsDarkTheme} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />Logo & Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Restaurant Name</Label>
                  <Input
                    value={localSettings.name}
                    onChange={(e) => setLocalSettings({ ...localSettings, name: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <ImageUploader
                    label="Logo"
                    value={localSettings.logo}
                    onChange={(url) => setLocalSettings({ ...localSettings, logo: url })}
                  />
                </div>
                <div>
                  <ImageUploader
                    label="Hero Image"
                    value={localSettings.heroImage}
                    onChange={(url) => setLocalSettings({ ...localSettings, heroImage: url })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label>Hero Title</Label>
                  <Input
                    value={localSettings.heroTitle || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, heroTitle: e.target.value })}
                    placeholder="Seamless Ordering, Anywhere You Are"
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Hero Subtitle</Label>
                  <Input
                    value={localSettings.heroSubtitle || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
                    placeholder="A brief description of your restaurant"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-3 block">Preview</Label>
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className="relative h-48"
                    style={{
                      backgroundImage: `url(${localSettings.heroImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-6">
                      <h2 className="text-white font-bold text-2xl mb-2" style={{ color: localSettings.primaryColor }}>
                        {localSettings.heroTitle || 'Seamless Ordering, Anywhere You Are'}
                      </h2>
                      <p className="text-white/90 text-sm">
                        {localSettings.heroSubtitle || 'Browse our chef-curated menu and enjoy fresh, delicious food served your way.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours Tab */}
        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {localSettings.openingHours?.map((hour: any, index: number) => (
                  <div key={hour.day} className="grid grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">{hour.day}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={hour.open}
                        onChange={(e) => updateOpeningHour(index, 'open', e.target.value)}
                        className="text-sm"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={hour.close}
                        onChange={(e) => updateOpeningHour(index, 'close', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                These hours will be displayed in the website footer and contact page.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />Phone Number
                  </Label>
                  <Input
                    value={localSettings.phone}
                    onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />Email Address
                  </Label>
                  <Input
                    value={localSettings.email}
                    onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />Address
                </Label>
                <Input
                  value={localSettings.address}
                  onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-3 block">WhatsApp Integration</Label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable WhatsApp Button</p>
                    <p className="text-sm text-muted-foreground">Show floating WhatsApp button on website</p>
                  </div>
                  <Switch
                    checked={localSettings.enableWhatsApp}
                    onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enableWhatsApp: checked })}
                  />
                </div>
                {localSettings.enableWhatsApp && (
                  <Input
                    value={localSettings.whatsappNumber}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                    placeholder="+919876543210"
                    className="mt-3"
                  />
                )}
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 sticky bottom-4 bg-settings p-4 rounded-lg border shadow-lg bg-background">
        <Button variant="outline" onClick={() => setLocalSettings(restaurant?.settings)}>
          Reset Changes
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />Save Changes
        </Button>
      </div>
    </div>
  );
}