import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { Order, OrderStatus } from '@/types';
import {
  Search, Filter, Eye, Printer, CheckCircle,
  XCircle, Truck, Clock, ChefHat, Package, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { orderApi } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-amber-500', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-blue-500', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'bg-violet-500', icon: ChefHat },
  'out-for-delivery': { label: 'Out for Delivery', color: 'bg-indigo-500', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-500', icon: Package },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

import { useAdminRestaurant } from '@/context/AdminContext';

export function OrdersPage() {
  const { restaurant } = useAdminRestaurant();
  const restaurantId = restaurant?.id;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, restaurantId],
    queryFn: async () => {
      const params: any = { restaurantId };
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await orderApi.getAll(params);
      return res.data.data.map((order: any) => ({
        ...order,
        id: order.id,
        // Map legacy fields if missing
        userName: order.userEmail || order.userId || "Guest",
        userPhone: order.userPhone || "N/A",
        items: order.items.map((item: any) => ({
          ...item,
          foodItem: {
            name: item.title || item.name || "Item",
            image: item.image || item.imagePath || "",
            price: item.price
          }
        })),
        total: Number(order.total),
        createdAt: order.createdAt
      }));
    },
    enabled: !!restaurantId
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => orderApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders', statusFilter, restaurantId] });
      toast({
        title: 'Order Updated',
        description: `Order status changed to ${variables.status}`,
      });
      if (selectedOrder) setSelectedOrder(null);
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" })
  });

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ['pending', 'accepted', 'preparing', 'out-for-delivery', 'delivered'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  // Client-side search (backend usually supports search, but for MVP client side is ok for small batches)
  const filteredOrders = orders.filter((order: any) => {
    const term = search.toLowerCase();
    return (order.id || '').toLowerCase().includes(term) ||
      (order.userName || '').toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and track all orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => {
            const status = statusConfig[order.status as OrderStatus] || statusConfig['pending'];
            const nextStatus = getNextStatus(order.status as OrderStatus);

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Order Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">#{order.id}</h3>
                            {order.orderType && <Badge variant="outline" className="capitalize">{order.orderType}</Badge>}
                            {order.tableNumber && (
                              <Badge variant="secondary">Table {order.tableNumber}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={cn(status.color, "text-white")}>
                          <status.icon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Customer</p>
                          <p className="font-medium">{order.userName}</p>
                          <p className="text-sm text-muted-foreground">{order.userPhone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Items</p>
                          <p className="font-medium">{order.items?.length || 0} items</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items?.map((i: any) => i.foodItem?.name).slice(0, 2).join(', ')}
                            {(order.items?.length || 0) > 2 && '...'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-bold text-lg text-primary">₹{order.total?.toFixed(0)}</p>
                          <Badge variant="outline" className="capitalize">{order.paymentStatus || 'Pending'}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-muted/30 p-4 flex flex-row lg:flex-col gap-2 justify-end lg:w-48">
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      {nextStatus && order.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          disabled={updateStatusMutation.isPending}
                        >
                          Mark {statusConfig[nextStatus].label}
                        </Button>
                      )}
                      {order.status === 'pending' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          disabled={updateStatusMutation.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No orders found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.user?.name || selectedOrder.userName}</p>
                  <p className="text-sm">{selectedOrder.user?.email || selectedOrder.userEmail}</p>
                </div>
                <div>
                  {/* More details */}
                </div>
              </div>
              {/* Items */}
              <div>
                <p className="font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id || Math.random()} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <span className="font-bold">{item.quantity}x</span>
                      <span>{item.foodItem?.name}</span>
                      <span className="ml-auto">₹{item.price || item.foodItem?.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-2 mt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{selectedOrder.total}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
