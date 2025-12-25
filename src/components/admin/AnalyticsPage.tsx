import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { CreditCard, Banknote, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { useAdminRestaurant } from '@/context/AdminContext';
import { orderApi } from '@/services/api';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6'];

export function AnalyticsPage() {
  const { restaurant } = useAdminRestaurant();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    weeklyGrowth: 0,
    topItems: [],
    salesChart: []
  });

  useEffect(() => {
    if (restaurant?.id) {
      fetchData();
    }
  }, [restaurant?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getAll({ restaurantId: restaurant.id });
      const allOrders = res.data.data || [];
      setOrders(allOrders);
      calculateStats(allOrders);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders: any[]) => {
    // Total Sales
    const totalSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    // Sales Chart (Last 7 Days)
    const salesChart = [];
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
      salesChart.push({
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
      .slice(0, 5); // top 5

    setStats({
      totalSales,
      totalOrders: orders.length,
      pendingOrders,
      weeklyGrowth: 0,
      topItems,
      salesChart
    });
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  const pieData = stats.topItems.map((item: any) => ({ name: item.name, value: item.sales }));

  // Payment mode analytics
  const paymentModeData = orders.reduce((acc, order) => {
    const method = order.paymentMethod || 'Cash';
    const isOnline = ['UPI', 'Card', 'Wallet', 'NetBanking'].includes(method);
    const key = isOnline ? 'online' : 'offline';
    acc[key].amount += (Number(order.total) || 0);
    acc[key].count += 1;
    return acc;
  }, { online: { amount: 0, count: 0 }, offline: { amount: 0, count: 0 } });

  const totalAmount = paymentModeData.online.amount + paymentModeData.offline.amount;
  const onlinePercentage = totalAmount > 0 ? ((paymentModeData.online.amount / totalAmount) * 100).toFixed(1) : 0;
  const offlinePercentage = totalAmount > 0 ? ((paymentModeData.offline.amount / totalAmount) * 100).toFixed(1) : 0;

  const paymentPieData = [
    { name: 'Online Payments', value: paymentModeData.online.amount, color: '#22c55e' },
    { name: 'Cash/Offline', value: paymentModeData.offline.amount, color: '#f97316' },
  ];

  const paymentMethodBreakdown = orders.reduce((acc: any, order) => {
    const method = order.paymentMethod || 'Unknown';
    acc[method] = (acc[method] || 0) + (Number(order.total) || 0);
    return acc;
  }, {} as Record<string, number>);

  const paymentMethodData = Object.entries(paymentMethodBreakdown).map(([method, amount]) => ({
    method,
    amount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground">View business insights, sales reports, and payment analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats.totalSales.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.weeklyGrowth}% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Payments</p>
                <p className="text-2xl font-bold">₹{paymentModeData.online.amount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <Badge variant="secondary" className="mt-2">{onlinePercentage}% of total</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cash/Offline</p>
                <p className="text-2xl font-bold">₹{paymentModeData.offline.amount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <Badge variant="secondary" className="mt-2">{offlinePercentage}% of total</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{stats.pendingOrders} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { weekday: 'short' })} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Selling Items</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No sales data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Analytics Section */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Payment Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Online vs Offline Payments</CardTitle></CardHeader>
            <CardContent>
              {paymentPieData.some(p => p.value > 0) ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Amount']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No payment data</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment Method Breakdown</CardTitle></CardHeader>
            <CardContent>
              {paymentMethodData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentMethodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="method" />
                      <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Amount']} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No payment data</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <Card>
        <CardHeader><CardTitle>Recent Payment Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Method</th>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => {
                  const isOnline = ['UPI', 'Card', 'Wallet', 'NetBanking'].includes(order.paymentMethod);
                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">#{order.id.slice(0, 6)}</td>
                      <td className="py-3 px-2">{order.userName || 'Guest'}</td>
                      <td className="py-3 px-2">₹{Number(order.total).toLocaleString()}</td>
                      <td className="py-3 px-2">{order.paymentMethod || '-'}</td>
                      <td className="py-3 px-2">
                        <Badge variant={isOnline ? 'default' : 'secondary'}>
                          {isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                          {order.paymentStatus || 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}