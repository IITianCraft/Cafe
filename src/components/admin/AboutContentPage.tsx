import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAdminRestaurant } from '@/context/AdminContext';
import { settingsApi } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AboutPageSettings } from '@/types';
import { Save, Plus, Trash2, Users, Award, Heart, UtensilsCrossed, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/admin/ImageUploader';

const iconOptions = [
  { value: 'UtensilsCrossed', label: 'Utensils', icon: UtensilsCrossed },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Award', label: 'Award', icon: Award },
  { value: 'Heart', label: 'Heart', icon: Heart },
];

export function AboutContentPage() {
  const { restaurant } = useAdminRestaurant();
  const queryClient = useQueryClient();

  // Default structure if undefined in DB
  const defaultAbout: AboutPageSettings = {
    storyTitle: '',
    storyParagraphs: [],
    storyImages: [],
    stats: [],
    values: [],
    team: []
  };

  const [localAbout, setLocalAbout] = useState<AboutPageSettings>(defaultAbout);

  useEffect(() => {
    if (restaurant?.settings?.aboutPage) {
      setLocalAbout(restaurant.settings.aboutPage);
    }
  }, [restaurant]);

  const updateMutation = useMutation({
    mutationFn: (data: AboutPageSettings) => {
      if (!restaurant?.id) throw new Error("No restaurant ID");
      return settingsApi.update(restaurant.id, { aboutPage: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurant?.id] });
      toast({ title: 'About page content saved!' });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: 'Failed to save changes', variant: 'destructive' });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(localAbout);
  };

  const updateStat = (index: number, field: 'label' | 'value', val: string) => {
    const newStats = [...localAbout.stats];
    newStats[index] = { ...newStats[index], [field]: val };
    setLocalAbout({ ...localAbout, stats: newStats });
  };

  const addStat = () => {
    setLocalAbout({ ...localAbout, stats: [...localAbout.stats, { label: 'New Stat', value: '0' }] });
  };

  const removeStat = (index: number) => {
    setLocalAbout({ ...localAbout, stats: localAbout.stats.filter((_, i) => i !== index) });
  };

  const updateValue = (index: number, field: keyof typeof localAbout.values[0], val: string) => {
    const newValues = [...localAbout.values];
    newValues[index] = { ...newValues[index], [field]: val };
    setLocalAbout({ ...localAbout, values: newValues });
  };

  const addValue = () => {
    setLocalAbout({ ...localAbout, values: [...localAbout.values, { icon: 'Heart', title: 'New Value', description: 'Description' }] });
  };

  const removeValue = (index: number) => {
    setLocalAbout({ ...localAbout, values: localAbout.values.filter((_, i) => i !== index) });
  };

  const updateTeam = (index: number, field: keyof typeof localAbout.team[0], val: string) => {
    const newTeam = [...localAbout.team];
    newTeam[index] = { ...newTeam[index], [field]: val };
    setLocalAbout({ ...localAbout, team: newTeam });
  };

  const addTeam = () => {
    setLocalAbout({ ...localAbout, team: [...localAbout.team, { name: 'New Member', role: 'Role', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=300&h=300&fit=crop' }] });
  };

  const removeTeam = (index: number) => {
    setLocalAbout({ ...localAbout, team: localAbout.team.filter((_, i) => i !== index) });
  };

  const updateParagraph = (index: number, val: string) => {
    const newParagraphs = [...localAbout.storyParagraphs];
    newParagraphs[index] = val;
    setLocalAbout({ ...localAbout, storyParagraphs: newParagraphs });
  };

  const addParagraph = () => {
    setLocalAbout({ ...localAbout, storyParagraphs: [...localAbout.storyParagraphs, 'New paragraph...'] });
  };

  const removeParagraph = (index: number) => {
    setLocalAbout({ ...localAbout, storyParagraphs: localAbout.storyParagraphs.filter((_, i) => i !== index) });
  };

  const updateStoryImage = (index: number, val: string) => {
    const newImages = [...localAbout.storyImages];
    newImages[index] = val;
    setLocalAbout({ ...localAbout, storyImages: newImages });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">About Page Content</h1>
          <p className="text-muted-foreground">Customize your About page content</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="story" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="story">Our Story</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Story Tab */}
        <TabsContent value="story" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Our Story Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Section Title</Label>
                <Input
                  value={localAbout.storyTitle}
                  onChange={(e) => setLocalAbout({ ...localAbout, storyTitle: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Story Paragraphs</Label>
                  <Button variant="outline" size="sm" onClick={addParagraph}>
                    <Plus className="w-4 h-4 mr-1" />Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {localAbout.storyParagraphs.map((para, i) => (
                    <div key={i} className="flex gap-2">
                      <Textarea
                        value={para}
                        onChange={(e) => updateParagraph(i, e.target.value)}
                        rows={3}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeParagraph(i)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Story Images</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  {localAbout.storyImages.map((img, i) => (
                    <div key={i} className="space-y-2">
                      <ImageUploader
                        value={img}
                        onChange={(url) => updateStoryImage(i, url)}
                        label={`Image ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Statistics</CardTitle>
                <Button variant="outline" size="sm" onClick={addStat}>
                  <Plus className="w-4 h-4 mr-1" />Add Stat
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {localAbout.stats.map((stat, i) => (
                  <div key={i} className="flex gap-2 items-start p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={stat.value}
                        onChange={(e) => updateStat(i, 'value', e.target.value)}
                        placeholder="Value (e.g., 10+)"
                        className="text-lg font-bold"
                      />
                      <Input
                        value={stat.label}
                        onChange={(e) => updateStat(i, 'label', e.target.value)}
                        placeholder="Label"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeStat(i)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Values Tab */}
        <TabsContent value="values" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Our Values</CardTitle>
                <Button variant="outline" size="sm" onClick={addValue}>
                  <Plus className="w-4 h-4 mr-1" />Add Value
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {localAbout.values.map((value, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex gap-2 items-center">
                      <Select value={value.icon} onValueChange={(v) => updateValue(i, 'icon', v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <opt.icon className="w-4 h-4" />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={value.title}
                        onChange={(e) => updateValue(i, 'title', e.target.value)}
                        placeholder="Title"
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeValue(i)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Textarea
                      value={value.description}
                      onChange={(e) => updateValue(i, 'description', e.target.value)}
                      placeholder="Description"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <Button variant="outline" size="sm" onClick={addTeam}>
                  <Plus className="w-4 h-4 mr-1" />Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {localAbout.team.map((member, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => removeTeam(i)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    <ImageUploader
                      value={member.image}
                      onChange={(url) => updateTeam(i, 'image', url)}
                      label="Profile Photo"
                      className="mb-4"
                    />

                    <Input
                      value={member.name}
                      onChange={(e) => updateTeam(i, 'name', e.target.value)}
                      placeholder="Name"
                    />
                    <Input
                      value={member.role}
                      onChange={(e) => updateTeam(i, 'role', e.target.value)}
                      placeholder="Role"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}