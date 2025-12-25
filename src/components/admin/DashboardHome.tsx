import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, Package, Clock, DollarSign,
  ArrowUpRight, ArrowDownRight, Eye, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { orderApi } from '@/services/api';
import { Order } from '@/types';
import { useAdminRestaurant } from '@/context/AdminContext';

export function DashboardHome() {
  const { user } = useAuth();
  const { restaurant } = useAdminRestaurant();
  const restaurantId = restaurant?.id;
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    weeklyGrowth: 0,
    chartData: [] as any[],
    topItems: [] as any[]
  });

  useEffect(() => {
    if (restaurantId) {
      fetchDashboardData();
    }
  }, [restaurantId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getAll({ restaurantId });
      const allOrders = res.data.data || [];
      setOrders(allOrders);
      calculateStats(allOrders);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((o: any) => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
    const pending = orders.filter((o: any) => o.status === 'pending').length;

    // Simple chart data (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayOrders = orders.filter((o: any) => {
        const date = new Date(o.createdAt);
        return date >= d && date < nextD;
      });

      const dayRevenue = dayOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
      chartData.push({
        date: d.toISOString(),
        amount: dayRevenue
      });
    }

    // Top Items
    const itemMap = new Map();
    orders.forEach((o: any) => {
      o.items.forEach((i: any) => {
        const name = i.foodItem?.name || i.title || "Unknown";
        const qty = i.quantity || 1;
        itemMap.set(name, (itemMap.get(name) || 0) + qty);
      });
    });

    const topItems = Array.from(itemMap.entries())
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);

    setStats({
      todayRevenue,
      totalOrders: orders.length,
      pendingOrders: pending,
      weeklyGrowth: 0, // Placeholder calculation
      chartData,
      topItems
    });
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  const statCards = [
    {
      label: 'Today Revenue',
      value: `₹${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      trend: '+0%', // Dynamic trend require comparing with yesterday
      trendUp: true
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      trend: '',
      trendUp: true
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      trend: '',
      trendUp: false
    },
    {
      label: 'Weekly Items', // Changed from Growth to Items sold for now
      value: orders.reduce((acc, o) => acc + (o.items?.length || 0), 0),
      icon: TrendingUp,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      trend: '',
      trendUp: true
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Detailed overview of your restaurant's performance.</p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" size="sm">Export</Button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Orders Yet</h3>
              <p className="text-muted-foreground">Once orders are placed, your dashboard will light up!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue Overview (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                        className="text-xs"
                      />
                      <YAxis
                        tickFormatter={(value) => `₹${value}`}
                        className="text-xs"
                      />
                      <Tooltip
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Items */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topItems.length === 0 ? <p className="text-muted-foreground text-sm">No items sold yet.</p> : stats.topItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        i === 0 ? "bg-amber-500/20 text-amber-600" :
                          i === 1 ? "bg-slate-300/20 text-slate-600" :
                            i === 2 ? "bg-orange-500/20 text-orange-600" :
                              "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sales} sold</p>
                      </div>
                      <Badge variant="secondary">{item.sales}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm">
                  View All <Eye className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">#{order.id.slice(0, 6)}...</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{order.userName || 'Guest'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">{order.orderType}</Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">₹{Number(order.total).toFixed(0)}</td>
                        <td className="py-3 px-4">
                          <Badge className={cn(
                            "capitalize",
                            order.status === 'delivered' && "bg-emerald-500",
                            order.status === 'pending' && "bg-amber-500",
                            order.status === 'accepted' && "bg-blue-500",
                            order.status === 'preparing' && "bg-violet-500",
                            order.status === 'cancelled' && "bg-red-500"
                          )}>
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
