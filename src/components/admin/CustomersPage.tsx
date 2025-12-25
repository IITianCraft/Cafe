import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Mail, Phone, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAdminRestaurant } from '@/context/AdminContext';
import { userApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export function CustomersPage() {
  const { restaurant } = useAdminRestaurant();
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      const res = await userApi.getCustomers(restaurant.id);
      return res.data.data;
    },
    enabled: !!restaurant?.id
  });

  const filtered = customers.filter((c: any) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">View and manage customer data</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">No customers found.</div>
        ) : (
          filtered.map((customer: any) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{customer.name || 'Guest User'}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm mb-3">
                  <div><span className="text-muted-foreground">Orders:</span> <strong>{customer.totalOrders || 0}</strong></div>
                  <div><span className="text-muted-foreground">Spent:</span> <strong>₹{customer.totalSpent || 0}</strong></div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(customer.tags || []).map((tag: string) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )))}
      </div>
    </div>
  );
}
