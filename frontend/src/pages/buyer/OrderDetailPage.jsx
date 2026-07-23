import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Calendar, Star, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { buyerOrderApi } from "@/lib/api/buyerOrderApi";
import { reviewApi } from "@/lib/api/reviewApi";
import { extractErrorMessage } from "@/lib/apiClient";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { clsx } from "clsx";
export default function OrderDetailPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    showToast
  } = useToast();
  const {
    user
  } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const {
    data: order,
    isLoading
  } = useQuery({
    queryKey: ["buyer", "orders", id],
    queryFn: () => buyerOrderApi.get(id),
    enabled: !!id
  });
  useEffect(() => {
    if (order?.razorpayOrderId) {
      loadRazorpayScript().catch(() => {});
    }
  }, [order?.razorpayOrderId]);
  const reviewMutation = useMutation({
    mutationFn: () => reviewApi.create({
      orderId: id,
      rating,
      comment: comment || undefined
    }),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Review submitted",
        description: "Thanks for your feedback!"
      });
      queryClient.invalidateQueries({
        queryKey: ["buyer", "orders", id]
      });
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const verifyMutation = useMutation({
    mutationFn: response => buyerOrderApi.verifyPayment(id, {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    }),
    onSuccess: () => {
      setIsPaying(false);
      showToast({
        variant: "success",
        title: "Payment successful!"
      });
      queryClient.invalidateQueries({
        queryKey: ["buyer", "orders", id]
      });
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
  const handlePayNow = () => {
    if (!order?.razorpayOrderId || !order.razorpayKeyId) return;
    setIsPaying(true);
    try {
      openRazorpayCheckout({
        key: order.razorpayKeyId,
        order_id: order.razorpayOrderId,
        amount: Math.round(order.totalAmount * 100),
        currency: "INR",
        name: "FarmConnect",
        description: `Order ${order.orderNumber}`,
        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: user?.phone ?? undefined
        },
        theme: {
          color: "#16a34a"
        },
        handler: response => verifyMutation.mutate(response),
        modal: {
          ondismiss: () => setIsPaying(false)
        }
      });
    } catch {
      setIsPaying(false);
      showToast({
        variant: "error",
        title: "Couldn't open payment",
        description: "Please try again shortly."
      });
    }
  };
  const handleReviewSubmit = e => {
    e.preventDefault();
    reviewMutation.mutate();
  };
  if (isLoading) {
    return <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>;
  }
  if (!order) return null;
  return <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => navigate("/buyer/orders")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </button>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              From {order.farmName}{order.farmCity ? `, ${order.farmCity}` : ""}
            </p>
          </div>
          <p className="text-2xl font-extrabold text-brand-700 dark:text-brand-400">₹{order.totalAmount.toFixed(2)}</p>
        </div>

        <div className="mt-5 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-2 dark:border-slate-800">
          {order.deliveryAddress && <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Delivery address</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">{order.deliveryAddress}</p>
              </div>
            </div>}
          {order.expectedDeliveryDate && <div className="flex items-start gap-2.5">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Expected delivery</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">{order.expectedDeliveryDate}</p>
              </div>
            </div>}
        </div>

        {order.razorpayOrderId && <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Payment pending</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                  Complete your online payment to confirm this order
                </p>
              </div>
            </div>
            <Button size="sm" isLoading={isPaying || verifyMutation.isPending} onClick={handlePayNow}>
              Pay ₹{order.totalAmount.toFixed(2)}
            </Button>
          </div>}

        {order.deliveryOtp && <div className="mt-4 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <div>
                <p className="text-xs font-medium text-brand-700 dark:text-brand-400">Delivery OTP</p>
                <p className="text-xs text-brand-600/80 dark:text-brand-400/80">Share this with your delivery partner on drop-off</p>
              </div>
            </div>
            <p className="text-2xl font-extrabold tracking-widest text-brand-700 dark:text-brand-400">{order.deliveryOtp}</p>
          </div>}

        {order.notes && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <strong>Notes:</strong> {order.notes}
          </p>}

        <h2 className="mt-6 mb-3 text-sm font-semibold text-slate-900 dark:text-white">Order items</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Qty</th>
                <th className="px-4 py-2.5 font-medium">Price</th>
                <th className="px-4 py-2.5 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map(item => <tr key={item.productId}>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.productName}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {item.quantity} {item.unit.toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">₹{item.pricePerUnitAtOrder.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                    ₹{item.subtotal.toFixed(2)}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {order.status === "DELIVERED" && !order.reviewed && <form onSubmit={handleReviewSubmit} className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Leave a review for {order.farmName}</h2>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setRating(star)}>
                <Star className={clsx("h-7 w-7 transition-colors", star <= rating ? "fill-sunrise-500 text-sunrise-500" : "text-slate-300 dark:text-slate-700")} />
              </button>)}
          </div>
          <Textarea placeholder="How was your experience?" value={comment} onChange={e => setComment(e.target.value)} />
          <Button type="submit" isLoading={reviewMutation.isPending}>
            Submit Review
          </Button>
        </form>}

      {order.reviewed && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          You've already reviewed this order. Thanks for your feedback!
        </div>}
    </div>;
}