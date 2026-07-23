import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Leaf } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { productApi } from "@/lib/api/productApi";
import { categoryApi } from "@/lib/api/categoryApi";
import { extractErrorMessage } from "@/lib/apiClient";
const UNITS = ["KG", "DOZEN", "LITRE", "PIECE", "QUINTAL"];
const EMPTY_FORM = {
  name: "",
  description: "",
  categoryId: "",
  unit: "KG",
  pricePerUnit: "",
  quantityAvailable: "",
  organic: false,
  harvestDate: ""
};
export default function ProductFormPage() {
  const {
    id
  } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const {
    data: categories
  } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list
  });
  const {
    data: existingProduct
  } = useQuery({
    queryKey: ["products", id],
    queryFn: () => productApi.get(id),
    enabled: isEdit
  });
  useEffect(() => {
    if (existingProduct) {
      setForm({
        name: existingProduct.name,
        description: existingProduct.description ?? "",
        categoryId: existingProduct.category.id,
        unit: existingProduct.unit,
        pricePerUnit: String(existingProduct.pricePerUnit),
        quantityAvailable: String(existingProduct.quantityAvailable),
        organic: existingProduct.organic,
        harvestDate: existingProduct.harvestDate ?? ""
      });
      setImagePreview(existingProduct.imageUrl);
    }
  }, [existingProduct]);
  const mutation = useMutation({
    mutationFn: () => isEdit ? productApi.update(id, form, imageFile) : productApi.create(form, imageFile),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: isEdit ? "Product updated" : "Product created"
      });
      queryClient.invalidateQueries({
        queryKey: ["products"]
      });
      navigate("/farmer/products");
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed to save product",
      description: extractErrorMessage(error)
    })
  });
  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate();
  };
  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  return <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => navigate("/farmer/products")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isEdit ? "Update your listing details." : "List a new fruit or vegetable for sale."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Product photo
          </label>
          <label className="flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800">
            {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-2 text-slate-400">
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">Click to upload an image</span>
              </div>}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <Input label="Product name" required value={form.name} onChange={e => setForm({
        ...form,
        name: e.target.value
      })} placeholder="Fresh Tomatoes" />

        <Textarea label="Description" value={form.description} onChange={e => setForm({
        ...form,
        description: e.target.value
      })} placeholder="Describe your produce - freshness, farming method, etc." />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Category" required value={form.categoryId} onChange={e => setForm({
          ...form,
          categoryId: e.target.value
        })}>
            <option value="" disabled>
              Select category
            </option>
            {categories?.map(c => <option key={c.id} value={c.id}>
                {c.iconUrl} {c.name}
              </option>)}
          </Select>

          <Select label="Unit" value={form.unit} onChange={e => setForm({
          ...form,
          unit: e.target.value
        })}>
            {UNITS.map(u => <option key={u} value={u}>
                {u}
              </option>)}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Price per unit (₹)" type="number" min="0" step="0.01" required value={form.pricePerUnit} onChange={e => setForm({
          ...form,
          pricePerUnit: e.target.value
        })} />
          <Input label="Quantity available" type="number" min="0" step="0.01" required value={form.quantityAvailable} onChange={e => setForm({
          ...form,
          quantityAvailable: e.target.value
        })} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Harvest date" type="date" value={form.harvestDate} onChange={e => setForm({
          ...form,
          harvestDate: e.target.value
        })} />
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={form.organic} onChange={e => setForm({
              ...form,
              organic: e.target.checked
            })} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <Leaf className="h-4 w-4 text-brand-600" /> Organically grown
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => navigate("/farmer/products")}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </div>;
}