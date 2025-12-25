import { useState } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  CalendarDays,
  Users,
  Clock,
  Loader2,
  CheckCircle,
  Utensils,
  PartyPopper,
  Heart,
  Armchair
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { reservationApi, tablesApi } from '@/services/api';
import { useRestaurant } from '@/context/RestaurantContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Reservations() {
  const { restaurant } = useRestaurant();
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationDate, setReservationDate] = useState<Date | undefined>(new Date());

  // Steps: 'selection' -> 'details'
  const [step, setStep] = useState<'selection' | 'details'>('selection');
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '2',
    time: '',
    occasion: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: reservationApi.create,
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Reservation request sent!",
        description: "We'll confirm your booking shortly via email/SMS.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error requesting reservation",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleCheckAvailability = async () => {
    if (!reservationDate) {
      toast({ title: "Please select a date", variant: "destructive" });
      return;
    }
    if (!form.time) {
      toast({ title: "Please select a time", variant: "destructive" });
      return;
    }
    if (!restaurant?.id) return;

    try {
      setCheckingAvailability(true);
      setAvailableTables([]);
      setSelectedTable(null);

      // Sending ISO string for date (DB expects exact match or similar, backend logic handles day)
      // Actually backend route uses strict match 'where date == ...' so we must ensure consistent format
      // Ideally sending just YYYY-MM-DD would be better but existing system might rely on full ISO.
      // Let's send key parts or consistent ISO.
      // Since I control backend, I know it expects what I send.
      // Backend: req.query.date. Frontend: reservationDate.toISOString()

      const res = await tablesApi.getAvailable(
        restaurant.id,
        reservationDate.toISOString(),
        form.time
      );

      // Filter by capacity if needed, or show all valid
      // Simple filter: capacity >= guests
      const suitableTables = res.data.data.filter((t: any) => t.capacity >= parseInt(form.guests));

      if (suitableTables.length === 0) {
        toast({ title: "No tables available for this time/size.", variant: "destructive" });
      } else {
        setAvailableTables(suitableTables);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to check availability", variant: "destructive" });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    setStep('details');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id || !reservationDate) return;

    mutation.mutate({
      ...form,
      date: reservationDate.toISOString(),
      restaurantId: restaurant.id,
      tableId: selectedTable.id,
      tableName: selectedTable.name
    });
  };

  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM',
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
  ];

  const occasions = [
    { value: 'birthday', label: 'Birthday', icon: PartyPopper },
    { value: 'anniversary', label: 'Anniversary', icon: Heart },
    { value: 'business', label: 'Business Meal', icon: Utensils },
    { value: 'date', label: 'Date Night', icon: Heart },
    { value: 'other', label: 'Other', icon: Utensils },
  ];

  if (isSuccess) {
    return (
      <UserLayout>
        <div className="min-h-[60vh] flex items-center justify-center bg-muted/30">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Reservation Requested!</h2>
              <p className="text-muted-foreground mb-4">
                Thank you, {form.name}! We've received your booking for{' '}
                <strong>{selectedTable?.name}</strong> ({form.guests} guests) on{' '}
                <strong>{reservationDate?.toLocaleDateString()}</strong> at{' '}
                <strong>{form.time}</strong>.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => {
                  setIsSuccess(false);
                  setStep('selection');
                  setAvailableTables([]);
                  setSelectedTable(null);
                  setForm({ name: '', email: '', phone: '', guests: '2', time: '', occasion: '', notes: '' });
                }}>
                  Make Another
                </Button>
                <Button onClick={() => window.location.href = `/${restaurant?.slug}/menu`}>
                  View Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <section className="bg-gradient-to-r from-primary to-primary/80 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Reserve a Table
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto">
            Find your perfect spot. Book instantly.
          </p>
        </div>
      </section>

      <div className="bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                {step === 'selection' ? 'Select Date & Time' : 'Confirm Details'}
              </CardTitle>
              <CardDescription>
                {step === 'selection'
                  ? 'Choose when you would like to dine with us.'
                  : `Completing reservation for ${selectedTable?.name} at ${form.time}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'selection' ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Date Picker */}
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={reservationDate}
                        onSelect={(d) => { setReservationDate(d); setAvailableTables([]); }}
                        disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                        className="rounded-lg border shadow-sm"
                      />
                    </div>

                    <div className="space-y-6">
                      {/* Guests */}
                      <div className="space-y-2">
                        <Label>Number of Guests</Label>
                        <Select
                          value={form.guests}
                          onValueChange={(v) => { setForm({ ...form, guests: v }); setAvailableTables([]); }}
                        >
                          <SelectTrigger>
                            <Users className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n} {n === 1 ? 'Guest' : 'Guests'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Time */}
                      <div className="space-y-2">
                        <Label>Preferred Time</Label>
                        <Select
                          value={form.time}
                          onValueChange={(v) => { setForm({ ...form, time: v }); setAvailableTables([]); }}
                        >
                          <SelectTrigger>
                            <Clock className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        className="w-full"
                        onClick={handleCheckAvailability}
                        disabled={checkingAvailability || !form.time || !reservationDate}
                      >
                        {checkingAvailability && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Check Availability
                      </Button>
                    </div>
                  </div>

                  {/* Available Tables */}
                  {availableTables.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="font-semibold mb-4 text-lg">Available Tables</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {availableTables.map(table => (
                          <button
                            key={table.id}
                            onClick={() => setSelectedTable(table)}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:bg-primary/5",
                              selectedTable?.id === table.id
                                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                : "border-muted bg-card hover:border-primary/50"
                            )}
                          >
                            <Armchair className={cn(
                              "w-8 h-8 mb-2",
                              selectedTable?.id === table.id ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span className="font-bold text-sm">{table.name}</span>
                            <span className="text-xs text-muted-foreground">{table.capacity} Seats</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTable && (
                    <div className="flex justify-end pt-4 border-t">
                      <Button size="lg" onClick={() => setStep('details')}>
                        Proceed to Book {selectedTable.name}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Occasion</Label>
                      <Select
                        value={form.occasion}
                        onValueChange={(v) => setForm({ ...form, occasion: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasions.map((occ) => (
                            <SelectItem key={occ.value} value={occ.value}>
                              {occ.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Special Requests</Label>
                    <Textarea
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      placeholder="Dietary restrictions, seating preferences..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep('selection')} className="w-full">
                      Back
                    </Button>
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                      {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Confirm Booking"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}
