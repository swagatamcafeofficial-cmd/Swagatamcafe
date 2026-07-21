'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerLayout } from '@/components/layout/customer-layout';
import { useCart } from '@/lib/context/cart-context';
import { getDeliveryAreasAction } from '@/lib/actions/checkout';
import { createOrderAction } from '@/lib/actions/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  Tag, 
  ShoppingBag, 
  Smartphone, 
  Banknote,
  QrCode,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  User
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export function CartClient() {
  const router = useRouter();
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    deliveryArea, 
    setDeliveryAreaName, 
    deliveryCharge, 
    couponCode, 
    couponDiscount, 
    applyCouponCode, 
    removeCouponCode,
    summary,
    clearCart
  } = useCart();

  const [deliveryAreas, setDeliveryAreas] = useState<any[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  // Checkout Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [upiTxnId, setUpiTxnId] = useState('');

  useEffect(() => {
    // Load delivery areas
    getDeliveryAreasAction().then(res => {
      if (res.success && res.deliveryAreas) {
        setDeliveryAreas(res.deliveryAreas);
      }
    });

    // Populate user profile details if logged in
    import('@/lib/actions/auth').then(({ getCurrentUserAction }) => {
      getCurrentUserAction().then(user => {
        if (user && user.role === 'customer') {
          setIsLoggedIn(true);
          setName(user.name);
          setPhone(user.phone);
          if (user.addresses && user.addresses.length > 0) {
            const defAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
            setAddress(defAddr.address);
            setLandmark(defAddr.landmark || '');
            if (defAddr.village) {
              setDeliveryAreaName(defAddr.village);
            }
          }
        } else {
          setIsLoggedIn(false);
        }
      });
    });
  }, [setDeliveryAreaName]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = await applyCouponCode(couponInput);
    if (success) setCouponInput('');
  };

  const handlePlaceOrder = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!phone.match(/^[6-9]\d{9}$/)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (!deliveryArea) {
      toast.error('Please select a delivery area');
      return;
    }
    if (!address.trim() || address.length < 5) {
      toast.error('Please enter a specific delivery address (min 5 chars)');
      return;
    }
    if (paymentMethod === 'upi' && !upiTxnId.trim()) {
      toast.error('Please enter the UPI Transaction ID / Ref No.');
      return;
    }

    setLoading(true);
    toast.loading('Placing your order...', { id: 'place-order' });

    try {
      const orderFormData = {
        name,
        phone,
        village: deliveryArea,
        address,
        landmark: landmark.trim() || undefined,
        notes: notes.trim() || undefined,
        paymentMethod,
        upiTransactionId: paymentMethod === 'upi' ? upiTxnId : undefined,
      };

      // Cart items formatted for checkout validation
      const cartItemsData = items.map(item => ({
        product: item.product,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        isVeg: item.isVeg,
      }));

      const res = await createOrderAction(orderFormData as any, cartItemsData, couponCode || undefined);
      
      if (res.success && res.id) {
        toast.success('Order placed successfully!', { id: 'place-order' });
        clearCart();
        router.push(`/order/${res.id}`);
      } else {
        toast.error(res.error || 'Failed to place order', { id: 'place-order' });
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred', { id: 'place-order' });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <CustomerLayout>
        <section className="flex-grow flex flex-col items-center justify-center py-20 px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight mb-2">Your Cart is Empty</h1>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Looks like you haven&apos;t added anything to your cart yet. Head over to our menu and explore tasty bites!
            </p>
            <Button asChild className="rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Link href="/menu">Browse Menu</Link>
            </Button>
          </div>
        </section>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <section className="bg-[#FCFBF9] border-b border-stone-200/60 py-10">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="font-heading text-3xl font-bold text-stone-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-amber-700" />
            Your Shopping Cart
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Cart items list + Checkout details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cart Items Card */}
            <Card className="rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm bg-white">
              <CardContent className="p-6 divide-y divide-stone-100">
                {items.map((item) => (
                  <div key={item.product} className="flex items-center gap-3 sm:gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {item.isVeg ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-600 shrink-0" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-650 shrink-0" />
                        )}
                        <h3 className="font-semibold text-stone-900 text-sm truncate">{item.name}</h3>
                      </div>
                      <p className="text-xs text-stone-500 font-medium">₹{item.price} each</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-7 h-7 rounded-lg border-stone-200 hover:bg-stone-50 cursor-pointer"
                          onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3 text-stone-600" />
                        </Button>
                        <span className="text-xs font-semibold w-6 text-center text-stone-850">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-7 h-7 rounded-lg border-stone-200 hover:bg-stone-50 cursor-pointer"
                          onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3 text-stone-600" />
                        </Button>
                      </div>
                      
                    </div>

                    <div className="flex flex-col items-end gap-3 justify-between self-stretch">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-stone-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg cursor-pointer"
                        onClick={() => removeFromCart(item.product)}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                      <span className="text-sm font-bold text-stone-900">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Delivery & Address Form */}
            {isLoggedIn === null ? (
              <Card className="rounded-2xl border border-stone-200/80 shadow-sm bg-white">
                <CardContent className="p-12 flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-stone-900" />
                  <p className="text-xs text-stone-500 font-semibold">Verifying your login status...</p>
                </CardContent>
              </Card>
            ) : !isLoggedIn ? (
              <Card className="rounded-2xl border border-[#FFA544]/20 shadow-sm bg-[#FCFBF9] overflow-hidden">
                <div className="bg-[#FFA544]/5 p-6 border-b border-[#FFA544]/10 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-stone-900">Sign In to Order</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    You must be logged in as a customer to place an order.
                  </p>
                </div>
                <CardContent className="p-6 text-center space-y-4">
                  <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                    Register or log in to manage your orders, save delivery locations, and complete checkout.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button asChild className="rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold h-11 px-6 cursor-pointer">
                      <Link href="/login?from=/cart">Login / Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-50 h-11 px-6 cursor-pointer">
                      <Link href="/login?from=/cart&mode=register">Create Account</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl border border-stone-200/80 shadow-sm bg-white">
                <CardContent className="p-6 space-y-5">
                  <h2 className="font-heading text-lg font-bold flex items-center gap-2 border-b border-stone-100 pb-3 text-stone-900">
                    <MapPin className="w-5 h-5 text-amber-700" />
                    Delivery & Contact Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase">Recipient Name</label>
                      <Input 
                        placeholder="Enter full name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border-stone-200 bg-stone-50/50 focus-visible:ring-stone-950 text-stone-850"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase">Contact Number</label>
                      <Input 
                        placeholder="10-digit mobile number" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl border-stone-200 bg-stone-50/50 focus-visible:ring-stone-950 text-stone-850"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Delivery Area Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase">Delivery Area (Chichli)</label>
                      <select 
                        value={deliveryArea || ''}
                        onChange={(e) => setDeliveryAreaName(e.target.value || null)}
                        className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                      >
                        <option value="">Select your area...</option>
                        {deliveryAreas.map((da) => (
                          <option key={da._id} value={da.village}>
                            {da.village} (₹{da.deliveryCharge} delivery)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Landmark */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase">Landmark (Optional)</label>
                      <Input 
                        placeholder="e.g. Near Bus Stand" 
                        value={landmark} 
                        onChange={(e) => setLandmark(e.target.value)}
                        className="rounded-xl border-stone-200 bg-stone-50/50 focus-visible:ring-stone-950 text-stone-850"
                      />
                    </div>
                  </div>

                  {/* Specific Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase">Specific Address</label>
                    <Textarea 
                      placeholder="House No, Building, Street, Ward No." 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      className="rounded-xl border-stone-200 bg-stone-50/50 focus-visible:ring-stone-950 min-h-[80px] text-stone-850"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase">Delivery Instructions (Optional)</label>
                    <Input 
                      placeholder="e.g. Call before delivery, leave at gate" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-xl border-stone-200 bg-stone-50/50 focus-visible:ring-stone-950 text-stone-850"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3 pt-3 border-t border-stone-100">
                    <label className="text-xs font-bold text-stone-500 uppercase">Choose Payment Method</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* COD */}
                      <div 
                        onClick={() => setPaymentMethod('cod')}
                        className={`flex gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
                          paymentMethod === 'cod' 
                            ? 'border-stone-900 bg-stone-50/30' 
                            : 'border-stone-200 hover:bg-stone-50/50'
                        }`}
                      >
                        <Banknote className={`w-6 h-6 shrink-0 mt-0.5 ${paymentMethod === 'cod' ? 'text-stone-900' : 'text-stone-400'}`} />
                        <div>
                          <h4 className="font-bold text-sm text-stone-900">Cash on Delivery</h4>
                          <p className="text-xs text-stone-500 mt-1">Pay with cash when your food is delivered.</p>
                        </div>
                      </div>

                      {/* UPI */}
                      <div 
                        onClick={() => setPaymentMethod('upi')}
                        className={`flex gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
                          paymentMethod === 'upi' 
                            ? 'border-stone-900 bg-stone-50/30' 
                            : 'border-stone-200 hover:bg-stone-50/50'
                        }`}
                      >
                        <Smartphone className={`w-6 h-6 shrink-0 mt-0.5 ${paymentMethod === 'upi' ? 'text-stone-900' : 'text-stone-400'}`} />
                        <div>
                          <h4 className="font-bold text-sm text-stone-900">Scan and Pay (UPI)</h4>
                          <p className="text-xs text-stone-500 mt-1">Pay instantly by scanning the QR code and enter transaction ID.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* UPI scan information */}
                  {paymentMethod === 'upi' && (
                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Paytm QR Scanner */}
                        <div className="relative w-40 h-64 bg-white rounded-2xl p-1 shrink-0 flex items-center justify-center border border-stone-200 overflow-hidden shadow-sm">
                          <Image 
                            src="/images/paytm-qr.jpg" 
                            alt="Paytm QR Scanner - Praveen Kumar Kourav" 
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="space-y-2.5 text-center sm:text-left text-stone-650">
                          <h4 className="font-bold text-sm text-stone-900">Scan to Pay with Any UPI App</h4>
                          <p className="text-xs text-stone-500">Scan this QR code using Paytm, Google Pay, PhonePe, or BHIM to pay the total amount.</p>
                          <div className="space-y-1.5 pt-1">
                            <p className="text-xs font-medium text-stone-700">Account: <span className="font-bold text-stone-900">Praveen Kumar Kourav</span></p>
                            <div className="inline-block bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-800 font-mono">
                              UPI ID: paytm.s1z7dbt@pty
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-stone-200">
                        <label className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Enter UPI Transaction ID / Ref No. (Required)
                        </label>
                        <Input 
                          placeholder="12-digit UTR / Ref Number" 
                          value={upiTxnId}
                          onChange={(e) => setUpiTxnId(e.target.value)}
                          className="rounded-xl border-stone-200 bg-white focus-visible:ring-stone-950 font-mono text-sm text-stone-850"
                        />
                        <p className="text-[10px] text-stone-400">Orders are confirmed upon verifying the payment ref number.</p>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column: Order summary card */}
          <div className="space-y-6">
            
            {/* Promo Code Card */}
            <Card className="rounded-2xl border border-stone-200/80 shadow-sm bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-sm mb-3 text-stone-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-700" />
                  Have a Promo Code?
                </h3>
                
                {couponCode ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
                    <div className="text-xs font-semibold">
                      <span className="font-bold">{couponCode}</span> applied! (Saved ₹{couponDiscount})
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={removeCouponCode}
                      className="text-green-700 hover:text-red-600 hover:bg-transparent h-auto p-0 font-semibold text-xs cursor-pointer"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input 
                      placeholder="e.g. SWAGATAM" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="rounded-xl border-stone-200 bg-stone-50/50 focus-visible:ring-stone-950 uppercase h-10 text-stone-850"
                    />
                    <Button type="submit" variant="outline" className="rounded-xl px-4 h-10 font-semibold border-stone-200 text-stone-700 hover:bg-stone-50 cursor-pointer">
                      Apply
                    </Button>
                  </form>
                )}
                <div className="text-[10px] text-stone-400 mt-2 leading-tight">
                  Try <span className="font-semibold text-amber-700">SWAGATAM</span> (15% off, min ₹199) or <span className="font-semibold text-amber-700">WELCOME50</span> (₹50 flat, min ₹299).
                </div>
              </CardContent>
            </Card>

            {/* Price breakdown */}
            <Card className="rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden bg-white">
              <div className="bg-[#FCFBF9] p-6 text-stone-900 border-b border-stone-150">
                <h3 className="font-heading font-bold text-base">Order Summary</h3>
              </div>
              <CardContent className="p-6 space-y-4">
                
                {/* Breakdown items */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Items Subtotal</span>
                    <span className="font-semibold text-stone-900">₹{summary.subtotal}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Promo Discount</span>
                      <span>-₹{summary.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-500">Delivery Charges</span>
                    <span className="font-semibold text-stone-900">
                      {deliveryArea 
                        ? (summary.deliveryCharge > 0 ? `₹${summary.deliveryCharge}` : 'FREE')
                        : <span className="text-xs text-amber-700">Select area above</span>
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">GST Tax (5%)</span>
                    <span className="font-semibold text-stone-900">₹{summary.tax}</span>
                  </div>
                </div>

                <hr className="border-stone-100" />

                {/* Net Total */}
                <div className="flex justify-between items-baseline py-1">
                  <span className="font-bold text-stone-800 text-base">Total Amount</span>
                  <span className="text-2xl font-black text-amber-700">₹{summary.total}</span>
                </div>

                {/* Place Order CTA */}
                {!isLoggedIn ? (
                  <Button 
                    asChild
                    className="w-full rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold h-12 shadow-sm border-0 mt-2 flex items-center justify-center gap-2 group transition-all cursor-pointer"
                  >
                    <Link href="/login?from=/cart">
                      Login to Place Order
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold h-12 shadow-sm border-0 mt-2 flex items-center justify-center gap-2 group transition-all cursor-pointer"
                  >
                    {loading ? 'Processing Order...' : 'Place Order'}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />}
                  </Button>
                )}

                <p className="text-[10px] text-stone-400 text-center leading-tight">
                  By clicking Place Order, you agree to buy these items. Payment verification for UPI takes 5-10 minutes.
                </p>

              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </CustomerLayout>
  );
}
