import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { adminApi } from "@/lib/api/adminApi";
import { extractErrorMessage } from "@/lib/apiClient";
export default function ProfilePage() {
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data: profile,
    isLoading
  } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: adminApi.getProfile
  });
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone ?? "");
    }
  }, [profile]);
  const mutation = useMutation({
    mutationFn: () => adminApi.updateProfile({
      fullName,
      phone
    }),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Profile updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "profile"]
      });
    },
    onError: error => showToast({
      variant: "error",
      title: "Update failed",
      description: extractErrorMessage(error)
    })
  });
  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate();
  };
  if (isLoading || !profile) {
    return <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>;
  }
  return <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
          {profile.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.fullName}</h1>
            <ShieldCheck className="h-5 w-5 text-brand-600" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <User className="h-4 w-4" /> Contact Details
        </h2>
        <Input label="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
        <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <Button type="submit" isLoading={mutation.isPending}>
          Save changes
        </Button>
      </form>
    </div>;
}