/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

// --- CONFIGURATION ---
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://craftology-backend.onrender.com/api";

const TAGS_LIST = [
  // Price-Based Categories
  "Under ₹50 (Budget Picks)",
  "₹50 – ₹100",
  "₹100 – ₹250",
  "₹250 – ₹500",
  "₹500+ (Luxury Collection)",
  "Bulk Order Deals",
  "Premium Custom Range",

  // Color-Based Categories
  "Pastel Collection (Blush Pink, Mint, Lavender)",
  "Royal Tones (Maroon, Emerald, Navy Blue)",
  "Classic Neutrals (Beige, Ivory, White, Gold)",
  "Vibrant & Bright (Yellow, Orange, Rani Pink)",
  "Monochrome (Black & White)",
  "Metallic Shades (Gold Foil, Rose Gold, Silver)",
  "Multicolor / Printed",

  // Design-Based Categories
  "Minimal & Elegant",
  "Floral Designs",
  "Traditional Indian Motifs",
  "Modern Contemporary",
  "Embroidered / Fabric Envelopes",
  "Laser Cut Designs",
  "Foil Printed / Embossed",
  "Resin Art Envelopes",
  "Illustrated / Hand-Painted",
  "Textured Paper Finish",

  // Theme-Based Categories
  "Royal / Maharaja Theme",
  "Boho / Rustic Theme",
  "Vintage Theme",
  "Luxury Luxe Theme",
  "Festive Glam Theme",
  "Nature-Inspired Theme",
  "Cultural / Ethnic Theme",
  "Modern Chic Theme",

  // Occasion-Based Categories
  "Wedding Envelopes",
  "Shagun Envelopes",
  "Invitation Inserts",
  "Bride/Groom Special",
  "Festive Envelopes",
  "Diwali Collection",
  "Rakhi Special",
  "Eid Collection",
  "Christmas Collection",
  "Gifting Envelopes",
  "Cash Gift Envelopes",
  "Money Holders",
  "Corporate Envelopes",
  "Branding Envelopes",
  "Bulk Corporate Gifting",
  "Special Occasions",
  "Birthday Envelopes",
  "Anniversary",
  "Baby Shower",
  "Housewarming",

  // Premium / USP-Based Categories
  "Handmade Luxury Collection",
  "Customized with Name/Initials",
  "Eco-Friendly / Sustainable",
  "Limited Edition Designs",
  "Signature Craftology Collection",
  "Designer Picks",

  // Customization Filters
  "Add Name / Initials",
  "Add Logo (Corporate)",
  "Color Customization",
  "Design Customization",
  "Bulk Order Customization"
];

export default function App() {
  const [viewMode, setViewMode] = useState("add"); // "add" | "modify"
  const [modelType, setModelType] = useState("envelope");
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const defaultFormData = {
    title: "",
    price: "",
    description: "",
    image: "",
    image2: "",
    image3: "",
    tags: [],
    video_link: "",
    insta_reel: "",
    date: "",
    time: "",
    locationName: "",
    locationAddress: "",
    mapEmbedUrl: "",
    mapLink: "",
    features: "",
  };

  const [formData, setFormData] = useState(defaultFormData);

  const isWorkshop = modelType === "workshop";
  const isEnvelope = modelType === "envelope";
  const isProduct = !isWorkshop;

  // --- KEEP ALIVE MECHANISM (Pings every 14 mins) ---
  useEffect(() => {
    const pingBackend = async () => {
      try {
        await fetch(API_BASE_URL);
      } catch (error) {
        console.log("Keep-alive ping sent (error ignored)");
      }
    };
    pingBackend();
    const intervalId = setInterval(pingBackend, 14 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch Items when in Modify mode
  const fetchItems = async () => {
    if (viewMode !== "modify") return;
    setLoading(true);
    try {
      let endpoint = _getEndpointConfig();
      const cleanBase = API_BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${cleanBase}${endpoint}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data.success) {
        setItems(data.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Fetch Items Error:", error);
      setStatus({ type: "error", message: "Failed to fetch items." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditingItem(null);
    setFormData(defaultFormData);
    setStatus({ type: "", message: "" });
    if (viewMode === "modify") {
      fetchItems();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelType, viewMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tag) => {
    setFormData((prev) => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      price: item.price || "",
      description: item.description || "",
      image: item.image || "",
      image2: item.image2 || "",
      image3: item.image3 || "",
      tags: item.tags || [],
      video_link: item.video_link || "",
      insta_reel: item.insta_reel || "",
      date: item.date || "",
      time: item.time || "",
      locationName: item.locationName || "",
      locationAddress: item.locationAddress || "",
      mapEmbedUrl: item.mapEmbedUrl || "",
      mapLink: item.mapLink || "",
      features: Array.isArray(item.features) ? item.features.join(", ") : (item.features || ""),
    });
    setStatus({ type: "", message: "" });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
  };

  const handleDelete = async (id) => {
    // Safety check in case ID is completely missing from the backend response
    if (!id) {
        setStatus({ type: "error", message: "Cannot delete: Item ID is missing from the database." });
        return;
    }

    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    setStatus({ type: "", message: "" });
    
    try {
      let endpoint = _getEndpointConfig();
      const cleanBase = API_BASE_URL.replace(/\/$/, "");
      const targetUrl = `${cleanBase}${endpoint}/${id}`;
      
      const response = await fetch(targetUrl, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        // Attempt to parse the server error message
        let errorMsg = "Failed to delete data";
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || `Server Error: ${response.status}`;
        } catch(e) {
            errorMsg = `Server Error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }
      
      setStatus({ type: "success", message: `Successfully deleted item!` });
      fetchItems(); // Refresh list
    } catch (error) {
      console.error("Delete Error:", error);
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const _getEndpointConfig = () => {
    switch (modelType) {
        case "envelope": return "/envelope";
        case "scrapbook": return "/scrapbook";
        case "coinbox": return "/coin";
        case "gaddibox": return "/gaddi";
        case "resin": return "/resin";
        case "toran": return "/torans";
        case "tag": return "/tags";
        case "workshop": return "/workshops";
        default: throw new Error("Invalid Type Selected");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const hasImage = formData.image || formData.image2 || formData.image3;
      const hasMedia = hasImage || formData.video_link || formData.insta_reel;

      if (!hasImage) throw new Error("At least one image link must be provided.");
      if (!hasMedia) throw new Error("At least one media type must be provided.");

      let endpoint = _getEndpointConfig();
      let payload = {
        title: formData.title,
        price: formData.price,
        description: formData.description,
        image: formData.image,
        image2: formData.image2,
        image3: formData.image3,
      };

      if (isEnvelope) {
          payload.tags = formData.tags;
      }
      if (isProduct) {
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
      }
      if (isWorkshop) {
          payload.date = formData.date;
          payload.time = formData.time;
          payload.locationName = formData.locationName;
          payload.locationAddress = formData.locationAddress;
          payload.mapEmbedUrl = formData.mapEmbedUrl;
          payload.mapLink = formData.mapLink;
          payload.features = formData.features.split(",").map((f) => f.trim()).filter(Boolean);
      }

      const method = viewMode === "add" ? "POST" : "PUT";
      const cleanBase = API_BASE_URL.replace(/\/$/, "");
      
      // Handle the ID correctly for PUT requests depending on the DB schema
      const editId = editingItem ? (editingItem._id || editingItem.id) : null;
      const finalUrl = viewMode === "add" ? `${cleanBase}${endpoint}` : `${cleanBase}${endpoint}/${editId}`;

      const response = await fetch(finalUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save data");
      }

      setStatus({
        type: "success",
        message: viewMode === "add" ? `Successfully added to ${modelType.toUpperCase()}!` : `Successfully updated ${modelType.toUpperCase()}!`,
      });

      if (viewMode === "add") {
         setFormData(defaultFormData);
      } else {
         setEditingItem(null);
         setFormData(defaultFormData);
         fetchItems(); // Refresh the list
      }

    } catch (error) {
      console.error("Submission Error:", error);
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const CategoryButton = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setModelType(id)}
      className={`py-2 px-2 text-sm font-semibold border rounded transition-all ${
        modelType === id
          ? "bg-black text-white border-black"
          : "bg-white text-gray-600 border-gray-300 hover:border-black"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4 font-sans text-gray-900">
      <div className="w-full max-w-4xl bg-white p-8 rounded shadow-sm border border-gray-200">
        
        {/* Toggle Mode Navigation */}
        <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setViewMode("add")}
              className={`flex-1 py-3 text-center rounded text-sm font-bold transition-colors ${viewMode === "add" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Add New Item
            </button>
            <button
              type="button"
              onClick={() => setViewMode("modify")}
              className={`flex-1 py-3 text-center rounded text-sm font-bold transition-colors ${viewMode === "modify" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Modify Existing Items
            </button>
        </div>

        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">
             {viewMode === "add" ? "Add Data" : "Modify Data"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Select category to {viewMode === "add" ? "add new entries" : "view and edit existing entries"}.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <CategoryButton id="envelope" label="Envelope" />
          <CategoryButton id="scrapbook" label="Scrapbook" />
          <CategoryButton id="coinbox" label="Coin Box" />
          <CategoryButton id="gaddibox" label="Gaddi Box" />
          <CategoryButton id="resin" label="Resin" />
          <CategoryButton id="toran" label="Toran" />
          <CategoryButton id="tag" label="Tag" />
          <CategoryButton id="workshop" label="Workshop" />
        </div>

        {/* Global Status Message */}
        {status.message && (
          <div className={`mb-6 p-4 text-sm text-center rounded font-medium ${status.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
            {status.message}
          </div>
        )}

        {/* --- MODIFY MODE: LIST VIEW --- */}
        {viewMode === "modify" && !editingItem && (
          <div>
            {loading ? (
                <p className="text-center text-gray-500 py-8">Loading items...</p>
            ) : items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items found for {modelType}.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => {
                        // Dynamically resolve the ID to handle different database structures
                        const itemId = item._id || item.id;
                        
                        return (
                        <div key={itemId || `fallback-${index}`} className="border border-gray-200 rounded p-4 flex flex-col items-center hover:shadow bg-white">
                            {item.image ? (
                                <img src={item.image} alt={item.title} className="h-32 w-full object-cover rounded mb-4" />
                            ) : (
                                <div className="h-32 w-full bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">No Image</div>
                            )}
                            <h3 className="font-bold text-center mb-1 truncate w-full" title={item.title}>{item.title}</h3>
                            <p className="text-sm text-green-700 font-semibold mb-4">₹{item.price}</p>
                            <div className="mt-auto flex w-full space-x-2">
                                <button type="button" onClick={() => handleEditClick(item)} className="flex-1 bg-gray-900 text-white py-2 rounded text-xs font-bold hover:bg-gray-800">
                                    EDIT
                                </button>
                                <button type="button" onClick={() => handleDelete(itemId)} className="flex-1 bg-red-100 text-red-700 py-2 rounded text-xs font-bold hover:bg-red-200 border border-red-200">
                                    DELETE
                                </button>
                            </div>
                        </div>
                    )})}
                </div>
            )}
          </div>
        )}

        {/* --- FORM VIEW (Add Mode OR Edit Mode) --- */}
        {(viewMode === "add" || editingItem) && (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded border border-gray-200">
          {editingItem && (
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-blue-800">Editing: {editingItem.title}</h2>
                 <button type="button" onClick={() => setEditingItem(null)} className="text-sm text-gray-500 hover:text-black underline">
                     Cancel Edit
                 </button>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input required name="title" type="text" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Price (String)</label>
              <input required name="price" type="text" placeholder="e.g. 500 or 500-1000" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black" />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 font-medium">Note: At least one Image Link is mandatory.</div>
              <div>
                <label className="block text-sm font-semibold mb-2">Image Link 1</label>
                <input name="image" type="text" placeholder="Primary Image URL" value={formData.image} onChange={handleChange} className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black text-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Image Link 2</label>
                  <input name="image2" type="text" placeholder="Secondary Image URL" value={formData.image2} onChange={handleChange} className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Image Link 3</label>
                  <input name="image3" type="text" placeholder="Third Image URL" value={formData.image3} onChange={handleChange} className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black text-sm" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>

          <hr className="border-gray-200" />

          {isProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Video Link</label>
                <input name="video_link" type="text" value={formData.video_link} onChange={handleChange} className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Insta Reel URL</label>
                <input name="insta_reel" type="text" value={formData.insta_reel} onChange={handleChange} className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
            </div>
          )}

          {isEnvelope && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold">Select Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS_LIST.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors ${formData.tags.includes(tag) ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:border-black"}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isWorkshop && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Date</label>
                  <input name="date" type="text" placeholder="e.g. Oct 24, 2024" value={formData.date} onChange={handleChange} className="w-full border border-gray-300 rounded p-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Time</label>
                  <input name="time" type="text" placeholder="e.g. 2:00 PM - 5:00 PM" value={formData.time} onChange={handleChange} className="w-full border border-gray-300 rounded p-3" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Location Name</label>
                <input name="locationName" type="text" value={formData.locationName} onChange={handleChange} className="w-full border border-gray-300 rounded p-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Features</label>
                <input name="features" type="text" value={formData.features} onChange={handleChange} className="w-full border border-gray-300 rounded p-3" />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold py-4 rounded hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? "SAVING..." : (viewMode === "add" ? `PUBLISH ${modelType.toUpperCase()}` : `UPDATE ${modelType.toUpperCase()}`)}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}