import { useState } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/services/api';

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: 'Pending', icon: Clock, className: 'status-pending' },
  accepted: { label: 'Accepted', icon: Package, className: 'status-accepted' },
  preparing: { label: 'Preparing', icon: Package, className: 'status-accepted' },
  'out-for-delivery': { label: 'Out for Delivery', icon: Package, className: 'status-accepted' },
  delivered: { label: 'Delivered', icon: CheckCircle, className: 'status-delivered' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'status-cancelled' },
};

import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useRestaurant } from '@/context/RestaurantContext';

export default function Orders() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const { restaurant } = useRestaurant();
  const [activeTab, setActiveTab] = useState('all');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const { data: myOrders = [], isLoading } = useQuery({
    queryKey: ['my-orders', restaurant?.id],
    queryFn: async () => {
      if (!isAuthenticated || !restaurant?.id) return [];
      const res = await orderApi.getUserOrders(restaurant.id);
      return res.data.data.map((order: any) => ({
        ...order,
        items: order.items.map((item: any) => ({
          ...item,
          // Ensure nested structure matches true
          foodItem: {
            name: item.title || item.name || "Unknown Item",
            image: item.image || item.imagePath || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500",
            price: item.priceSnapshot || item.price
          }
        }))
      }));
    },
    enabled: isAuthenticated && !!restaurant?.id
  });

  const handleOrderAgain = (order: any) => {
    order.items.forEach((item: any) => {
      addToCart(item.foodItem, item.quantity, item.selectedOptions, item.specialInstructions);
    });
    navigate(`/${restaurant?.slug}/checkout`);
  };

  const getStepStatus = (currentStatus: OrderStatus, stepStatus: OrderStatus) => {
    const steps = ['pending', 'accepted', 'preparing', 'out-for-delivery', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(stepStatus);

    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  if (!isAuthenticated) {
    return (
      <UserLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Package className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Sign in to view orders</h2>
          <p className="text-muted-foreground mb-4">Track your past and current orders</p>
          <Button onClick={openLoginModal}>Sign In</Button>
        </div>
      </UserLayout>
    );
  }

  const filteredOrders = activeTab === 'all'
    ? myOrders
    : myOrders.filter((o: any) => o.status === activeTab);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) { return dateString; }
  };

  return (
    <UserLayout>
      <div className="bg-muted/30 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-6">
                  {filteredOrders.map((order: any) => {
                    const status = statusConfig[order.status as OrderStatus] || statusConfig['pending'];
                    const StatusIcon = status.icon;

                    return (
                      <Card key={order.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="bg-muted/30 py-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-background rounded-full border">
                                <Package className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">Order #{order.id.slice(-6).toUpperCase()}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className={cn('capitalize px-3 py-1', status.className)}>
                                {status.label}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => handleOrderAgain(order)}>
                                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                Order Again
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="py-6">
                          {/* Stepper for Active Orders */}
                          {['pending', 'accepted', 'preparing', 'out-for-delivery', 'delivered'].includes(order.status) && (
                            <div className="mb-8 px-2 hidden md:block">
                              <div className="flex items-center justify-between relative">
                                {/* Connecting Line */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10"></div>

                                {['pending', 'accepted', 'preparing', 'out-for-delivery', 'delivered'].map((step, index) => {
                                  const stepState = getStepStatus(order.status, step as OrderStatus);
                                  const StepIcon = statusConfig[step as OrderStatus]?.icon || Package;

                                  return (
                                    <div key={step} className="flex flex-col items-center bg-background px-2">
                                      <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                                        stepState === 'completed' ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-muted-foreground/30 text-muted-foreground"
                                      )}>
                                        <StepIcon className="w-4 h-4" />
                                      </div>
                                      <span className={cn(
                                        "text-xs mt-2 font-medium capitalize",
                                        stepState === 'completed' ? "text-primary" : "text-muted-foreground"
                                      )}>{step.replace(/-/g, ' ')}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Items</h4>
                              <div className="space-y-3">
                                {order.items.slice(0, activeTab === 'all' ? 2 : 5).map((item: any) => (
                                  <div key={item.id || Math.random()} className="flex items-center gap-4 bg-muted/20 p-2 rounded-lg">
                                    <img
                                      src={item.foodItem.image}
                                      alt={item.foodItem.name}
                                      className="w-12 h-12 rounded-md object-cover"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{item.foodItem.name}</p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>Qty: {item.quantity}</span>
                                        {item.selectedOptions?.length > 0 && (
                                          <span>• {item.selectedOptions.map((o: any) => o.name).join(', ')}</span>
                                        )}
                                      </div>
                                    </div>
                                    <p className="font-medium text-sm">₹{item.foodItem.price * item.quantity}</p>
                                  </div>
                                ))}
                                {order.items.length > 2 && activeTab === 'all' && (
                                  <p className="text-xs text-muted-foreground pl-2">+{order.items.length - 2} more items...</p>
                                )}
                              </div>
                            </div>

                            <div className="bg-muted/10 p-4 rounded-lg border h-fit">
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Order Summary</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Subtotal</span>
                                  <span>₹{order.subtotal || order.total}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Tax</span>
                                  <span>₹{order.tax || 0}</span>
                                </div>
                                <Divider className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Total</span>
                                  <span className="text-primary">₹{order.total}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                      {activeTab === 'all'
                        ? "Looks like you haven't placed any orders yet. Start exploring our menu!"
                        : `You have no ${activeTab} orders at the moment.`}
                    </p>
                    <Button asChild className="rounded-full px-8">
                      <a href={`/${restaurant?.slug}/menu`}>Browse Menu</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </UserLayout>
  );
}

function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />
}
