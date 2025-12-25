import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Search, MessageSquare, Mail, Phone, Clock, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '@/services/api';
import { useAdminRestaurant } from '@/context/AdminContext';

interface CustomerQuery {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  response?: string;
  respondedAt?: string;
}

export function CustomerQueriesPage() {
  const { restaurant } = useAdminRestaurant();
  const restaurantId = restaurant?.id;
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuery, setSelectedQuery] = useState<CustomerQuery | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch Queries
  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['contact-queries', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const res = await contactApi.getAll(restaurantId);
      return res.data.data;
    },
    enabled: !!restaurantId
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, response }: { id: string, response: string }) => contactApi.respond(id, { response }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-queries', restaurantId] });
      toast({ title: 'Reply sent successfully' });
      setSelectedQuery(null);
      setReplyText('');
    },
    onError: () => toast({ title: 'Failed to send reply', variant: 'destructive' })
  });

  const filteredQueries = queries.filter((query: CustomerQuery) => {
    const matchesSearch =
      query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="destructive">Pending</Badge>;
      case 'responded': return <Badge variant="default">Responded</Badge>;
      case 'closed': return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleSendReply = () => {
    if (!selectedQuery || !replyText.trim()) return;
    respondMutation.mutate({ id: selectedQuery.id, response: replyText });
  };

  const pendingCount = queries.filter((q: CustomerQuery) => q.status === 'pending').length;

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Customer Queries</h1>
          <div className="text-muted-foreground">
            Manage inquiries from the Contact Us page
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'responded', 'closed'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Queries List */}
      <div className="space-y-4">
        {filteredQueries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No queries found</p>
            </CardContent>
          </Card>
        ) : (
          filteredQueries.map((query: CustomerQuery) => (
            <Card key={query.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{query.subject}</h3>
                      {getStatusBadge(query.status)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {query.name}</span>
                      <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {query.email}</span>
                      {query.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {query.phone}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm line-clamp-2">{query.message}</p>

                    {query.response && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Your Response:</p>
                        <p className="text-sm">{query.response}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedQuery(query); setReplyText(query.response || ''); }}>
                      <Send className="w-4 h-4 mr-1" />
                      {query.status === 'pending' ? 'Reply' : 'View'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!selectedQuery} onOpenChange={() => setSelectedQuery(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
          </DialogHeader>

          {selectedQuery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">From</p><p className="font-medium">{selectedQuery.name}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedQuery.email}</p></div>
                {selectedQuery.phone && <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedQuery.phone}</p></div>}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">{selectedQuery.subject}</p>
                <p className="text-sm">{selectedQuery.message}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Response</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response..."
                  rows={4}
                  disabled={!!selectedQuery.response} // Disable editable if already responded? Or allow edits? Let's allow edits for now based on logic above
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedQuery(null)}>Cancel</Button>
                  {/* Only allow sending if it hasn't been responded to, or allow over-write? API supports update. */}
                  <Button onClick={handleSendReply} disabled={!replyText.trim() || respondMutation.isPending}>
                    {respondMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}