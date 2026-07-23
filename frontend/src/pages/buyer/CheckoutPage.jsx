import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Banknote, CreditCard } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { buyerOrderApi } from "@/lib/api/buyerOrderApi";
import { buyerApi } from "@/lib/api/buyerApi";
import { extractErrorMessage } from "@/lib/apiClient";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

// Same-day isn't realistic - the farmer still has to accept the order first.
// Cap the window at 2 weeks out; fresh produce orders shouldn't be scheduled further than that.
const minDeliveryDate = toDateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000));
const maxDeliveryDate = toDateInputValue(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
export default function CheckoutPage() {
  const {
    items,
    farmerId,
    farmName,
    totalAmount,
    clearCart
  } = useCart();
  const {
    user
  } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isPaying, setIsPaying] = useState(false);
  const navigate = useNavigate();
  const {
    showToast
  } = useToast();
  const {
    data: profile
  } = useQuery({
    queryKey: ["buyer", "profile"],
    queryFn: buyerApi.getProfile
  });
  useEffect(() => {
    if (profile?.deliveryAddress) setDeliveryAddress(profile.deliveryAddress);
  }, [profile]);
  useEffect(() => {
    loadRazorpayScript().catch(() => {
      // Non-fatal - if the buyer picks "Pay Online" while offline, they'll get a clear error then.
    });
  }, []);
  const goToOrder = order => {
    clearCart();
    navigate(`/buyer/orders/${order.id}`);
  };
  const mutation = useMutation({
    mutationFn: () => buyerOrderApi.create({
      farmerId: farmerId,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity
      })),
      deliveryAddress,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
      notes: notes || undefined,
      paymentMethod
    }),
    onSuccess: order => {
      if (order.razorpayOrderId && order.razorpayKeyId) {
        showToast({
          variant: "success",
          title: "Order created",
          description: "Complete payment to confirm your order."
        });
        openPayment(order);
        return;
      }
      showToast({
        variant: "success",
        title: "Order placed!",
        description: `${order.orderNumber} sent to ${farmName}`
      });
      goToOrder(order);
    },
    onError: error => showToast({
      variant: "error",
      title: "Order failed",
      description: extractErrorMessage(error)
    })
  });
  const openPayment = order => {
    if (!order.razorpayOrderId || !order.razorpayKeyId) return;
    setIsPaying(true);
    try {
      openRazorpayCheckout({
        key: order.razorpayKeyId,
        order_id: order.razorpayOrderId,
        amount: Math.round(order.totalAmount * 100),
        currency: "INR",
        name: "FarmConnect",
        description: `Order ${order.orderNumber} - ${farmName}`,
        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: user?.phone ?? undefined
        },
        theme: {
          color: "#16a34a"
        },
        handler: response => {
          verifyMutation.mutate({
            orderId: order.id,
            response
          });
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            showToast({
              variant: "error",
              title: "Payment not completed",
              description: "Your order was saved - you can finish paying anytime from the order page."
            });
            goToOrder(order);
          }
        }
      });
    } catch {
      setIsPaying(false);
      showToast({
        variant: "error",
        title: "Couldn't open payment",
        description: "Please try Cash on Delivery instead."
      });
    }
  };
  const verifyMutation = useMutation({
    mutationFn: ({
      orderId,
      response
    }) => buyerOrderApi.verifyPayment(orderId, {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    }),
    onSuccess: order => {
      setIsPaying(false);
      showToast({
        variant: "success",
        title: "Payment successful!",
        description: `${order.orderNumber} is confirmed.`
      });
      goToOrder(order);
    },
    onError: error => {
      setIsPaying(false);
      showToast({
        variant: "error",
        title: "Payment could not be verified",
        description: extractErrorMessage(error)
      });
    }
  });
  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate();
  };
  if (items.length === 0) {
    navigate("/buyer/cart");
    return null;
  }
  const isBusy = mutation.isPending || isPaying || verifyMutation.isPending;
  return <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate("/buyer/cart")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </button>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Checkout</h1>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Order Summary — {farmName}</h2>
        <div className="space-y-2 text-sm">
          {items.map(item => <div key={item.productId} className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>
                {item.name} &times; {item.quantity} {item.unit.toLowerCase()}
              </span>
              <span className="font-medium">₹{(item.pricePerUnit * item.quantity).toFixed(2)}</span>
            </div>)}
        </div>
        <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-white">
          <span>Total</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <MapPin className="h-4 w-4" /> Delivery Details
        </h2>
        <Textarea label="Delivery address" required value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Building, street, city..." />
        <Input label="Preferred delivery date (optional)" type="date" min={minDeliveryDate} max={maxDeliveryDate} hint="A request for the farmer, not a guarantee - they'll confirm once they accept your order." value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)} />
        <Textarea label="Order notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions for the farmer..." />

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Payment method</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setPaymentMethod("COD")} className={clsx("flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors", paymentMethod === "COD" ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "border-slate-200 text-slate-500 dark:border-slate-700")}>
              <Banknote className="h-4 w-4" /> Cash on Delivery
            </button>
            <button type="button" onClick={() => setPaymentMethod("RAZORPAY")} className={clsx("flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors", paymentMethod === "RAZORPAY" ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "border-slate-200 text-slate-500 dark:border-slate-700")}>
              <CreditCard className="h-4 w-4" /> Pay Online
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isBusy}>
          {paymentMethod === "RAZORPAY" ? "Continue to Payment" : "Place Order"} — ₹{totalAmount.toFixed(2)}
        </Button>
      </form>
    </div>;
}