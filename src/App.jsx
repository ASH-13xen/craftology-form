import React, { useState } from "react";

// --- CONFIGURATION ---
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TAGS_LIST = [
  "Handcrafted",
  "Floral",
  "Modern",
  "Traditional",
  "Minimalist",
  "Royal",
  "Packet Envelope",
  "Diwali",
  "Raksha Bandhan",
  "Wedding",
  "Birthday",
  "Anniversary",
  "Baby Shower",
  "Shagun",
  "House Warming",
];

export default function App() {
  // --- STATE ---
  // Options: 'envelope', 'scrapbook', 'coinbox', 'gaddibox', 'resin', 'workshop'
  const [modelType, setModelType] = useState("envelope");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Unified Form State
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    image: "",
    // Product Specific
    tags: [],
    video_link: "",
    insta_reel: "",
    // Workshop Specific
    date: "",
    time: "",
    locationName: "",
    locationAddress: "",
    mapEmbedUrl: "",
    mapLink: "",
    features: "",
  });

  // --- LOGIC HELPERS ---
  const isWorkshop = modelType === "workshop";
  const isEnvelope = modelType === "envelope";
  // Products are everything except workshops
  const isProduct = !isWorkshop;

  // --- HANDLERS ---
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      let endpoint = "";
      let payload = {
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,
        image: formData.image,
      };

      // 1. DETERMINE ENDPOINT & SPECIFIC DATA
      switch (modelType) {
        case "envelope":
          endpoint = "/envelope";
          payload.tags = formData.tags;
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;
        case "scrapbook":
          endpoint = "/scrapbook";
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;
        case "coinbox":
          endpoint = "/coin"; // Adjust API endpoint as needed
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;
        case "gaddibox":
          endpoint = "/gaddi"; // Adjust API endpoint as needed
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;
        case "resin":
          endpoint = "/resin"; // Adjust API endpoint as needed
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;
        case "workshop":
          endpoint = "/workshops";
          payload.date = formData.date;
          payload.time = formData.time;
          payload.locationName = formData.locationName;
          payload.locationAddress = formData.locationAddress;
          payload.mapEmbedUrl = formData.mapEmbedUrl;
          payload.mapLink = formData.mapLink;
          payload.features = formData.features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);
          break;
        default:
          throw new Error("Invalid Type Selected");
      }

      // 2. VALIDATION: VIDEO LINKS (For all products)
      if (isProduct) {
        if (!payload.video_link && !payload.insta_reel) {
          throw new Error(
            "Please provide at least one: Video Link OR Instagram Reel.",
          );
        }
      }

      // 3. SEND REQUEST
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save data");

      setStatus({
        type: "success",
        message: `Successfully added to ${modelType.toUpperCase()}!`,
      });

      // Clear Form
      setFormData({
        title: "",
        price: "",
        description: "",
        image: "",
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
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const CategoryButton = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setModelType(id)}
      className={`py-3 px-2 text-sm font-semibold border rounded transition-all ${
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
      <div className="w-full max-w-2xl bg-white p-8 rounded shadow-sm border border-gray-200">
        {/* HEADER */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Add New Item</h1>
          <p className="text-sm text-gray-500 mt-1">
            Select category and fill in the details.
          </p>
        </div>

        {/* 1. SELECT TYPE */}
        <label className="block text-xs font-bold uppercase tracking-wide mb-3">
          Select Category
        </label>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <CategoryButton id="envelope" label="Envelope" />
          <CategoryButton id="scrapbook" label="Scrapbook" />
          <CategoryButton id="coinbox" label="Coin Box" />
          <CategoryButton id="gaddibox" label="Gaddi Box" />
          <CategoryButton id="resin" label="Resin" />
          <CategoryButton id="workshop" label="Workshop" />
        </div>

        {/* 2. FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* COMMON FIELDS (Title, Price, Desc, Image) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                required
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Price (₹)
              </label>
              <input
                required
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Image Link
              </label>
              <input
                required
                name="image"
                type="text"
                placeholder="https://drive.google.com/file/d/1yMd98iEWmxh1-F9owqGv65ZDrOiubWYO/view?usp=sharing"
                value={formData.image}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm text-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                required
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* PRODUCT SPECIFIC (Video Links) - Renders for Envelope, Scrapbook, Coin, Gaddi, Resin */}
          {isProduct && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 border border-gray-200 rounded text-sm text-gray-700">
                <span className="font-bold block mb-1">
                  Video Requirements:
                </span>
                Please provide at least one: <strong>Video Link</strong> OR{" "}
                <strong>Insta Reel</strong>.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Video Link (YouTube/Drive)
                  </label>
                  <input
                    name="video_link"
                    type="text"
                    value={formData.video_link}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Insta Reel URL
                  </label>
                  <input
                    name="insta_reel"
                    type="text"
                    value={formData.insta_reel}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ENVELOPE SPECIFIC (Tags) */}
          {isEnvelope && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold">Select Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS_LIST.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                      formData.tags.includes(tag)
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-300 hover:border-black"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WORKSHOP SPECIFIC */}
          {isWorkshop && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Date
                  </label>
                  <input
                    name="date"
                    type="text"
                    placeholder="e.g. Oct 24, 2024"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Time
                  </label>
                  <input
                    name="time"
                    type="text"
                    placeholder="e.g. 2:00 PM - 5:00 PM"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Location Name
                </label>
                <input
                  name="locationName"
                  type="text"
                  placeholder="e.g. The Art Studio"
                  value={formData.locationName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Address
                </label>
                <input
                  name="locationAddress"
                  type="text"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Map Embed URL (src only)
                  </label>
                  <input
                    name="mapEmbedUrl"
                    type="text"
                    value={formData.mapEmbedUrl}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Google Maps Link
                  </label>
                  <input
                    name="mapLink"
                    type="text"
                    value={formData.mapLink}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Features (Comma Separated)
                </label>
                <input
                  name="features"
                  type="text"
                  placeholder="e.g. Beginners friendly, Snacks included"
                  value={formData.features}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>
            </div>
          )}

          {/* STATUS & BUTTON */}
          <div className="pt-4">
            {status.message && (
              <div
                className={`mb-4 p-3 text-sm text-center rounded font-medium ${
                  status.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold py-4 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "SAVING..." : `PUBLISH ${modelType.toUpperCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
