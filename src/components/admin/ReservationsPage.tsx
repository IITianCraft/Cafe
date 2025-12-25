import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reservation } from '@/types';
import { CheckCircle, XCircle, Clock, Calendar, Users, Phone, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAdminRestaurant } from '@/context/AdminContext';
import { reservationApi } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function ReservationsPage() {
  const { restaurant } = useAdminRestaurant();
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations', restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      const res = await reservationApi.getAll(restaurant.id);
      return res.data.data;
    },
    enabled: !!restaurant?.id
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => reservationApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', restaurant?.id] });
      toast({ title: "Status updated" });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" })
  });

  const updateStatus = (id: string, status: Reservation['status']) => {
    updateMutation.mutate({ id, status });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Reservations</h1>
        <p className="text-muted-foreground">Manage table reservations</p>
      </div>

      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">No reservations found.</div>
        ) : (
          reservations.map((res: Reservation) => (
            <Card key={res.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{res.userName}</h3>
                      <Badge className={cn(
                        res.status === 'confirmed' && 'bg-emerald-500',
                        res.status === 'pending' && 'bg-amber-500',
                        res.status === 'cancelled' && 'bg-red-500'
                      )}>{res.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{res.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{res.time}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{res.guests} guests</span>
                      <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{res.userPhone}</span>
                    </div>
                    {res.notes && <p className="text-sm italic">"{res.notes}"</p>}
                  </div>
                  {res.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateStatus(res.id, 'confirmed')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Confirm
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(res.id, 'cancelled')}>
                        <XCircle className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )))}
      </div>
    </div>
  );
}
