"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Check,
  Search,
  ShoppingCart,
  Image as ImageIcon,
  X,
  Pencil,
  Minus,
} from "lucide-react";

type GroceryItem = {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  imageUrl: string;
  purchased: boolean;
  createdAt?: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  items?: GroceryItem[];
  item?: GroceryItem;
  imageUrl?: string;
};

const API_URL =
  "http://localhost:5000/api/grocery";

const categories = [
  "All",
  "Vegetables",
  "Fruits",
  "Dairy",
  "Grains",
  "Protein",
  "Nuts & Seeds",
  "Kitchen Essentials",
  "Other",
];

export default function GroceryPage() {
  const router = useRouter();

  /* =====================================================
     STATES
  ===================================================== */

  const [items, setItems] = useState<GroceryItem[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [name, setName] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [unit, setUnit] =
    useState("item");

  const [category, setCategory] =
    useState("Other");

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /* =====================================================
     AUTH TOKEN
  ===================================================== */

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(
      "foodlens_token"
    );
  };

  /* =====================================================
     HANDLE API RESPONSE SAFELY
  ===================================================== */

  const parseResponse = async (
    response: Response
  ): Promise<ApiResponse> => {
    const contentType =
      response.headers.get(
        "content-type"
      );

    if (
      !contentType?.includes(
        "application/json"
      )
    ) {
      const text =
        await response.text();

      console.error(
        "Backend returned non-JSON response:",
        text
      );

      throw new Error(
        "Backend returned an invalid response. Please check whether the backend is running."
      );
    }

    return response.json();
  };

  /* =====================================================
     FETCH GROCERY ITEMS
  ===================================================== */

  const fetchItems = async () => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        API_URL,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "foodlens_token"
        );

        localStorage.removeItem(
          "foodlens_user"
        );

        router.push("/login");
        return;
      }

      const data =
        await parseResponse(response);

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to fetch grocery items"
        );
      }

      setItems(
        data.items || []
      );
    } catch (error) {
      console.error(
        "Fetch grocery items error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchItems();
  }, []);

  /* =====================================================
     IMAGE SELECT
  ===================================================== */

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      alert(
        "Please select an image file."
      );

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Image size must be less than 2 MB."
      );

      return;
    }

    setSelectedImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  /* =====================================================
     REMOVE SELECTED IMAGE
  ===================================================== */

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     UPLOAD IMAGE
     IMPORTANT:
     NO CLOUDINARY HERE
  ===================================================== */

  const uploadImage = async (
    file: File
  ) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return null;
      }

      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      console.log(
        "Uploading image to FoodLens backend..."
      );

      const response =
        await fetch(
          `${API_URL}/upload-image`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: formData,
          }
        );

      if (response.status === 401) {
        localStorage.removeItem(
          "foodlens_token"
        );

        localStorage.removeItem(
          "foodlens_user"
        );

        router.push("/login");

        return null;
      }

      const data =
        await parseResponse(response);

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to upload image"
        );
      }

      console.log(
        "Image uploaded successfully ✅"
      );

      return data.imageUrl || "";
    } catch (error) {
      console.error(
        "[browser] Image upload error:",
        error
      );

      throw error;
    } finally {
      setUploading(false);
    }
  };

  /* =====================================================
     RESET FORM
  ===================================================== */

  const resetForm = () => {
    setName("");
    setQuantity(1);
    setUnit("item");
    setCategory("Other");
    setSelectedImage(null);
    setImagePreview("");
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     ADD / UPDATE ITEM
  ===================================================== */

  const addItem = async () => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      if (!name.trim()) {
        alert(
          "Please enter grocery item name."
        );

        return;
      }

      setSaving(true);

      let imageUrl = "";

      /* ---------------------------------------------
         UPLOAD IMAGE
      --------------------------------------------- */

      if (selectedImage) {
        imageUrl =
          (await uploadImage(
            selectedImage
          )) || "";
      }

      /* ---------------------------------------------
         ADD NEW ITEM
      --------------------------------------------- */

      if (!editingId) {
        const response =
          await fetch(API_URL, {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: name.trim(),

              quantity:
                quantity > 0
                  ? quantity
                  : 1,

              unit:
                unit.trim() ||
                "item",

              category:
                category.trim() ||
                "Other",

              imageUrl,
            }),
          });

        if (response.status === 401) {
          localStorage.removeItem(
            "foodlens_token"
          );

          localStorage.removeItem(
            "foodlens_user"
          );

          router.push("/login");

          return;
        }

        const data =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to add grocery item"
          );
        }

        if (data.item) {
          setItems(
            (prev) => [
              data.item!,
              ...prev,
            ]
          );
        }
      }

      /* ---------------------------------------------
         UPDATE EXISTING ITEM
      --------------------------------------------- */

      else {
        const existingItem =
          items.find(
            (item) =>
              item._id === editingId
          );

        const finalImageUrl =
          imageUrl ||
          existingItem?.imageUrl ||
          "";

        const response =
          await fetch(
            `${API_URL}/${editingId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                name: name.trim(),

                quantity:
                  quantity > 0
                    ? quantity
                    : 1,

                unit:
                  unit.trim() ||
                  "item",

                category:
                  category.trim() ||
                  "Other",

                imageUrl:
                  finalImageUrl,
              }),
            }
          );

        if (response.status === 401) {
          localStorage.removeItem(
            "foodlens_token"
          );

          localStorage.removeItem(
            "foodlens_user"
          );

          router.push("/login");

          return;
        }

        const data =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to update grocery item"
          );
        }

        if (data.item) {
          setItems(
            (prev) =>
              prev.map((item) =>
                item._id === editingId
                  ? data.item!
                  : item
              )
          );
        }
      }

      resetForm();
    } catch (error) {
      console.error(
        "Add/update grocery item error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     TOGGLE PURCHASED
  ===================================================== */

  const togglePurchased = async (
    item: GroceryItem
  ) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response =
        await fetch(
          `${API_URL}/${item._id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              purchased:
                !item.purchased,
            }),
          }
        );

      if (response.status === 401) {
        localStorage.removeItem(
          "foodlens_token"
        );

        localStorage.removeItem(
          "foodlens_user"
        );

        router.push("/login");

        return;
      }

      const data =
        await parseResponse(
          response
        );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update item"
        );
      }

      setItems(
        (prev) =>
          prev.map((current) =>
            current._id === item._id
              ? {
                  ...current,
                  purchased:
                    !current.purchased,
                }
              : current
          )
      );
    } catch (error) {
      console.error(
        "Toggle purchased error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update item."
      );
    }
  };

  /* =====================================================
     DELETE ITEM
  ===================================================== */

  const deleteItem = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this grocery item?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response =
        await fetch(
          `${API_URL}/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (response.status === 401) {
        localStorage.removeItem(
          "foodlens_token"
        );

        localStorage.removeItem(
          "foodlens_user"
        );

        router.push("/login");

        return;
      }

      const data =
        await parseResponse(
          response
        );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete item"
        );
      }

      setItems(
        (prev) =>
          prev.filter(
            (item) =>
              item._id !== id
          )
      );
    } catch (error) {
      console.error(
        "Delete grocery item error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete item."
      );
    }
  };

  /* =====================================================
     EDIT ITEM
  ===================================================== */

  const startEdit = (
    item: GroceryItem
  ) => {
    setEditingId(item._id);

    setName(item.name);

    setQuantity(
      item.quantity
    );

    setUnit(item.unit);

    setCategory(
      item.category
    );

    setImagePreview(
      item.imageUrl || ""
    );

    setSelectedImage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     FILTER ITEMS
  ===================================================== */

  const filteredItems =
    useMemo(() => {
      return items.filter(
        (item) => {
          const matchesSearch =
            item.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesCategory =
            selectedCategory ===
              "All" ||
            item.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      items,
      search,
      selectedCategory,
    ]);

  /* =====================================================
     STATS
  ===================================================== */

  const totalItems =
    items.length;

  const purchasedItems =
    items.filter(
      (item) =>
        item.purchased
    ).length;

  const remainingItems =
    totalItems -
    purchasedItems;

  const progress =
    totalItems > 0
      ? Math.round(
          (purchasedItems /
            totalItems) *
            100
        )
      : 0;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7faf5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-600">
            Loading grocery list...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f7faf5] text-slate-800">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-emerald-100 bg-white">
        <div className="max-w-7xl mx-auto px-5 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <ShoppingCart
                    size={25}
                    className="text-emerald-700"
                  />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Grocery List
                  </h1>

                  <p className="text-slate-500 mt-1">
                    Manage your groceries
                    and shopping list
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="bg-emerald-50 rounded-2xl px-5 py-3">
                <p className="text-xs text-emerald-600">
                  Total
                </p>

                <p className="text-xl font-bold text-emerald-800">
                  {totalItems}
                </p>
              </div>

              <div className="bg-blue-50 rounded-2xl px-5 py-3">
                <p className="text-xs text-blue-600">
                  Purchased
                </p>

                <p className="text-xl font-bold text-blue-800">
                  {purchasedItems}
                </p>
              </div>

              <div className="bg-orange-50 rounded-2xl px-5 py-3">
                <p className="text-xs text-orange-600">
                  Remaining
                </p>

                <p className="text-xl font-bold text-orange-800">
                  {remainingItems}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}

          <div className="mt-7">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Shopping progress
              </span>

              <span className="text-sm font-bold text-emerald-700">
                {progress}%
              </span>
            </div>

            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <section className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-[380px_1fr] gap-8">
          {/* =================================================
              ADD ITEM CARD
          ================================================= */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-fit lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Grocery"
                    : "Add Grocery"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add an item to your list
                </p>
              </div>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="p-2 rounded-xl hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Name */}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Item name
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Tomato"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>

            {/* Quantity */}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quantity
                </label>

                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          1,
                          quantity - 1
                        )
                      )
                    }
                    className="px-3 py-3 hover:bg-slate-50"
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Number(
                            e.target.value
                          )
                        )
                      )
                    }
                    className="w-full text-center outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        quantity + 1
                      )
                    }
                    className="px-3 py-3 hover:bg-slate-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Unit
                </label>

                <input
                  value={unit}
                  onChange={(e) =>
                    setUnit(e.target.value)
                  }
                  placeholder="kg / item"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Category */}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              >
                {categories
                  .filter(
                    (item) =>
                      item !== "All"
                  )
                  .map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
              </select>
            </div>

            {/* Image */}

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Food image
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-44 object-cover"
                  />

                  <button
                    type="button"
                    onClick={
                      removeSelectedImage
                    }
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow"
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="w-full h-36 border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center hover:bg-emerald-50 transition"
                >
                  <ImageIcon
                    size={28}
                    className="text-emerald-500"
                  />

                  <span className="mt-2 text-sm font-semibold text-slate-700">
                    Choose food image
                  </span>

                  <span className="text-xs text-slate-400 mt-1">
                    PNG, JPG up to 2MB
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />
            </div>

            {/* Submit */}

            <button
              type="button"
              onClick={addItem}
              disabled={
                saving ||
                uploading ||
                !name.trim()
              }
              className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {saving || uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                  {uploading
                    ? "Uploading image..."
                    : "Saving..."}
                </>
              ) : (
                <>
                  {editingId ? (
                    <Pencil size={18} />
                  ) : (
                    <Plus size={18} />
                  )}

                  {editingId
                    ? "Update Item"
                    : "Add Item"}
                </>
              )}
            </button>
          </div>

          {/* =================================================
              LIST SECTION
          ================================================= */}

          <div>
            {/* Search */}

            <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-5">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search groceries..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-transparent outline-none focus:bg-white focus:border-emerald-300"
                  />
                </div>

                <select
                  value={
                    selectedCategory
                  }
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value
                    )
                  }
                  className="md:w-52 px-4 py-3 rounded-xl bg-slate-50 border border-transparent outline-none focus:bg-white focus:border-emerald-300"
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Empty */}

            {filteredItems.length ===
            0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <ShoppingCart
                    size={30}
                    className="text-emerald-600"
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  No grocery items
                </h3>

                <p className="text-slate-500 mt-2">
                  Add your first grocery
                  item from the panel.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredItems.map(
                  (item) => (
                    <div
                      key={item._id}
                      className={`bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm transition hover:shadow-md ${
                        item.purchased
                          ? "opacity-70"
                          : ""
                      }`}
                    >
                      {/* Image */}

                      {item.imageUrl ? (
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.name
                          }
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-emerald-50 flex items-center justify-center">
                          <ImageIcon
                            size={35}
                            className="text-emerald-300"
                          />
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                              {
                                item.category
                              }
                            </span>

                            <h3
                              className={`mt-3 text-lg font-bold text-slate-900 ${
                                item.purchased
                                  ? "line-through"
                                  : ""
                              }`}
                            >
                              {item.name}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {
                                item.quantity
                              }{" "}
                              {
                                item.unit
                              }
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              togglePurchased(
                                item
                              )
                            }
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              item.purchased
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                          >
                            <Check
                              size={19}
                            />
                          </button>
                        </div>

                        <div className="flex gap-2 mt-5">
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                item
                              )
                            }
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 flex items-center justify-center gap-2"
                          >
                            <Pencil
                              size={15}
                            />

                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteItem(
                                item._id
                              )
                            }
                            className="w-11 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}