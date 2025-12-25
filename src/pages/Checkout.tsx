import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserLayout } from '@/components/layout/UserLayout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  MapPin,
  CreditCard,
  Wallet,
  Banknote,
  Loader2,
  ShoppingBag,
  Shield
} from 'lucide-react';
import { OrderType } from '@/types';
import { orderApi } from '@/services/api';
import { useRestaurant } from '@/context/RestaurantContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { restaurant } = useRestaurant();
  const tableFromQR = searchParams.get('table');

  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [orderType, setOrderType] = useState<OrderType>(tableFromQR ? 'dine-in' : 'delivery');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Address fields
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
  });

  // Table number for dine-in
  const [tableNumber, setTableNumber] = useState(tableFromQR || '');
  const [notes, setNotes] = useState('');

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  if (cart.items.length === 0) {
    return (
      <UserLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some delicious items to proceed</p>
          <Button onClick={() => navigate(`/${restaurant?.slug || ''}/menu`)}>Browse Menu</Button>
        </div>
      </UserLayout>
    );
  }

  const finalTotal = orderType === 'delivery' ? cart.total : cart.total - cart.deliveryCharge;



  const handleCreateOrder = async (payStatus: 'paid' | 'pending', txnId?: string) => {
    if (!restaurant?.id) {
      toast({ title: "Error", description: "Restaurant not found", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        restaurantId: restaurant.id,
        items: cart.items,
        total: finalTotal,
        subtotal: cart.subtotal,
        tax: cart.tax,
        deliveryCharge: cart.deliveryCharge,
        discount: cart.discount,
        orderType,
        paymentMethod,
        paymentStatus: payStatus,
        deliveryAddress: orderType === 'delivery' ? address : undefined,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        notes,
        // Backend should handle user info from token, but passing basic info if needed
        userName: user?.name || 'Guest',
        userEmail: user?.email,
        userPhone: user?.phone,
        transactionId: txnId
      };

      const res = await orderApi.create(payload);
      const orderId = res.data.data.id || res.data.data._id; // Handle backend response

      clearCart();
      toast({
        title: "Order placed successfully!",
        description: `Order ID: ${orderId}`,
      });
      navigate(`/${restaurant.slug}/order-confirmation/${orderId}`);
    } catch (error) {
      console.error("Order creation failed", error);
      toast({ title: "Order failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRazorpayPayment = () => {
    if (!razorpayLoaded) {
      toast({
        title: "Payment loading",
        description: "Please wait while payment gateway loads...",
      });
      return;
    }

    const options = {
      key: 'rzp_test_RuyRlv3f0niWS0', // User provided test key
      amount: Math.round(finalTotal * 100),
      currency: 'INR',
      name: restaurant?.name || 'Cafe Resto',
      description: `Order for ${cart.items.length} items`,
      image: '/placeholder.svg',
      handler: function (response: any) {
        handleCreateOrder('paid', response.razorpay_payment_id);
      },
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      notes: {
        order_type: orderType,
        restaurant_id: restaurant?.id
      },
      theme: { color: '#f97316' },
      modal: {
        ondismiss: function () {
          setIsLoading(false);
          toast({ title: "Payment Cancelled", description: "Try again when ready.", variant: "destructive" });
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (orderType === 'delivery' && (!address.street || !address.city || !address.pincode)) {
      toast({ title: "Address required", description: "Please fill in your delivery address", variant: "destructive" });
      return;
    }

    if (orderType === 'dine-in' && !tableNumber) {
      toast({ title: "Table number required", description: "Please enter your table number", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      // Cash on delivery
      await handleCreateOrder('pending');
    }
  };

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  return (
    <UserLayout>
      <div className="bg-muted/30 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={orderType}
                    onValueChange={(v) => setOrderType(v as OrderType)}
                    className="grid grid-cols-3 gap-4"
                  >
                    {[
                      { value: 'delivery', label: 'Delivery', icon: '🚚' },
                      { value: 'takeaway', label: 'Takeaway', icon: '🥡' },
                      { value: 'dine-in', label: 'Dine In', icon: '🍽️' },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${orderType === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <span className="text-2xl">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              {orderType === 'delivery' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Textarea
                          id="street"
                          placeholder="House/Flat No., Building, Street"
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="City"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input
                          id="pincode"
                          placeholder="PIN Code"
                          value={address.pincode}
                          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="landmark">Landmark (Optional)</Label>
                        <Input
                          id="landmark"
                          placeholder="Nearby landmark"
                          value={address.landmark}
                          onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Table Number for Dine-in */}
              {orderType === 'dine-in' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Table Number</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Enter your table number (e.g., T-05)"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      disabled={!!tableFromQR}
                    />
                    {tableFromQR && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Table detected from QR code
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <Label
                      htmlFor="pay-razorpay"
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === 'razorpay'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <RadioGroupItem value="razorpay" id="pay-razorpay" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Pay with Razorpay</p>
                          <p className="text-sm text-muted-foreground">UPI, Cards, NetBanking, Wallets</p>
                        </div>
                      </div>
                    </Label>

                    <Label
                      htmlFor="pay-cod"
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === 'cod'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <RadioGroupItem value="cod" id="pay-cod" />
                      <Banknote className="w-6 h-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Cash on Delivery/Counter</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive</p>
                      </div>
                    </Label>
                  </RadioGroup>

                  {paymentMethod === 'razorpay' && (
                    <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure payment powered by Razorpay (Demo Mode)</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special instructions for your order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.foodItem.name} x{item.quantity}
                        </span>
                        <span>{formatPrice(item.foodItem.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(cart.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (5%)</span>
                      <span>{formatPrice(cart.tax)}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery</span>
                        <span>{cart.deliveryCharge === 0 ? 'Free' : formatPrice(cart.deliveryCharge)}</span>
                      </div>
                    )}
                    {cart.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(cart.discount)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : paymentMethod === 'razorpay' ? (
                      `Pay Now • ${formatPrice(finalTotal)}`
                    ) : (
                      `Place Order • ${formatPrice(finalTotal)}`
                    )}
                  </Button>

                  {tableNumber && (
                    <p className="text-xs text-center text-muted-foreground">
                      Order will be served at Table {tableNumber}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}