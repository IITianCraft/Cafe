import { useState, useEffect } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Phone, ShoppingBag, Loader2 } from 'lucide-react';
import { userApi, orderApi } from '@/services/api';
import { useRestaurant } from '@/context/RestaurantContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Profile() {
    const { user, isAuthenticated, updateUser } = useAuth();
    const { restaurant } = useRestaurant();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    // Fetch Order Stats
    const { data: orders = [] } = useQuery({
        queryKey: ['my-orders', restaurant?.id],
        queryFn: async () => {
            if (!isAuthenticated || !restaurant?.id) return [];
            const res = await orderApi.getUserOrders(restaurant.id);
            return res.data.data;
        },
        enabled: isAuthenticated && !!restaurant?.id
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: { name: string; phone: string }) => {
            await userApi.updateProfile(data);
            return data;
        },
        onSuccess: (data) => {
            updateUser(data);
            setIsEditing(false);
            toast({ title: "Profile updated", description: "Your details have been saved." });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
        onError: () => {
            toast({ title: "Update failed", description: "Could not update profile.", variant: "destructive" });
        }
    });

    const handleSave = () => {
        updateProfileMutation.mutate(formData);
    };

    if (!isAuthenticated) return null; // Should be protected by route/layout

    return (
        <UserLayout>
            <div className="bg-muted/30 min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl font-bold">My Profile</h1>
                            <p className="text-muted-foreground">Manage your account and preferences</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Profile Card */}
                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Your contact details</CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                                            {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        {isEditing ? (
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        ) : (
                                            <span className="font-medium">{user?.name}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium text-muted-foreground">{user?.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        {isEditing ? (
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+91"
                                            />
                                        ) : (
                                            <span className="font-medium">{user?.phone || 'Not set'}</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Card */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Overview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                                        <div className="flex items-center gap-3">
                                            <ShoppingBag className="w-5 h-5 text-primary" />
                                            <span className="font-medium">Total Orders</span>
                                        </div>
                                        <span className="text-xl font-bold">{orders.length}</span>
                                    </div>
                                    {orders.length > 0 && (
                                        <div className="text-sm text-muted-foreground text-center">
                                            Last order on {new Date(orders[0].createdAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
