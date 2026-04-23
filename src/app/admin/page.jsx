"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { apiPost } from "../../lib/api";
import heroBanner from "../../../Hero Banner.png";

const sectionClass = "rounded-2xl border border-[#eadfce] bg-[#fffdfa] p-5 shadow-[0_16px_34px_rgba(63,40,22,0.1)]";
const inputClass = "w-full rounded-xl border border-[#decfbb] bg-[#fffefb] px-3 py-2.5 text-sm outline-none transition focus:border-[#8a5a3b] focus:ring-2 focus:ring-[#8a5a3b]/15";
const sizeOptions = ["S", "M", "L", "XL", "XXL"];
const shoeSizeOptions = ["6", "7", "8", "9", "10", "11"];
const defaultProductTypeProfiles = {
  apparel: { label: "Apparel", sizes: sizeOptions },
  footwear: { label: "Footwear (Shoes)", sizes: shoeSizeOptions },
  eyewear: { label: "Eyewear (Spects)", sizes: [] },
  accessories: { label: "Accessories", sizes: [] }
};
const colorSuggestions = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Brown", "Beige", "Grey", "Navy"];
const catalogTabs = [
  { value: "dashboard", label: "Dashboard" },
  { value: "catalog", label: "Catalog" },
  { value: "banner", label: "Banner Studio" },
  { value: "edit", label: "Edit & Manage" }
];

function buildTypeAttributes(productForm) {
  if (productForm.productType === "footwear") {
    return {
      shoeType: productForm.shoeType || "",
      soleMaterial: productForm.soleMaterial || "",
      closureType: productForm.closureType || ""
    };
  }
  if (productForm.productType === "eyewear") {
    return {
      frameType: productForm.frameType || "",
      lensType: productForm.lensType || "",
      frameMaterial: productForm.frameMaterial || ""
    };
  }
  if (productForm.productType === "accessories") {
    return {
      accessoryType: productForm.accessoryType || "",
      material: productForm.material || ""
    };
  }
  return {
    fitType: productForm.fitType || "",
    fabricType: productForm.fabricType || ""
  };
}

export default function AdminPage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  const [token, setToken] = useState("");
  const [activeDashboard, setActiveDashboard] = useState("business");
  const [catalogTab, setCatalogTab] = useState("catalog");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [checkoutSettings, setCheckoutSettings] = useState({ deliveryChargeEnabled: false, deliveryChargeAmount: "0" });
  const [couponForm, setCouponForm] = useState({
    name: "",
    description: "",
    discountPercent: "10",
    startsAt: "",
    endsAt: "",
    active: true
  });
  const [message, setMessage] = useState("");
  const [brandForm, setBrandForm] = useState({ name: "", logo: "", description: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });
  const [bannerForm, setBannerForm] = useState({ image: "", title: "", subtitle: "", position: "top-slider", type: "carousel", order: 0, visible: true });
  const [bannerImages, setBannerImages] = useState([]);
  const [productTypeProfiles, setProductTypeProfiles] = useState(defaultProductTypeProfiles);
  const [productTypeEditor, setProductTypeEditor] = useState({ type: "apparel", label: "Apparel", sizesCsv: sizeOptions.join(",") });
  const [productDrafts, setProductDrafts] = useState({});
  const [brandDrafts, setBrandDrafts] = useState({});
  const [categoryDrafts, setCategoryDrafts] = useState({});
  const [bannerDrafts, setBannerDrafts] = useState({});
  const [productImages, setProductImages] = useState([]);
  const [colorImageFiles, setColorImageFiles] = useState({});
  const [productForm, setProductForm] = useState({
    name: "",
    productType: "apparel",
    price: "",
    discount: "",
    description: "",
    sizes: [],
    colors: [],
    colorInput: "",
    stockCount: "0",
    category: "",
    brand: "",
    tagsCsv: "",
    fitType: "",
    fabricType: "",
    shoeType: "",
    soleMaterial: "",
    closureType: "",
    frameType: "",
    lensType: "",
    frameMaterial: "",
    accessoryType: "",
    material: "",
    isFeatured: false,
    isTrending: false
  });

  const isLoggedIn = useMemo(() => token.length > 0, [token]);

  useEffect(() => {
    const savedToken = localStorage.getItem("ff_admin_token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadAdminData();
  }, [isLoggedIn, token]);

  useEffect(() => {
    const saved = localStorage.getItem("ff_product_type_profiles");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        setProductTypeProfiles((prev) => ({ ...prev, ...parsed }));
      }
    } catch (_error) {
      // Ignore invalid local saved profile config.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ff_product_type_profiles", JSON.stringify(productTypeProfiles));
  }, [productTypeProfiles]);

  async function fetchWithToken(path, jwt, method = "GET", body) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${jwt}`,
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store"
    });
    if (!response.ok) throw new Error("request failed");
    return response.json();
  }

  function toggleSize(size) {
    setProductForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((item) => item !== size) : [...prev.sizes, size]
    }));
  }

  function addColor(colorValue) {
    const color = colorValue.trim();
    if (!color) return;
    setProductForm((prev) => {
      if (prev.colors.some((existing) => existing.toLowerCase() === color.toLowerCase())) {
        return { ...prev, colorInput: "" };
      }
      return { ...prev, colors: [...prev.colors, color], colorInput: "" };
    });
  }

  function removeColor(colorToRemove) {
    setProductForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove)
    }));
    setColorImageFiles((prev) => {
      const next = { ...prev };
      delete next[colorToRemove];
      return next;
    });
  }

  function saveProductTypeProfile(e) {
    e.preventDefault();
    const nextLabel = productTypeEditor.label.trim() || defaultProductTypeProfiles[productTypeEditor.type]?.label || productTypeEditor.type;
    const nextSizes = productTypeEditor.sizesCsv
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    setProductTypeProfiles((prev) => ({
      ...prev,
      [productTypeEditor.type]: {
        label: nextLabel,
        sizes: nextSizes
      }
    }));
    setMessage("Product type settings updated.");
  }

  function upsertDraft(setter, id, patch) {
    setter((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...patch }
    }));
  }

  function getProductDraft(product) {
    return (
      productDrafts[product._id] || {
        name: product.name || "",
        price: String(product.price ?? ""),
        discount: String(product.discount ?? ""),
        stockCount: String(product.stockCount ?? ""),
        status: product.status || "active"
      }
    );
  }

  function getBrandDraft(brand) {
    return (
      brandDrafts[brand._id] || {
        name: brand.name || "",
        description: brand.description || ""
      }
    );
  }

  function getCategoryDraft(category) {
    return (
      categoryDrafts[category._id] || {
        name: category.name || "",
        slug: category.slug || ""
      }
    );
  }

  function getBannerDraft(banner) {
    return (
      bannerDrafts[banner._id] || {
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        position: banner.position || "top-slider",
        type: banner.type || "carousel",
        order: String(banner.order ?? 0),
        visible: Boolean(banner.visible)
      }
    );
  }

  async function handleBannerFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const dataUrls = await Promise.all(files.map((file) => fileToDataUrl(file)));
    setBannerImages(dataUrls);
    setBannerForm((prev) => ({ ...prev, image: dataUrls[0] || prev.image }));
  }

  async function loadAdminData() {
    try {
      const [dash, usersRes, ordersRes, brandsRes, categoriesRes, productsRes, bannersRes, promotionsRes, checkoutConfigRes] = await Promise.all([
        fetchWithToken("/admin/dashboard", token),
        fetchWithToken("/admin/users", token),
        fetchWithToken("/admin/orders", token),
        fetchWithToken("/admin/brands", token),
        fetchWithToken("/admin/categories", token),
        fetchWithToken("/admin/products", token),
        fetchWithToken("/admin/banners", token),
        fetchWithToken("/admin/promotions", token),
        fetchWithToken("/admin/checkout-config", token)
      ]);
      setDashboard(dash);
      setUsers(usersRes);
      setOrders(ordersRes);
      setBrands(brandsRes);
      setCategories(categoriesRes);
      setProducts(productsRes);
      setBanners(bannersRes);
      setPromotions(promotionsRes);
      setCheckoutSettings({
        deliveryChargeEnabled: Boolean(checkoutConfigRes?.deliveryChargeEnabled),
        deliveryChargeAmount: String(checkoutConfigRes?.deliveryChargeAmount ?? "0")
      });
    } catch (_error) {
      setMessage("Failed to load admin data.");
    }
  }

  function toList(csv) {
    return csv
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSingleFile(field, file) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    if (field === "brandLogo") {
      setBrandForm((prev) => ({ ...prev, logo: dataUrl }));
    }
    if (field === "bannerImage") {
      setBannerForm((prev) => ({ ...prev, image: dataUrl }));
    }
  }

  async function handleProductFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const dataUrls = await Promise.all(files.map((file) => fileToDataUrl(file)));
    setProductImages((prev) => [...prev, ...dataUrls]);
  }

  function removeProductImageAt(index) {
    setProductImages((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleColorImageFiles(color, fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const dataUrls = await Promise.all(files.map((file) => fileToDataUrl(file)));
    setColorImageFiles((prev) => ({ ...prev, [color]: dataUrls }));
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    try {
      const res = await apiPost("/auth/admin/login", credentials);
      localStorage.setItem("ff_admin_token", res.token);
      setToken(res.token);
      setMessage("Admin login successful.");
    } catch (_error) {
      setMessage("Invalid admin credentials.");
    }
  }

  async function toggleBan(userId, nextState) {
    try {
      await fetchWithToken(`/admin/users/${userId}/ban`, token, "PATCH", { isBanned: nextState });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isBanned: nextState } : u)));
    } catch (_error) {
      setMessage("Could not update user ban state.");
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      const updated = await fetchWithToken(`/admin/orders/${orderId}/status`, token, "PATCH", { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (_error) {
      setMessage("Order update failed.");
    }
  }

  async function toggleBannerVisibility(bannerId, nextVisible) {
    try {
      const updated = await fetchWithToken(`/admin/banners/${bannerId}`, token, "PUT", { visible: nextVisible });
      setBanners((prev) => prev.map((banner) => (banner._id === bannerId ? updated : banner)));
      setMessage(nextVisible ? "Banner display enabled." : "Banner display hidden.");
    } catch (_error) {
      setMessage("Failed to update banner display.");
    }
  }

  async function createBrand(e) {
    e.preventDefault();
    try {
      const created = await fetchWithToken("/admin/brands", token, "POST", { ...brandForm, status: "active" });
      setBrands((prev) => [created, ...prev]);
      setBrandForm({ name: "", logo: "", description: "" });
      setMessage("Brand added.");
    } catch (_error) {
      setMessage("Failed to add brand.");
    }
  }

  async function createCategory(e) {
    e.preventDefault();
    try {
      const created = await fetchWithToken("/admin/categories", token, "POST", { ...categoryForm, status: "active" });
      setCategories((prev) => [created, ...prev]);
      setCategoryForm({ name: "", slug: "" });
      setMessage("Category added.");
    } catch (_error) {
      setMessage("Failed to add category.");
    }
  }

  async function createBanner(e) {
    e.preventDefault();
    try {
      const imagesToCreate = bannerForm.type === "carousel" ? (bannerImages.length ? bannerImages : bannerForm.image ? [bannerForm.image] : []) : bannerForm.image ? [bannerForm.image] : [];
      if (!imagesToCreate.length) {
        setMessage("Please select at least one banner image.");
        return;
      }

      const createdBatch = await Promise.all(
        imagesToCreate.map((image, index) =>
          fetchWithToken("/admin/banners", token, "POST", {
        ...bannerForm,
            image,
            order: Number(bannerForm.order) + index,
        visible: bannerForm.visible
          })
        )
      );
      setBanners((prev) => [...prev, ...createdBatch].sort((a, b) => a.order - b.order));
      setBannerForm({ image: "", title: "", subtitle: "", position: "top-slider", type: "carousel", order: 0, visible: true });
      setBannerImages([]);
      setMessage("Banner added.");
    } catch (_error) {
      setMessage("Failed to add banner.");
    }
  }

  async function createProduct(e) {
    e.preventDefault();
    try {
      const created = await fetchWithToken("/admin/products", token, "POST", {
        name: productForm.name,
        productType: productForm.productType,
        images: productImages,
        price: Number(productForm.price),
        discount: Number(productForm.discount || 0),
        description: productForm.description,
        sizes: productForm.productType === "eyewear" || productForm.productType === "accessories" ? [] : productForm.sizes,
        colors: productForm.colors,
        typeAttributes: buildTypeAttributes(productForm),
        colorImageMap: productForm.colors.map((color) => ({
          color,
          images: colorImageFiles[color] || []
        })),
        stockCount: Number(productForm.stockCount || 0),
        category: productForm.category || undefined,
        brand: productForm.brand || undefined,
        tags: toList(productForm.tagsCsv),
        isFeatured: productForm.isFeatured,
        isTrending: productForm.isTrending,
        status: "active"
      });
      setProducts((prev) => [created, ...prev]);
      setProductForm({
        name: "",
        productType: "apparel",
        price: "",
        discount: "",
        description: "",
        sizes: [],
        colors: [],
        colorInput: "",
        stockCount: "0",
        category: "",
        brand: "",
        tagsCsv: "",
        fitType: "",
        fabricType: "",
        shoeType: "",
        soleMaterial: "",
        closureType: "",
        frameType: "",
        lensType: "",
        frameMaterial: "",
        accessoryType: "",
        material: "",
        isFeatured: false,
        isTrending: false
      });
      setProductImages([]);
      setColorImageFiles({});
      setMessage("Product added.");
    } catch (_error) {
      setMessage("Failed to add product.");
    }
  }

  async function saveCheckoutSettings(e) {
    e.preventDefault();
    try {
      const updated = await fetchWithToken("/admin/checkout-config", token, "PUT", {
        deliveryChargeEnabled: checkoutSettings.deliveryChargeEnabled,
        deliveryChargeAmount: Number(checkoutSettings.deliveryChargeAmount || 0)
      });
      setCheckoutSettings({
        deliveryChargeEnabled: Boolean(updated.deliveryChargeEnabled),
        deliveryChargeAmount: String(updated.deliveryChargeAmount ?? "0")
      });
      setMessage("Delivery charge settings updated.");
    } catch (_error) {
      setMessage("Failed to update delivery settings.");
    }
  }

  async function createCoupon(e) {
    e.preventDefault();
    if (!couponForm.name.trim() || !couponForm.startsAt || !couponForm.endsAt) {
      setMessage("Coupon code, start date and end date are required.");
      return;
    }
    try {
      const created = await fetchWithToken("/admin/promotions", token, "POST", {
        name: couponForm.name.trim().toUpperCase(),
        description: couponForm.description.trim(),
        discountPercent: Number(couponForm.discountPercent || 0),
        startsAt: new Date(couponForm.startsAt).toISOString(),
        endsAt: new Date(couponForm.endsAt).toISOString(),
        active: couponForm.active
      });
      setPromotions((prev) => [created, ...prev]);
      setCouponForm({
        name: "",
        description: "",
        discountPercent: "10",
        startsAt: "",
        endsAt: "",
        active: true
      });
      setMessage("Coupon added.");
    } catch (_error) {
      setMessage("Failed to create coupon.");
    }
  }

  async function toggleCouponActive(couponId, nextActive) {
    try {
      const updated = await fetchWithToken(`/admin/promotions/${couponId}`, token, "PUT", { active: nextActive });
      setPromotions((prev) => prev.map((coupon) => (coupon._id === couponId ? { ...coupon, ...updated } : coupon)));
      setMessage(nextActive ? "Coupon activated." : "Coupon deactivated.");
    } catch (_error) {
      setMessage("Failed to update coupon status.");
    }
  }

  async function saveProductEdit(productId) {
    const draft = productDrafts[productId];
    if (!draft) return;
    try {
      const updated = await fetchWithToken(`/admin/products/${productId}`, token, "PUT", {
        name: draft.name,
        price: Number(draft.price || 0),
        discount: Number(draft.discount || 0),
        stockCount: Number(draft.stockCount || 0),
        status: draft.status
      });
      setProducts((prev) => prev.map((item) => (item._id === productId ? { ...item, ...updated } : item)));
      setMessage("Product updated.");
    } catch (_error) {
      setMessage("Failed to update product.");
    }
  }

  async function deleteProduct(productId) {
    try {
      await fetchWithToken(`/admin/products/${productId}`, token, "DELETE");
      setProducts((prev) => prev.filter((item) => item._id !== productId));
      setMessage("Product deleted.");
    } catch (_error) {
      setMessage("Failed to delete product.");
    }
  }

  async function replaceProductImages(productId, fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    try {
      const images = await Promise.all(files.map((file) => fileToDataUrl(file)));
      const updated = await fetchWithToken(`/admin/products/${productId}`, token, "PUT", { images });
      setProducts((prev) => prev.map((item) => (item._id === productId ? { ...item, ...updated } : item)));
      setMessage("Product images replaced.");
    } catch (_error) {
      setMessage("Failed to replace product images.");
    }
  }

  async function saveBrandEdit(brandId) {
    const draft = brandDrafts[brandId];
    if (!draft) return;
    try {
      const updated = await fetchWithToken(`/admin/brands/${brandId}`, token, "PUT", {
        name: draft.name,
        description: draft.description
      });
      setBrands((prev) => prev.map((item) => (item._id === brandId ? { ...item, ...updated } : item)));
      setMessage("Brand updated.");
    } catch (_error) {
      setMessage("Failed to update brand.");
    }
  }

  async function deleteBrand(brandId) {
    try {
      await fetchWithToken(`/admin/brands/${brandId}`, token, "DELETE");
      setBrands((prev) => prev.filter((item) => item._id !== brandId));
      setMessage("Brand deleted.");
    } catch (_error) {
      setMessage("Failed to delete brand.");
    }
  }

  async function replaceBrandLogo(brandId, file) {
    if (!file) return;
    try {
      const logo = await fileToDataUrl(file);
      const updated = await fetchWithToken(`/admin/brands/${brandId}`, token, "PUT", { logo });
      setBrands((prev) => prev.map((item) => (item._id === brandId ? { ...item, ...updated } : item)));
      setMessage("Brand logo updated.");
    } catch (_error) {
      setMessage("Failed to replace brand logo.");
    }
  }

  async function saveCategoryEdit(categoryId) {
    const draft = categoryDrafts[categoryId];
    if (!draft) return;
    try {
      const updated = await fetchWithToken(`/admin/categories/${categoryId}`, token, "PUT", {
        name: draft.name,
        slug: draft.slug
      });
      setCategories((prev) => prev.map((item) => (item._id === categoryId ? { ...item, ...updated } : item)));
      setMessage("Category updated.");
    } catch (_error) {
      setMessage("Failed to update category.");
    }
  }

  async function deleteCategory(categoryId) {
    try {
      await fetchWithToken(`/admin/categories/${categoryId}`, token, "DELETE");
      setCategories((prev) => prev.filter((item) => item._id !== categoryId));
      setMessage("Category deleted.");
    } catch (_error) {
      setMessage("Failed to delete category.");
    }
  }

  async function saveBannerEdit(bannerId) {
    const draft = bannerDrafts[bannerId];
    if (!draft) return;
    try {
      const updated = await fetchWithToken(`/admin/banners/${bannerId}`, token, "PUT", {
        title: draft.title,
        subtitle: draft.subtitle,
        position: draft.position,
        type: draft.type,
        order: Number(draft.order || 0),
        visible: Boolean(draft.visible)
      });
      setBanners((prev) => prev.map((item) => (item._id === bannerId ? { ...item, ...updated } : item)));
      setMessage("Banner updated.");
    } catch (_error) {
      setMessage("Failed to update banner.");
    }
  }

  async function deleteBanner(bannerId) {
    try {
      await fetchWithToken(`/admin/banners/${bannerId}`, token, "DELETE");
      setBanners((prev) => prev.filter((item) => item._id !== bannerId));
      setMessage("Banner deleted.");
    } catch (_error) {
      setMessage("Failed to delete banner.");
    }
  }

  async function replaceBannerImage(bannerId, file) {
    if (!file) return;
    try {
      const image = await fileToDataUrl(file);
      const updated = await fetchWithToken(`/admin/banners/${bannerId}`, token, "PUT", { image });
      setBanners((prev) => prev.map((item) => (item._id === bannerId ? { ...item, ...updated } : item)));
      setMessage("Banner image updated.");
    } catch (_error) {
      setMessage("Failed to replace banner image.");
    }
  }

  if (!isLoggedIn) {
    return (
      <section className="myntra-container mx-auto max-w-xl py-12">
        <form className="rounded-xl border border-[#eadfce] bg-[#fffaf4] p-8 shadow-[0_12px_30px_rgba(63,40,22,0.1)]" onSubmit={handleAdminLogin}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a3b]">Admin Access</p>
          <h1 className="text-2xl font-bold text-[#1d2742]">FYDORA FORGE Control Center</h1>
          <p className="mb-5 mt-1 text-sm text-[#70809f]">Use your Admin or Super Admin credentials to manage the platform.</p>
          <input
            className={`${inputClass} mb-3`}
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
          />
          <button type="submit" className="mt-4 w-full rounded-lg bg-[#6d3d20] py-2.5 text-sm font-semibold text-white hover:bg-[#5a3219]">
            Sign In
          </button>
          {message && <p className="mt-3 text-sm text-[#da3d4c]">{message}</p>}
        </form>
      </section>
    );
  }

  const businessCards = [
    { title: "Total Users", value: dashboard?.totalUsers || 0, icon: "users", tone: "bg-[#eef3ff] text-[#4f7cff]" },
    { title: "Total Orders", value: dashboard?.totalOrders || 0, icon: "bag", tone: "bg-[#eefaf3] text-[#1ca678]" },
    { title: "Revenue", value: `Rs. ${Math.round(dashboard?.revenue || 0)}`, icon: "rupee", tone: "bg-[#fff7eb] text-[#f08c00]" },
    { title: "Active Products", value: dashboard?.activeProducts || 0, icon: "spark", tone: "bg-[#f4f0ff] text-[#7950f2]" }
  ];

  const catalogCards = [
    { title: "Brands", value: brands.length, icon: "brand", tone: "bg-[#f0f7ff] text-[#1971c2]" },
    { title: "Categories", value: categories.length, icon: "grid", tone: "bg-[#eefbf7] text-[#099268]" },
    { title: "Products", value: products.length, icon: "box", tone: "bg-[#fff6ef] text-[#e67700]" },
    { title: "Banners", value: banners.length, icon: "image", tone: "bg-[#f3f0ff] text-[#7048e8]" }
  ];

  const productTypeOptions = Object.entries(productTypeProfiles).map(([value, config]) => ({
    value,
    label: config?.label || value
  }));
  const selectedTypeConfig = productTypeProfiles[productForm.productType] || defaultProductTypeProfiles.apparel;
  const selectedSizeOptions = selectedTypeConfig?.sizes || [];
  const supportsSizeSelection = selectedSizeOptions.length > 0;
  const basePrice = Number(productForm.price || 0);
  const discountPercent = Math.min(100, Math.max(0, Number(productForm.discount || 0)));
  const discountAmount = (basePrice * discountPercent) / 100;
  const sellingPrice = Math.max(0, basePrice - discountAmount);

  return (
    <div className="myntra-container space-y-5 py-5 sm:space-y-6 sm:py-6">
      <section className="relative overflow-hidden rounded-3xl border border-[#e2d5c3] bg-[#24150d] shadow-[0_24px_52px_rgba(63,40,22,0.22)]">
        <Image src={heroBanner} alt="FYDORA FORGE admin hero banner" className="h-[220px] w-full object-cover object-[center_18%] sm:h-[280px]" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f120a]/60 via-[#2f1d12]/20 to-transparent" />
        <div className="absolute bottom-4 left-4 max-w-2xl text-white sm:bottom-6 sm:left-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f7e7d0]">Control Center</p>
          <h1 className="mt-1.5 text-2xl font-bold sm:mt-2 sm:text-3xl">FYDORA FORGE Admin Dashboard</h1>
          <p className="mt-1 text-xs text-[#f2e6d8] sm:text-sm">Manage operations, catalog, offers, and premium storefront experiences from one place.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#eadfce] bg-gradient-to-r from-[#fdf7ef] via-[#fbf2e7] to-[#f9ecdc] px-4 py-5 shadow-[0_18px_36px_rgba(63,40,22,0.12)] sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a3b]">AmenityForge</p>
            <h1 className="text-2xl font-bold text-[#2f241b]">Dual Admin Dashboards</h1>
            <p className="text-sm text-[#8d7966]">Switch between operations and content management dashboards.</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-[#e2d5c3] bg-[#fff8ef] p-1.5 shadow-[0_8px_18px_rgba(63,40,22,0.1)] sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveDashboard("business")}
              className={activeDashboard === "business" ? "flex-1 rounded-md bg-[#6d3d20] px-4 py-2 text-sm font-semibold text-white sm:flex-none" : "flex-1 rounded-md px-4 py-2 text-sm font-semibold text-[#6a5644] sm:flex-none"}
            >
              Business Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveDashboard("catalog")}
              className={activeDashboard === "catalog" ? "flex-1 rounded-md bg-[#6d3d20] px-4 py-2 text-sm font-semibold text-white sm:flex-none" : "flex-1 rounded-md px-4 py-2 text-sm font-semibold text-[#6a5644] sm:flex-none"}
            >
              Catalog Dashboard
            </button>
          </div>
        </div>
      </section>

      {message && <p className="rounded-xl border border-[#d9e0f7] bg-[#f7f9ff] px-4 py-2.5 text-sm font-medium text-[#334a7d]">{message}</p>}

      {activeDashboard === "business" ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            {businessCards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className={sectionClass}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1d2742]">User Governance</h2>
                <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold text-[#4f7cff]">{users.length} users</span>
              </div>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user._id} className="flex flex-col gap-2 rounded-lg border border-[#edf0f7] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#1d2742]">{user.name}</p>
                      <p className="text-xs text-[#70809f]">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBan(user._id, !user.isBanned)}
                      className={user.isBanned ? "w-full rounded-lg bg-[#1ca678] px-3 py-2 text-xs font-semibold text-white sm:w-auto" : "w-full rounded-lg border border-[#d4dcf0] px-3 py-2 text-xs font-semibold text-[#4b5d84] sm:w-auto"}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={sectionClass}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1d2742]">Order Operations</h2>
                <span className="rounded-full bg-[#ecfaf4] px-3 py-1 text-xs font-semibold text-[#1ca678]">{orders.length} orders</span>
              </div>
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order._id} className="flex flex-col gap-2 rounded-lg border border-[#edf0f7] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#1d2742]">{order.user?.name || "User"} - Rs. {Math.round(order.total)}</p>
                      <p className="text-xs text-[#70809f]">{order.status}</p>
                      {order.shippingAddress?.phone && <p className="text-xs text-[#70809f]">Phone: {order.shippingAddress.phone}</p>}
                      {order.shippingAddress?.line1 && (
                        <p className="text-xs text-[#70809f]">
                          Address: {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                        </p>
                      )}
                    </div>
                    <select className={`${inputClass} w-full sm:w-[170px]`} value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                      <option>Pending</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={saveCheckoutSettings} className={`${sectionClass} space-y-3`}>
              <h2 className="text-lg font-bold text-[#1d2742]">Delivery Charge Settings</h2>
              <label className="flex items-center gap-2 text-sm text-[#5b6f95]">
                <input
                  type="checkbox"
                  checked={checkoutSettings.deliveryChargeEnabled}
                  onChange={(e) => setCheckoutSettings((prev) => ({ ...prev, deliveryChargeEnabled: e.target.checked }))}
                />
                Apply delivery charge on checkout
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="1"
                placeholder="Delivery charge amount"
                value={checkoutSettings.deliveryChargeAmount}
                onChange={(e) => setCheckoutSettings((prev) => ({ ...prev, deliveryChargeAmount: e.target.value }))}
              />
              <button className="w-full rounded-lg bg-[#6d3d20] py-2.5 text-sm font-semibold text-white hover:bg-[#5a3219]" type="submit">
                Save Delivery Settings
              </button>
            </form>

            <form onSubmit={createCoupon} className={`${sectionClass} space-y-3`}>
              <h2 className="text-lg font-bold text-[#1d2742]">Add Coupon</h2>
              <input
                className={inputClass}
                placeholder="Coupon code (e.g. FESTIVE20)"
                value={couponForm.name}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <textarea
                className={inputClass}
                rows={2}
                placeholder="Coupon description"
                value={couponForm.description}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, description: e.target.value }))}
              />
              <input
                className={inputClass}
                type="number"
                min="1"
                max="100"
                placeholder="Discount %"
                value={couponForm.discountPercent}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, discountPercent: e.target.value }))}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={couponForm.startsAt}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, startsAt: e.target.value }))}
                />
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={couponForm.endsAt}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, endsAt: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#5b6f95]">
                <input
                  type="checkbox"
                  checked={couponForm.active}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, active: e.target.checked }))}
                />
                Active now
              </label>
              <button className="w-full rounded-lg bg-[#6d3d20] py-2.5 text-sm font-semibold text-white hover:bg-[#5a3219]" type="submit">
                Create Coupon
              </button>
            </form>
          </section>

          <section className={sectionClass}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1d2742]">Coupon List</h2>
              <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold text-[#4f7cff]">{promotions.length} coupons</span>
            </div>
            <div className="space-y-2">
              {promotions.map((coupon) => (
                <div key={coupon._id} className="flex flex-col gap-2 rounded-lg border border-[#edf0f7] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#1d2742]">{coupon.name} - {coupon.discountPercent}% OFF</p>
                    <p className="text-xs text-[#70809f]">
                      Valid: {new Date(coupon.startsAt).toLocaleDateString()} to {new Date(coupon.endsAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCouponActive(coupon._id, !coupon.active)}
                    className={coupon.active ? "rounded-md bg-[#e8f9f1] px-3 py-1 text-xs font-semibold text-[#1ca678]" : "rounded-md bg-[#fff1f2] px-3 py-1 text-xs font-semibold text-[#da3d4c]"}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </button>
                </div>
              ))}
              {!promotions.length && <p className="text-sm text-[#70809f]">No coupons created yet.</p>}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            {catalogCards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </section>

          <section className={`${sectionClass} flex flex-wrap items-center justify-between gap-3`}>
            <div>
              <h2 className="text-lg font-bold text-[#2f241b]">Catalog Workspace</h2>
              <p className="text-sm text-[#8d7966]">Navigate catalog admin areas quickly.</p>
            </div>
            <div className="flex w-full items-center gap-2 overflow-x-auto rounded-xl border border-[#e2d5c3] bg-[#fff8ef] p-1.5 sm:w-auto sm:overflow-visible">
              {catalogTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setCatalogTab(tab.value)}
                  className={catalogTab === tab.value ? "shrink-0 whitespace-nowrap rounded-md bg-[#6d3d20] px-4 py-2 text-xs font-semibold text-white" : "shrink-0 whitespace-nowrap rounded-md px-4 py-2 text-xs font-semibold text-[#6a5644]"}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {catalogTab === "catalog" && (
            <>
              <section className={sectionClass}>
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-[#2f241b]">Add Product Type</h2>
                  <p className="text-sm text-[#8d7966]">Choose product type and define sizes. These size checkboxes will appear while creating products.</p>
                </div>
                <form onSubmit={saveProductTypeProfile} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <select
                    className={inputClass}
                    value={productTypeEditor.type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      const profile = productTypeProfiles[nextType] || defaultProductTypeProfiles[nextType];
                      setProductTypeEditor({
                        type: nextType,
                        label: profile?.label || nextType,
                        sizesCsv: (profile?.sizes || []).join(",")
                      });
                    }}
                  >
                    {Object.keys(defaultProductTypeProfiles).map((typeKey) => (
                      <option key={typeKey} value={typeKey}>
                        {defaultProductTypeProfiles[typeKey].label}
                      </option>
                    ))}
                  </select>
                  <input className={inputClass} placeholder="Type label" value={productTypeEditor.label} onChange={(e) => setProductTypeEditor((prev) => ({ ...prev, label: e.target.value }))} />
                  <input
                    className={inputClass}
                    placeholder="Sizes comma separated (e.g. S, M, L, XL)"
                    value={productTypeEditor.sizesCsv}
                    onChange={(e) => setProductTypeEditor((prev) => ({ ...prev, sizesCsv: e.target.value }))}
                  />
                  <button className="rounded-lg bg-[#6d3d20] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5a3219]" type="submit">
                    Save Type
                  </button>
                </form>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={createBrand} className={`${sectionClass} space-y-3`}>
                  <h2 className="text-lg font-bold text-[#2f241b]">Add Brand</h2>
              <input className={inputClass} placeholder="Brand name" value={brandForm.name} onChange={(e) => setBrandForm((prev) => ({ ...prev, name: e.target.value }))} />
              <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#7f6a57]">Brand logo file</span>
                    <input type="file" accept="image/*" className={inputClass} onChange={(e) => handleSingleFile("brandLogo", e.target.files?.[0])} />
              </label>
              {brandForm.logo && <img src={brandForm.logo} alt="Brand preview" className="h-16 w-28 rounded border border-[#e7ecf5] object-cover" />}
              <textarea className={inputClass} rows={3} placeholder="Description" value={brandForm.description} onChange={(e) => setBrandForm((prev) => ({ ...prev, description: e.target.value }))} />
                  <button className="w-full rounded-lg bg-[#6d3d20] py-2.5 text-sm font-semibold text-white hover:bg-[#5a3219]" type="submit">
                Add Brand
              </button>
            </form>

            <form onSubmit={createCategory} className={`${sectionClass} space-y-3`}>
                  <h2 className="text-lg font-bold text-[#2f241b]">Add Category</h2>
              <input className={inputClass} placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))} />
              <input className={inputClass} placeholder="Category slug" value={categoryForm.slug} onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))} />
                  <button className="w-full rounded-lg bg-[#6d3d20] py-2.5 text-sm font-semibold text-white hover:bg-[#5a3219]" type="submit">
                Add Category
              </button>
            </form>
          </section>

              <section>
                <form onSubmit={createProduct} className={`${sectionClass} space-y-3`}>
              <h2 className="text-lg font-bold text-[#2f241b]">Add Product</h2>
              <p className="text-xs text-[#8d7966]">Create products by type: shoes, spects/eyewear, apparel, and accessories.</p>
              <select
                  className={inputClass}
                value={productForm.productType}
                onChange={(e) => {
                  const nextType = e.target.value;
                  const profile = productTypeProfiles[nextType] || defaultProductTypeProfiles[nextType];
                  setProductForm((prev) => ({ ...prev, productType: nextType, sizes: [] }));
                  setProductTypeEditor({
                    type: nextType,
                    label: profile?.label || nextType,
                    sizesCsv: (profile?.sizes || []).join(",")
                  });
                }}
              >
                {productTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
                </select>
              <input className={inputClass} placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5b6f95]">Product image files</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className={inputClass}
                  onChange={(e) => handleProductFiles(e.target.files)}
                />
              </label>
              {!!productImages.length && (
                <>
                  <p className="text-xs text-[#5b6f95]">{productImages.length} image(s) selected</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {productImages.map((image, index) => (
                      <div key={`${image}-${index}`} className="group relative overflow-hidden rounded-lg border border-[#eadfce] bg-[#fffaf4]">
                        <img src={image} alt={`Product upload ${index + 1}`} className="h-24 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeProductImageAt(index)}
                          className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-[#2a170e]/80 text-sm font-bold text-white transition group-hover:inline-flex"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#5b6f95]">Price</p>
                  <input className={inputClass} type="number" placeholder="Enter price" value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#5b6f95]">Discount %</p>
                  <input className={inputClass} type="number" placeholder="0" value={productForm.discount} onChange={(e) => setProductForm((prev) => ({ ...prev, discount: e.target.value }))} />
                </div>
              </div>
              {(basePrice > 0 || discountPercent > 0) && (
                <div className="rounded-xl border border-[#eadfce] bg-[#fffaf4] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a5a3b]">Discount Calculation</p>
                  <div className="mt-2 grid gap-2 text-sm text-[#6a5644] md:grid-cols-3">
                    <p>
                      MRP: <span className="font-semibold text-[#2f241b]">Rs. {Math.round(basePrice)}</span>
                    </p>
                    <p>
                      Discount: <span className="font-semibold text-[#2f241b]">{Math.round(discountPercent)}%</span>
                    </p>
                    <p>
                      You Save: <span className="font-semibold text-[#2f241b]">Rs. {Math.round(discountAmount)}</span>
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#6d3d20]">Final Selling Price: Rs. {Math.round(sellingPrice)}</p>
                </div>
              )}
              <div className="rounded-lg border border-[#eadfce] bg-[#fff7ee] p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8a5a3b]">Type-specific details</p>
                {productForm.productType === "footwear" && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input className={inputClass} placeholder="Shoe type (Sneakers, Loafers)" value={productForm.shoeType} onChange={(e) => setProductForm((prev) => ({ ...prev, shoeType: e.target.value }))} />
                    <input className={inputClass} placeholder="Sole material (Rubber, EVA)" value={productForm.soleMaterial} onChange={(e) => setProductForm((prev) => ({ ...prev, soleMaterial: e.target.value }))} />
                    <input className={inputClass} placeholder="Closure type (Lace-up, Slip-on)" value={productForm.closureType} onChange={(e) => setProductForm((prev) => ({ ...prev, closureType: e.target.value }))} />
                  </div>
                )}
                {productForm.productType === "eyewear" && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input className={inputClass} placeholder="Frame type (Full Rim, Half Rim)" value={productForm.frameType} onChange={(e) => setProductForm((prev) => ({ ...prev, frameType: e.target.value }))} />
                    <input className={inputClass} placeholder="Lens type (Blue-light, Polarized)" value={productForm.lensType} onChange={(e) => setProductForm((prev) => ({ ...prev, lensType: e.target.value }))} />
                    <input className={inputClass} placeholder="Frame material (Acetate, Metal)" value={productForm.frameMaterial} onChange={(e) => setProductForm((prev) => ({ ...prev, frameMaterial: e.target.value }))} />
                  </div>
                )}
                {productForm.productType === "accessories" && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input className={inputClass} placeholder="Accessory type (Cap, Belt, Watch)" value={productForm.accessoryType} onChange={(e) => setProductForm((prev) => ({ ...prev, accessoryType: e.target.value }))} />
                    <input className={inputClass} placeholder="Material (Leather, Cotton, Steel)" value={productForm.material} onChange={(e) => setProductForm((prev) => ({ ...prev, material: e.target.value }))} />
                  </div>
                )}
                {productForm.productType === "apparel" && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input className={inputClass} placeholder="Fit type (Slim, Regular, Oversized)" value={productForm.fitType} onChange={(e) => setProductForm((prev) => ({ ...prev, fitType: e.target.value }))} />
                    <input className={inputClass} placeholder="Fabric (Denim, Cotton, Linen)" value={productForm.fabricType} onChange={(e) => setProductForm((prev) => ({ ...prev, fabricType: e.target.value }))} />
                  </div>
                )}
              </div>
              <textarea className={inputClass} rows={3} placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} />
              {supportsSizeSelection && <div className="space-y-2 rounded-lg border border-[#e8ecf5] bg-[#fbfcff] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5b6f95]">{productForm.productType === "footwear" ? "Shoe Sizes" : "Apparel Sizes"}</p>
                <div className="flex flex-wrap gap-3">
                  {selectedSizeOptions.map((size) => (
                    <label key={size} className="inline-flex items-center gap-1.5 text-sm text-[#4b5d84]">
                      <input type="checkbox" checked={productForm.sizes.includes(size)} onChange={() => toggleSize(size)} />
                      {size}
                    </label>
                  ))}
                </div>
              </div>}
              <div className="space-y-2 rounded-lg border border-[#e8ecf5] bg-[#fbfcff] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5b6f95]">Colors</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className={inputClass}
                    placeholder="Type color and press Enter"
                    value={productForm.colorInput}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, colorInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addColor(productForm.colorInput);
                      }
                    }}
                  />
                  <button type="button" onClick={() => addColor(productForm.colorInput)} className="rounded-lg border border-[#d4dcf0] px-3 py-2 text-xs font-semibold text-[#4b5d84] sm:py-0">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorSuggestions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => addColor(color)}
                      className="rounded-full border border-[#decfbb] bg-[#fffaf4] px-2.5 py-1 text-xs text-[#7a6552]"
                    >
                      {color}
                    </button>
                  ))}
                </div>
                {!!productForm.colors.length && (
                  <div className="flex flex-wrap gap-2">
                    {productForm.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => removeColor(color)}
                        className="rounded-full bg-[#eef3ff] px-2.5 py-1 text-xs font-semibold text-[#3f5d9e]"
                        title="Click to remove"
                      >
                        {color} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!!productForm.colors.length && (
                <div className="space-y-2 rounded-lg border border-[#e8ecf5] bg-[#fbfcff] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5b6f95]">Color-wise Images</p>
                  <div className="space-y-2">
                    {productForm.colors.map((color) => (
                      <div key={color} className="rounded-lg border border-[#eadfce] bg-[#fffaf4] p-2">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#445885]">{color}</p>
                          <span className="text-[11px] text-[#7586aa]">{(colorImageFiles[color] || []).length} image(s)</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className={inputClass}
                          onChange={(e) => handleColorImageFiles(color, e.target.files)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select className={inputClass} value={productForm.brand} onChange={(e) => setProductForm((prev) => ({ ...prev, brand: e.target.value }))}>
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <select className={inputClass} value={productForm.category} onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#5b6f95]">Qty</p>
                <input className={inputClass} type="number" placeholder="Enter quantity" value={productForm.stockCount} onChange={(e) => setProductForm((prev) => ({ ...prev, stockCount: e.target.value }))} />
              </div>
              <input className={inputClass} placeholder="Tags (comma separated)" value={productForm.tagsCsv} onChange={(e) => setProductForm((prev) => ({ ...prev, tagsCsv: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm text-[#5b6f95]">
                <input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} />
                Featured product
              </label>
              <label className="flex items-center gap-2 text-sm text-[#5b6f95]">
                <input type="checkbox" checked={productForm.isTrending} onChange={(e) => setProductForm((prev) => ({ ...prev, isTrending: e.target.checked }))} />
                Trending product
              </label>
              <button className="w-full rounded-lg bg-[#6d3d20] py-2.5 text-sm font-semibold text-white hover:bg-[#5a3219]" type="submit">
                Add Product
              </button>
            </form>
          </section>
            </>
          )}

          {catalogTab === "banner" && (
            <section className="grid gap-6 lg:grid-cols-2">
              <form onSubmit={createBanner} className={`${sectionClass} space-y-3`}>
                <h2 className="text-lg font-bold text-[#2f241b]">Banner Studio</h2>
                <p className="text-xs text-[#8d7966]">Add single static banner or multiple carousel banners for Top / Middle / Footer positions.</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select className={inputClass} value={bannerForm.position} onChange={(e) => setBannerForm((prev) => ({ ...prev, position: e.target.value }))}>
                    <option value="top-slider">Top Slider</option>
                    <option value="mid-section">Mid Section</option>
                    <option value="footer">Footer</option>
                  </select>
                  <select className={inputClass} value={bannerForm.type} onChange={(e) => setBannerForm((prev) => ({ ...prev, type: e.target.value }))}>
                    <option value="carousel">Carousel (multiple)</option>
                    <option value="static">Static (single)</option>
                  </select>
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#7f6a57]">Banner image files</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple={bannerForm.type === "carousel"}
                    className={inputClass}
                    onChange={(e) => handleBannerFiles(e.target.files)}
                  />
                </label>
                {!!bannerImages.length && <p className="text-xs text-[#8d7966]">{bannerImages.length} image(s) selected</p>}
                {bannerForm.image && <img src={bannerForm.image} alt="Banner preview" className="h-28 w-full rounded border border-[#e7ecf5] object-cover" />}
                <input className={inputClass} placeholder="Banner title" value={bannerForm.title} onChange={(e) => setBannerForm((prev) => ({ ...prev, title: e.target.value }))} />
                <input className={inputClass} placeholder="Banner subtitle" value={bannerForm.subtitle} onChange={(e) => setBannerForm((prev) => ({ ...prev, subtitle: e.target.value }))} />
                <input className={inputClass} type="number" placeholder="Start order index" value={bannerForm.order} onChange={(e) => setBannerForm((prev) => ({ ...prev, order: e.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-[#7f6a57]">
                  <input type="checkbox" checked={bannerForm.visible} onChange={(e) => setBannerForm((prev) => ({ ...prev, visible: e.target.checked }))} />
                  Display banner(s) on storefront
                </label>
                <button className="w-full rounded-lg bg-[#6d3d20] py-2.5 text-sm font-semibold text-white hover:bg-[#5a3219]" type="submit">
                  Add Banner
                </button>
              </form>

              <div className={sectionClass}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[#2f241b]">Live Banners ({banners.length})</h3>
                </div>
                <div className="space-y-2">
                  {banners.slice(0, 10).map((banner) => (
                    <div key={banner._id} className="rounded-lg border border-[#eadfce] bg-[#fffaf4] p-2">
                      <img src={banner.image || "https://placehold.co/280x110?text=Banner"} alt={banner.title || "Banner"} className="h-20 w-full rounded border border-[#e8ecf5] object-cover" />
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#6a5644]">{banner.title || "Untitled Banner"} · {banner.position}</p>
                        <button
                          type="button"
                          onClick={() => toggleBannerVisibility(banner._id, !banner.visible)}
                          className={banner.visible ? "rounded-md bg-[#e8f9f1] px-2 py-1 text-xs font-semibold text-[#1ca678]" : "rounded-md bg-[#fff1f2] px-2 py-1 text-xs font-semibold text-[#da3d4c]"}
                        >
                          {banner.visible ? "Visible" : "Hidden"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {catalogTab === "edit" && (
            <section className="space-y-6">
              <div className={sectionClass}>
                <h2 className="text-lg font-bold text-[#2f241b]">Manage Products</h2>
                <p className="mb-4 text-sm text-[#8d7966]">Edit product details, replace product images, or delete products.</p>
                <div className="space-y-3">
                  {products.map((product) => {
                    const draft = getProductDraft(product);
                    return (
                      <div key={product._id} className="grid gap-3 rounded-xl border border-[#eadfce] bg-[#fffaf4] p-3 md:grid-cols-[90px_1fr]">
                        <img src={product.images?.[0] || "https://placehold.co/80x80?text=P"} alt={product.name} className="h-20 w-20 rounded-lg border border-[#e5d5c1] object-cover" />
                        <div className="grid gap-2 lg:grid-cols-5">
                          <input className={inputClass} value={draft.name} onChange={(e) => upsertDraft(setProductDrafts, product._id, { name: e.target.value })} placeholder="Product name" />
                          <input className={inputClass} type="number" value={draft.price} onChange={(e) => upsertDraft(setProductDrafts, product._id, { price: e.target.value })} placeholder="Price" />
                          <input className={inputClass} type="number" value={draft.discount} onChange={(e) => upsertDraft(setProductDrafts, product._id, { discount: e.target.value })} placeholder="Discount %" />
                          <input className={inputClass} type="number" value={draft.stockCount} onChange={(e) => upsertDraft(setProductDrafts, product._id, { stockCount: e.target.value })} placeholder="Stock" />
                          <select className={inputClass} value={draft.status} onChange={(e) => upsertDraft(setProductDrafts, product._id, { status: e.target.value })}>
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                          </select>
                          <input type="file" accept="image/*" multiple className={`${inputClass} lg:col-span-2`} onChange={(e) => replaceProductImages(product._id, e.target.files)} />
                          <button type="button" onClick={() => saveProductEdit(product._id)} className="rounded-lg bg-[#6d3d20] px-3 py-2 text-xs font-semibold text-white hover:bg-[#5a3219]">
                            Save
                          </button>
                          <button type="button" onClick={() => deleteProduct(product._id)} className="rounded-lg border border-[#d98f7b] bg-[#fff1ed] px-3 py-2 text-xs font-semibold text-[#b14c2f]">
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {!products.length && <p className="text-sm text-[#8d7966]">No products available.</p>}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className={sectionClass}>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-[#2f241b]">Brands</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => {
                      const draft = getBrandDraft(brand);
                      return (
                        <div key={brand._id} className="space-y-2 rounded-lg border border-[#eadfce] bg-[#fffaf4] p-2">
                          <img src={brand.logo || "https://placehold.co/120x50?text=Brand"} alt={brand.name} className="h-12 w-full rounded border border-[#e5d5c1] object-cover" />
                          <input className={inputClass} value={draft.name} onChange={(e) => upsertDraft(setBrandDrafts, brand._id, { name: e.target.value })} />
                          <textarea className={inputClass} rows={2} value={draft.description} onChange={(e) => upsertDraft(setBrandDrafts, brand._id, { description: e.target.value })} />
                          <input type="file" accept="image/*" className={inputClass} onChange={(e) => replaceBrandLogo(brand._id, e.target.files?.[0])} />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => saveBrandEdit(brand._id)} className="flex-1 rounded-md bg-[#6d3d20] py-1.5 text-xs font-semibold text-white">
                              Save
                            </button>
                            <button type="button" onClick={() => deleteBrand(brand._id)} className="flex-1 rounded-md border border-[#d98f7b] bg-[#fff1ed] py-1.5 text-xs font-semibold text-[#b14c2f]">
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={sectionClass}>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-[#2f241b]">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const draft = getCategoryDraft(category);
                      return (
                        <div key={category._id} className="space-y-2 rounded-lg border border-[#eadfce] bg-[#fffaf4] p-2">
                          <input className={inputClass} value={draft.name} onChange={(e) => upsertDraft(setCategoryDrafts, category._id, { name: e.target.value })} />
                          <input className={inputClass} value={draft.slug} onChange={(e) => upsertDraft(setCategoryDrafts, category._id, { slug: e.target.value })} />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => saveCategoryEdit(category._id)} className="flex-1 rounded-md bg-[#6d3d20] py-1.5 text-xs font-semibold text-white">
                              Save
                            </button>
                            <button type="button" onClick={() => deleteCategory(category._id)} className="flex-1 rounded-md border border-[#d98f7b] bg-[#fff1ed] py-1.5 text-xs font-semibold text-[#b14c2f]">
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={sectionClass}>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-[#2f241b]">Banners</h3>
                  <div className="space-y-2">
                    {banners.map((banner) => {
                      const draft = getBannerDraft(banner);
                      return (
                        <div key={banner._id} className="space-y-2 rounded-lg border border-[#eadfce] bg-[#fffaf4] p-2">
                          <img src={banner.image || "https://placehold.co/280x110?text=Banner"} alt={banner.title || "Banner"} className="h-16 w-full rounded border border-[#e5d5c1] object-cover" />
                          <input className={inputClass} value={draft.title} onChange={(e) => upsertDraft(setBannerDrafts, banner._id, { title: e.target.value })} placeholder="Title" />
                          <input className={inputClass} value={draft.subtitle} onChange={(e) => upsertDraft(setBannerDrafts, banner._id, { subtitle: e.target.value })} placeholder="Subtitle" />
                          <div className="grid grid-cols-2 gap-2">
                            <select className={inputClass} value={draft.position} onChange={(e) => upsertDraft(setBannerDrafts, banner._id, { position: e.target.value })}>
                              <option value="top-slider">Top</option>
                              <option value="mid-section">Middle</option>
                              <option value="footer">Footer</option>
                            </select>
                            <select className={inputClass} value={draft.type} onChange={(e) => upsertDraft(setBannerDrafts, banner._id, { type: e.target.value })}>
                              <option value="carousel">carousel</option>
                              <option value="static">static</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input className={inputClass} type="number" value={draft.order} onChange={(e) => upsertDraft(setBannerDrafts, banner._id, { order: e.target.value })} placeholder="Order" />
                            <label className="inline-flex items-center gap-2 rounded-xl border border-[#decfbb] bg-[#fffefb] px-3 text-xs text-[#6a5644]">
                              <input type="checkbox" checked={draft.visible} onChange={(e) => upsertDraft(setBannerDrafts, banner._id, { visible: e.target.checked })} />
                              Visible
                            </label>
                          </div>
                          <input type="file" accept="image/*" className={inputClass} onChange={(e) => replaceBannerImage(banner._id, e.target.files?.[0])} />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => saveBannerEdit(banner._id)} className="flex-1 rounded-md bg-[#6d3d20] py-1.5 text-xs font-semibold text-white">
                              Save
                            </button>
                            <button type="button" onClick={() => deleteBanner(banner._id)} className="flex-1 rounded-md border border-[#d98f7b] bg-[#fff1ed] py-1.5 text-xs font-semibold text-[#b14c2f]">
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {catalogTab === "dashboard" && <section className="grid gap-6 lg:grid-cols-3">
            <div className={sectionClass}>
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef3ff] text-[#4f7cff]">
                  <Icon name="brand" className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[#1d2742]">Live Brands ({brands.length})</h3>
              </div>
              <div className="space-y-2">
                {brands.slice(0, 6).map((brand) => (
                  <div key={brand._id} className="flex items-center gap-3 rounded-lg border border-[#edf0f7] p-2">
                    <img src={brand.logo || "https://placehold.co/60x40?text=Brand"} alt={brand.name} className="h-10 w-14 rounded border border-[#e8ecf5] object-cover" />
                    <p className="text-sm font-medium text-[#5b6f95]">{brand.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={sectionClass}>
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef3ff] text-[#4f7cff]">
                  <Icon name="image" className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[#1d2742]">Banner Display ({banners.length})</h3>
              </div>
              <div className="space-y-2">
                {banners.slice(0, 6).map((banner) => (
                  <div key={banner._id} className="rounded-lg border border-[#edf0f7] p-2">
                    <img src={banner.image || "https://placehold.co/280x110?text=Banner"} alt={banner.title || "Banner"} className="h-20 w-full rounded border border-[#e8ecf5] object-cover" />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#5b6f95]">{banner.title || "Untitled Banner"}</p>
                      <button
                        type="button"
                        onClick={() => toggleBannerVisibility(banner._id, !banner.visible)}
                        className={banner.visible ? "rounded-md bg-[#e8f9f1] px-2 py-1 text-xs font-semibold text-[#1ca678]" : "rounded-md bg-[#fff1f2] px-2 py-1 text-xs font-semibold text-[#da3d4c]"}
                      >
                        {banner.visible ? "Visible" : "Hidden"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <LiveList title={`Live Products (${products.length})`} icon="box" items={products.slice(0, 8).map((product) => product.name)} />
          </section>}
        </>
      )}
    </div>
  );
}

function DashboardCard({ title, value, icon, tone }) {
  return (
    <article className="rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-4 shadow-[0_14px_30px_rgba(63,40,22,0.1)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7c8cad]">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-[#1d2742]">{value}</h3>
        </div>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

function LiveList({ title, icon, items }) {
  return (
    <div className={sectionClass}>
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef3ff] text-[#4f7cff]">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[#1d2742]">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm text-[#5b6f95]">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function Icon({ name, className }) {
  const paths = {
    users: "M17 20v-1a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v1 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 20v-1a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    bag: "M6 2l1.5 4h9L18 2 M4 6h16l-1.5 14h-13z",
    rupee: "M5 4h10 M5 8h10 M7 4c0 3.5 2 6 6 6H5l8 10",
    spark: "M12 2l2.2 4.6L19 8l-3.5 3.4.8 4.8L12 14l-4.3 2.2.8-4.8L5 8l4.8-1.4z",
    brand: "M3 7l9-4 9 4-9 4-9-4z M3 17l9 4 9-4 M3 12l9 4 9-4",
    grid: "M3 3h8v8H3z M13 3h8v8h-8z M3 13h8v8H3z M13 13h8v8h-8z",
    box: "M3 7l9-4 9 4-9 4-9-4z M3 7v10l9 4 9-4V7 M12 11v10",
    image: "M4 5h16v14H4z M8 13l2.5-2.5L14 14l2-2 2 2 M8 9h.01"
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}
