import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BuyerDashboardLayout } from "@/components/layout/BuyerDashboardLayout";
import { DeliveryDashboardLayout } from "@/components/layout/DeliveryDashboardLayout";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const OAuthCallbackPage = lazy(() => import("@/pages/auth/OAuthCallbackPage"));
const SelectRolePage = lazy(() => import("@/pages/auth/SelectRolePage"));
const CompleteProfilePage = lazy(() => import("@/pages/auth/CompleteProfilePage"));
const FarmerDashboardPage = lazy(() => import("@/pages/farmer/DashboardPage"));
const FarmerProductsPage = lazy(() => import("@/pages/farmer/ProductsPage"));
const FarmerProductFormPage = lazy(() => import("@/pages/farmer/ProductFormPage"));
const FarmerOrdersPage = lazy(() => import("@/pages/farmer/OrdersPage"));
const FarmerOrderDetailPage = lazy(() => import("@/pages/farmer/OrderDetailPage"));
const FarmerAnalyticsPage = lazy(() => import("@/pages/farmer/AnalyticsPage"));
const FarmerNotificationsPage = lazy(() => import("@/pages/farmer/NotificationsPage"));
const FarmerProfilePage = lazy(() => import("@/pages/farmer/ProfilePage"));
const DemandPredictionPage = lazy(() => import("@/pages/farmer/ai/DemandPredictionPage"));
const CropRecommendationPage = lazy(() => import("@/pages/farmer/ai/CropRecommendationPage"));
const PricePredictionPage = lazy(() => import("@/pages/farmer/ai/PricePredictionPage"));
const DiseaseDetectionPage = lazy(() => import("@/pages/farmer/ai/DiseaseDetectionPage"));
const WeatherAlertsPage = lazy(() => import("@/pages/farmer/ai/WeatherAlertsPage"));
const BuyerDashboardPage = lazy(() => import("@/pages/buyer/DashboardPage"));
const BrowseProductsPage = lazy(() => import("@/pages/buyer/BrowseProductsPage"));
const ProductDetailPage = lazy(() => import("@/pages/buyer/ProductDetailPage"));
const FarmersPage = lazy(() => import("@/pages/buyer/FarmersPage"));
const CartPage = lazy(() => import("@/pages/buyer/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/buyer/CheckoutPage"));
const BuyerOrdersPage = lazy(() => import("@/pages/buyer/OrdersPage"));
const BuyerOrderDetailPage = lazy(() => import("@/pages/buyer/OrderDetailPage"));
const FavoritesPage = lazy(() => import("@/pages/buyer/FavoritesPage"));
const BuyerProfilePage = lazy(() => import("@/pages/buyer/ProfilePage"));
const DeliveryDashboardPage = lazy(() => import("@/pages/delivery/DashboardPage"));
const AvailablePickupsPage = lazy(() => import("@/pages/delivery/AvailablePickupsPage"));
const MyDeliveriesPage = lazy(() => import("@/pages/delivery/MyDeliveriesPage"));
const DeliveryDetailPage = lazy(() => import("@/pages/delivery/DeliveryDetailPage"));
const DeliveryHistoryPage = lazy(() => import("@/pages/delivery/HistoryPage"));
const DeliveryEarningsPage = lazy(() => import("@/pages/delivery/EarningsPage"));
const DeliveryProfilePage = lazy(() => import("@/pages/delivery/ProfilePage"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const AdminFarmersPage = lazy(() => import("@/pages/admin/FarmersPage"));
const AdminBuyersPage = lazy(() => import("@/pages/admin/BuyersPage"));
const AdminProductsPage = lazy(() => import("@/pages/admin/ProductsPage"));
const AdminDeliveryPartnersPage = lazy(() => import("@/pages/admin/DeliveryPartnersPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/OrdersPage"));
const AdminDeliveriesPage = lazy(() => import("@/pages/admin/DeliveriesPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));
const AdminProfilePage = lazy(() => import("@/pages/admin/ProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
function PageLoader() {
  return <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
    </div>;
}
export function AppRouter() {
  return <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/onboarding/select-role" element={<SelectRolePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding/complete-profile" element={<CompleteProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="ROLE_FARMER" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/farmer/dashboard" element={<FarmerDashboardPage />} />
            <Route path="/farmer/products" element={<FarmerProductsPage />} />
            <Route path="/farmer/products/new" element={<FarmerProductFormPage />} />
            <Route path="/farmer/products/:id/edit" element={<FarmerProductFormPage />} />
            <Route path="/farmer/orders" element={<FarmerOrdersPage />} />
            <Route path="/farmer/orders/:id" element={<FarmerOrderDetailPage />} />
            <Route path="/farmer/analytics" element={<FarmerAnalyticsPage />} />
            <Route path="/farmer/notifications" element={<FarmerNotificationsPage />} />
            <Route path="/farmer/profile" element={<FarmerProfilePage />} />
            <Route path="/farmer/ai/demand" element={<DemandPredictionPage />} />
            <Route path="/farmer/ai/crop-recommendation" element={<CropRecommendationPage />} />
            <Route path="/farmer/ai/price-prediction" element={<PricePredictionPage />} />
            <Route path="/farmer/ai/disease-detection" element={<DiseaseDetectionPage />} />
            <Route path="/farmer/ai/weather" element={<WeatherAlertsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="ROLE_BUYER" />}>
          <Route element={<BuyerDashboardLayout />}>
            <Route path="/buyer/dashboard" element={<BuyerDashboardPage />} />
            <Route path="/buyer/browse" element={<BrowseProductsPage />} />
            <Route path="/buyer/products/:id" element={<ProductDetailPage />} />
            <Route path="/buyer/farmers" element={<FarmersPage />} />
            <Route path="/buyer/cart" element={<CartPage />} />
            <Route path="/buyer/checkout" element={<CheckoutPage />} />
            <Route path="/buyer/orders" element={<BuyerOrdersPage />} />
            <Route path="/buyer/orders/:id" element={<BuyerOrderDetailPage />} />
            <Route path="/buyer/favorites" element={<FavoritesPage />} />
            <Route path="/buyer/notifications" element={<FarmerNotificationsPage />} />
            <Route path="/buyer/profile" element={<BuyerProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="ROLE_DELIVERY" />}>
          <Route element={<DeliveryDashboardLayout />}>
            <Route path="/delivery/dashboard" element={<DeliveryDashboardPage />} />
            <Route path="/delivery/available" element={<AvailablePickupsPage />} />
            <Route path="/delivery/active" element={<MyDeliveriesPage />} />
            <Route path="/delivery/:id" element={<DeliveryDetailPage />} />
            <Route path="/delivery/history" element={<DeliveryHistoryPage />} />
            <Route path="/delivery/earnings" element={<DeliveryEarningsPage />} />
            <Route path="/delivery/notifications" element={<FarmerNotificationsPage />} />
            <Route path="/delivery/profile" element={<DeliveryProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
          <Route element={<AdminDashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/farmers" element={<AdminFarmersPage />} />
            <Route path="/admin/delivery-partners" element={<AdminDeliveryPartnersPage />} />
            <Route path="/admin/buyers" element={<AdminBuyersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/deliveries" element={<AdminDeliveriesPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/notifications" element={<FarmerNotificationsPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>;
}