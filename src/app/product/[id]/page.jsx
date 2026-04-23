import { apiGet } from "../../../lib/api";
import ProductDetailsClient from "../../../components/ProductDetailsClient";

export default async function ProductDetailsPage({ params }) {
  const product = await apiGet(`/catalog/products/${params.id}`).catch(() => null);

  if (!product) {
    return <div className="card p-6">Product not found.</div>;
  }

  return <ProductDetailsClient product={product} />;
}
