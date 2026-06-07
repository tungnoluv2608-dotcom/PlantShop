import type { ProductDetail, ProductPayload } from "@/types"
import type { ProductFormValues } from "./schema"
import { PRODUCT_FORM_DEFAULTS } from "./schema"

/** Form values → API payload (POST/PUT share the same body). */
export function toProductPayload(values: ProductFormValues): ProductPayload {
  return {
    title: values.title,
    price: values.price,
    originalPrice: values.originalPrice ?? null,
    discount: values.discount || null,
    description: values.description,
    imageUrl: values.imageUrl,
    categoryId: values.categoryId,
    bio: values.bio || null,
    inStock: values.inStock,
    images: values.images,
    careGuide: values.careGuide,
    planterOptions: values.planterOptions.map((id) =>
      /^\d+$/.test(id) ? Number(id) : id
    ),
  }
}

/** Full product detail → form values for the edit screen. */
export function toProductFormValues(
  product: ProductDetail,
  categoryId: string
): ProductFormValues {
  return {
    ...PRODUCT_FORM_DEFAULTS,
    title: product.title,
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    discount: product.discount ?? "",
    description: product.description,
    imageUrl: product.imageUrl,
    categoryId,
    bio: product.bio ?? "",
    inStock: product.inStock ?? true,
    images: product.images ?? [],
    careGuide: product.careGuide ?? [],
    planterOptions: (product.planterOptions ?? []).map((p) => String(p)),
  }
}
