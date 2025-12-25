import { useState } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Loader2,
  Send,
  MessageCircle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { contactApi } from '@/services/api';
import { useRestaurant } from '@/context/RestaurantContext';

export default function Contact() {
  const { restaurant } = useRestaurant();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const mutation = useMutation({
    mutationFn: contactApi.create,
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id) return;
    mutation.mutate({ ...form, restaurantId: restaurant.id });
  };

  return (
    <UserLayout>
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto">
            Have a question, feedback, or need assistance? We're here to help!
          </p>
        </div>
      </section>

      <div className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Visit Us</h3>
                      <p className="text-sm text-muted-foreground">
                        {restaurant?.address || "123 Food Street, Culinary District\nMumbai, Maharashtra - 400001"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Call Us</h3>
                      <p className="text-sm text-muted-foreground">
                        {restaurant?.phone || "+91 98765 43210"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email Us</h3>
                      <p className="text-sm text-muted-foreground">
                        {restaurant?.email || "hello@caferesto.com"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Opening Hours</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Daily: 9:00 AM - 10:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp CTA */}
              <Card className="bg-[#25D366]/10 border-[#25D366]/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageCircle className="w-8 h-8 text-[#25D366]" />
                    <div>
                      <h3 className="font-semibold">Chat on WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">Quick responses, order updates</p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
                    onClick={() => window.open(`https://wa.me/${restaurant?.phone?.replace(/\D/g, '') || '919876543210'}`, '_blank')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.1234567890!2d72.8347!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3MsKwNTAnMDUuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Restaurant Location"
                  />
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          placeholder="How can we help?"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your query or feedback..."
                        rows={6}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" size="lg" disabled={mutation.isPending}>
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { q: 'Do you offer home delivery?', a: 'Yes! We deliver within a 10km radius. Free delivery on orders above ₹500.' },
                    { q: 'Can I customize my order?', a: 'Absolutely! You can add special instructions for any item while ordering.' },
                    { q: 'What payment methods do you accept?', a: 'We accept UPI, cards, net banking, and cash on delivery.' },
                    { q: 'How do I make a reservation?', a: 'You can reserve a table through our Reservations page or call us directly.' },
                  ].map((faq, i) => (
                    <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <h4 className="font-medium mb-1">{faq.q}</h4>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
