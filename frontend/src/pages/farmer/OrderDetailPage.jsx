import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2, Calendar, MapPin, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { orderApi } from "@/lib/api/orderApi";
import { extractErrorMessage } from "@/lib/apiClient";
export default function OrderDetailPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data: order,
    isLoading
  } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => orderApi.get(id),
    enabled: !!id
  });
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["orders"]
    });
  };
  const acceptMutation = useMutation({
    mutationFn: () => orderApi.accept(id),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Order accepted"
      });
      invalidate();
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const rejectMutation = useMutation({
    mutationFn: () => orderApi.reject(id),
    onSuccess: () => {
      showToast({
        variant: "info",
        title: "Order rejected"
      });
      invalidate();
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const readyMutation = useMutation({
    mutationFn: () => orderApi.markReadyForPickup(id),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Marked ready for pickup"
      });
      invalidate();
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  if (isLoading) {
    return <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>;
  }
  if (!order) return null;
  const BuyerIcon = order.buyerType === "RESTAURANT" ? UtensilsCrossed : Building2;
  const isMutating = acceptMutation.isPending || rejectMutation.isPending || readyMutation.isPending;
  return <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => navigate("/farmer/orders")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </button>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <BuyerIcon className="h-4 w-4" /> {order.buyerBusinessName}
            </p>
          </div>
          <p className="text-2xl font-extrabold text-brand-700 dark:text-brand-400">
            ₹{order.totalAmount.toFixed(2)}
          </p>
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

        {(order.status === "PENDING" || order.status === "ACCEPTED") && <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            {order.status === "PENDING" && <>
                <Button isLoading={acceptMutation.isPending} onClick={() => acceptMutation.mutate()}>
                  Accept Order
                </Button>
                <Button variant="outline" disabled={isMutating} onClick={() => rejectMutation.mutate()}>
                  Reject Order
                </Button>
              </>}
            {order.status === "ACCEPTED" && <Button isLoading={readyMutation.isPending} onClick={() => readyMutation.mutate()}>
                Mark Ready for Pickup
              </Button>}
          </div>}
      </div>
    </div>;
}