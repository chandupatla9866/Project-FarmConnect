import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, MapPin, Search, Sprout } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { LocationMap } from "@/components/ui/LocationMap";
import { buyerBrowseApi } from "@/lib/api/buyerBrowseApi";
export default function FarmersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["buyer", "farmers", {
      search,
      page
    }],
    queryFn: () => buyerBrowseApi.farmers({
      search: search || undefined,
      page,
      size: 9
    })
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nearby Farmers</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Discover the farms behind your food.
        </p>
      </div>

      <Input placeholder="Search by farm name or city..." value={search} onChange={e => {
      setSearch(e.target.value);
      setPage(0);
    }} />

      {isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({
        length: 6
      }).map((_, i) => <SkeletonCard key={i} />)}
        </div> : data && data.content.length > 0 ? <>
          <LocationMap height={320} zoom={11} markers={data.content.filter(f => f.farmLatitude != null && f.farmLongitude != null).map(f => ({
        lat: Number(f.farmLatitude),
        lng: Number(f.farmLongitude),
        title: f.farmName
      }))} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map(farmer => <button key={farmer.id} onClick={() => navigate(`/buyer/browse?farmerId=${farmer.id}`)} className="rounded-2xl border border-slate-200/70 bg-white p-5 text-left shadow-soft transition-shadow hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Sprout className="h-5 w-5" />
                  </div>
                  {farmer.verified && <span className="flex items-center gap-1 rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </span>}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{farmer.farmName}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3 w-3" /> {farmer.farmCity ?? "Location not set"}
                  {farmer.distanceKm != null && ` • ${farmer.distanceKm} km away`}
                </p>
                {farmer.primaryCropTypes && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{farmer.primaryCropTypes}</p>}
                <p className="mt-3 text-sm font-medium text-brand-700 dark:text-brand-400">
                  {farmer.activeProductCount} product{farmer.activeProductCount !== 1 ? "s" : ""} available
                </p>
              </button>)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={Search} title="No farmers found" description="Try a different search term." />}
    </div>;
}