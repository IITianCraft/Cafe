import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FoodItem } from '@/types';
import {
  Search, Plus, Edit, Trash2, Upload,
  Leaf, Star, Loader2, Image as ImageIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { foodApi, uploadApi, categoryApi } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminRestaurant } from '@/context/AdminContext';

export function MenuPage() {
  const { restaurant } = useAdminRestaurant();
  const restaurantId = restaurant?.id;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('items');

  // --- STATE: ITEMS ---
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string>('');
  const [itemUploading, setItemUploading] = useState(false);

  const [itemForm, setItemForm] = useState<Partial<FoodItem>>({
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    category: '',
    image: '',
    isAvailable: true,
    isVeg: true,
    isBestseller: false,
    preparationTime: '15 mins',
  });

  // --- STATE: CATEGORIES ---
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [catImagePreview, setCatImagePreview] = useState<string>('');
  const [catUploading, setCatUploading] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', image: '' });


  // --- QUERIES ---
  const { data: categories = [], isLoading: isLoadingCats } = useQuery({
    queryKey: ['categories', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const res = await categoryApi.getAll(restaurantId);
      return res.data.data;
    },
    enabled: !!restaurantId
  });

  const { data: foodItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const res = await foodApi.getAll({ restaurantId });
      return res.data.data.map((item: any) => ({
        ...item,
        name: item.title || item.name,
        image: item.imagePath || item.image
      }));
    },
    enabled: !!restaurantId
  });

  // --- MUTATIONS: ITEMS ---
  const createItemMutation = useMutation({
    mutationFn: foodApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
      toast({ title: 'Item added successfully' });
      setIsItemDialogOpen(false);
    },
    onError: () => toast({ title: 'Failed to add item', variant: 'destructive' })
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => foodApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
      toast({ title: 'Item updated successfully' });
      setIsItemDialogOpen(false);
    },
    onError: () => toast({ title: 'Failed to update item', variant: 'destructive' })
  });

  const deleteItemMutation = useMutation({
    mutationFn: foodApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
      toast({ title: 'Item deleted successfully' });
      setDeleteItemId(null);
    },
    onError: () => toast({ title: 'Failed to delete item', variant: 'destructive' })
  });

  // --- MUTATIONS: CATEGORIES ---
  const createCatMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] });
      toast({ title: 'Category created successfully' });
      setIsCatDialogOpen(false);
    },
    onError: () => toast({ title: 'Failed to create category', variant: 'destructive' })
  });

  const updateCatMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] });
      toast({ title: 'Category updated successfully' });
      setIsCatDialogOpen(false);
    },
    onError: () => toast({ title: 'Failed to update category', variant: 'destructive' })
  });

  const deleteCatMutation = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] });
      toast({ title: 'Category deleted successfully' });
      setDeleteCatId(null);
    },
    onError: () => toast({ title: 'Failed to delete category', variant: 'destructive' })
  });

  // --- HANDLERS: ITEMS ---
  const filteredItems = foodItems.filter((item: any) => {
    const matchesSearch = (item.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openItemDialog = (item?: FoodItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm(item);
      setItemImagePreview(item.image);
    } else {
      setEditingItem(null);
      setItemForm({
        name: '', description: '', price: 0, originalPrice: undefined,
        category: '', image: '', isAvailable: true, isVeg: true,
        isBestseller: false, preparationTime: '15 mins',
      });
      setItemImagePreview('');
    }
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemForm.name || !itemForm.price || !itemForm.category) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const payload = { ...itemForm, title: itemForm.name, imagePath: itemForm.image, restaurantId };
    if (editingItem) updateItemMutation.mutate({ id: editingItem.id, data: payload });
    else createItemMutation.mutate(payload);
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setItemUploading(true);
      try {
        const res = await uploadApi.uploadFile(file);
        const finalUrl = res.data.data.url;
        setItemImagePreview(finalUrl);
        setItemForm(prev => ({ ...prev, image: finalUrl }));
        toast({ title: "Image uploaded" });
      } catch (error) {
        console.error('Upload failed', error);
        toast({ title: "Upload failed", variant: "destructive" });
      } finally {
        setItemUploading(false);
      }
    }
  };

  // --- HANDLERS: CATEGORIES ---
  const openCatDialog = (cat?: any) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, image: cat.image || '' });
      setCatImagePreview(cat.image || '');
    } else {
      setEditingCat(null);
      setCatForm({ name: '', image: '' });
      setCatImagePreview('');
    }
    setIsCatDialogOpen(true);
  };

  const handleSaveCat = () => {
    if (!catForm.name) {
      toast({ title: 'Category name is required', variant: 'destructive' });
      return;
    }
    const payload = { ...catForm, restaurantId };
    if (editingCat) updateCatMutation.mutate({ id: editingCat.id, data: payload });
    else createCatMutation.mutate(payload);
  };

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCatUploading(true);
      try {
        const res = await uploadApi.uploadFile(file);
        const finalUrl = res.data.data.url;
        setCatImagePreview(finalUrl);
        setCatForm(prev => ({ ...prev, image: finalUrl }));
        toast({ title: "Image uploaded" });
      } catch (error) {
        toast({ title: "Upload failed", variant: "destructive" });
      } finally {
        setCatUploading(false);
      }
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage your categories and food items</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="items">Food Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* --- ITEMS TAB --- */}
        <TabsContent value="items" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Items</h2>
            <Button onClick={() => openItemDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {isLoadingItems ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item: any) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="relative h-40">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openItemDialog(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteItemId(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">₹{item.price}</span>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- CATEGORIES TAB --- */}
        <TabsContent value="categories" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categories</h2>
            <Button onClick={() => openCatDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Card key={cat.id} className="overflow-hidden group">
                <div className="relative h-40 bg-muted flex items-center justify-center">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openCatDialog(cat)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteCatId(cat.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {foodItems.filter((i: any) => i.category === cat.name).length} items
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- ITEM DIALOG --- */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Image</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                {itemUploading ? <Loader2 className="animate-spin mx-auto" /> : itemImagePreview ? (
                  <div className="relative">
                    <img src={itemImagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <Button variant="secondary" size="sm" className="absolute top-2 right-2"
                      onClick={() => { setItemImagePreview(''); setItemForm(prev => ({ ...prev, image: '' })); }}>Remove</Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-2 py-4"><Upload className="w-8 h-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Upload Image</p></div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleItemImageUpload} />
                  </label>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={itemForm.name} onChange={e => setItemForm(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div>
                <Label>Category *</Label>
                <Select value={itemForm.category} onValueChange={v => setItemForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={itemForm.description} onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Price *</Label><Input type="number" value={itemForm.price} onChange={e => setItemForm(prev => ({ ...prev, price: Number(e.target.value) }))} /></div>
              <div><Label>Original Price</Label><Input type="number" value={itemForm.originalPrice || ''} onChange={e => setItemForm(prev => ({ ...prev, originalPrice: Number(e.target.value) || undefined }))} /></div>
              <div><Label>Prep Time</Label><Input value={itemForm.preparationTime} onChange={e => setItemForm(prev => ({ ...prev, preparationTime: e.target.value }))} /></div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch checked={itemForm.isVeg} onCheckedChange={v => setItemForm(prev => ({ ...prev, isVeg: v }))} /><Label>Veg</Label></div>
              <div className="flex items-center gap-2"><Switch checked={itemForm.isAvailable} onCheckedChange={v => setItemForm(prev => ({ ...prev, isAvailable: v }))} /><Label>Available</Label></div>
              <div className="flex items-center gap-2"><Switch checked={itemForm.isBestseller} onCheckedChange={v => setItemForm(prev => ({ ...prev, isBestseller: v }))} /><Label>Bestseller</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- CATEGORY DIALOG --- */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCat ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Category Name *</Label>
              <Input value={catForm.name} onChange={e => setCatForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label>Category Image</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                {catUploading ? <Loader2 className="animate-spin mx-auto" /> : catImagePreview ? (
                  <div className="relative">
                    <img src={catImagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <Button variant="secondary" size="sm" className="absolute top-2 right-2"
                      onClick={() => { setCatImagePreview(''); setCatForm(prev => ({ ...prev, image: '' })); }}>Remove</Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-2 py-4"><Upload className="w-8 h-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Upload Image</p></div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCatImageUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCatDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCat}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION --- */}
      <AlertDialog open={!!deleteItemId || !!deleteCatId} onOpenChange={() => { setDeleteItemId(null); setDeleteCatId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteItemId ? deleteItemMutation.mutate(deleteItemId) : deleteCatId && deleteCatMutation.mutate(deleteCatId)} className="bg-destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
