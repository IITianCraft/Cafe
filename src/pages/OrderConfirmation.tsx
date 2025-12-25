import { Link, useParams } from 'react-router-dom';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Download, MessageCircle } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { restaurant } = useRestaurant();

  const handleDownloadInvoice = () => {
    // Generate and download GST-ready invoice
    const invoiceContent = `
CAFE RESTO - TAX INVOICE
========================
GSTIN: 27AABCU9603R1ZM
Invoice No: INV-${orderId}
Date: ${new Date().toLocaleDateString('en-IN')}

Order ID: ${orderId}

Items:
------
(Order details would be populated from order data)

Subtotal: ₹XXX.XX
CGST (2.5%): ₹XX.XX
SGST (2.5%): ₹XX.XX
Total: ₹XXX.XX

Thank you for ordering from Cafe Resto!
========================
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <UserLayout>
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="text-center">
            <CardContent className="pt-8 pb-6">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
                <CheckCircle className="w-12 h-12 text-success" />
              </div>

              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Order Placed!
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your order. We've received it and will start preparing it soon.
              </p>

              {/* Order ID */}
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="text-xl font-mono font-bold text-foreground">{orderId}</p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                <span className="text-sm font-medium">Preparing your order</span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link to={`/${restaurant?.slug}/orders`} className="block">
                  <Button className="w-full" size="lg">
                    Track Order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDownloadInvoice}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Invoice
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a
                      href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi! I just placed order ${orderId}. Can you confirm?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </div>

                <Link to={`/${restaurant?.slug}/menu`} className="block">
                  <Button variant="ghost" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Time */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Estimated delivery time: <span className="font-semibold text-foreground">25-35 minutes</span>
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
