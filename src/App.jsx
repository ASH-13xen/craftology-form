/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

// --- CONFIGURATION ---
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://craftology-backend.onrender.com/api";

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
  const [modelType, setModelType] = useState("envelope");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Price is now a string as requested
  const [formData, setFormData] = useState({
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
  });

  const isWorkshop = modelType === "workshop";
  const isEnvelope = modelType === "envelope";
  const isProduct = !isWorkshop;

  // --- KEEP ALIVE MECHANISM (Pings every 14 mins) ---
  useEffect(() => {
    const pingBackend = async () => {
      try {
        await fetch(API_BASE_URL);
        console.log("Pinged backend to keep alive");
      } catch (error) {
        // Ignore errors (like 404s), as long as the request was sent, the server wakes up.
        console.log("Keep-alive ping sent (error ignored)");
      }
    };

    // Ping immediately on load
    pingBackend();

    // Set interval for 14 minutes (14 * 60 * 1000 ms)
    const intervalId = setInterval(pingBackend, 14 * 60 * 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

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
      // 1. VALIDATION LOGIC
      const hasImage = formData.image || formData.image2 || formData.image3;
      const hasMedia = hasImage || formData.video_link || formData.insta_reel;

      if (!hasImage) {
        throw new Error("At least one image link must be provided.");
      }

      if (!hasMedia) {
        throw new Error(
          "At least one media type (Image, Video Link, or Insta Reel) must be provided.",
        );
      }

      let endpoint = "";
      // Price is sent as a string
      let payload = {
        title: formData.title,
        price: formData.price,
        description: formData.description,
        image: formData.image,
        image2: formData.image2,
        image3: formData.image3,
      };

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
          endpoint = "/coin";
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;
        case "gaddibox":
          endpoint = "/gaddi";
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;
        case "resin":
          endpoint = "/resin";
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;

        // --- ADDED TORAN AND TAG CASES HERE ---
        case "toran":
          endpoint = "/torans"; // Matches the standard plural route
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;
        case "tag":
          endpoint = "/tags"; // Matches the standard plural route
          payload.video_link = formData.video_link;
          payload.insta_reel = formData.insta_reel;
          break;
        // --------------------------------------

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

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to parse the error message from the backend
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save data");
      }

      setStatus({
        type: "success",
        message: `Successfully added to ${modelType.toUpperCase()}!`,
      });

      // Reset Form
      setFormData({
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
      });
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
        <div className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Add New Item</h1>
          <p className="text-sm text-gray-500 mt-1">
            Select category and fill in the details.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <CategoryButton id="envelope" label="Envelope" />
          <CategoryButton id="scrapbook" label="Scrapbook" />
          <CategoryButton id="coinbox" label="Coin Box" />
          <CategoryButton id="gaddibox" label="Gaddi Box" />
          <CategoryButton id="resin" label="Resin" />
          {/* --- ADDED BUTTONS --- */}
          <CategoryButton id="toran" label="Toran" />
          <CategoryButton id="tag" label="Tag" />
          {/* --------------------- */}
          <CategoryButton id="workshop" label="Workshop" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                required
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Price (String)
              </label>
              <input
                required
                name="price"
                type="text"
                placeholder="e.g. 500 or 500-1000"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 font-medium">
                Note: At least one Image Link is mandatory.
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Image Link 1
                </label>
                <input
                  name="image"
                  type="text"
                  placeholder="Primary Image URL"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Image Link 2
                  </label>
                  <input
                    name="image2"
                    type="text"
                    placeholder="Secondary Image URL"
                    value={formData.image2}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Image Link 3
                  </label>
                  <input
                    name="image3"
                    type="text"
                    placeholder="Third Image URL"
                    value={formData.image3}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  />
                </div>
              </div>
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
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {isProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Video Link
                </label>
                <input
                  name="video_link"
                  type="text"
                  value={formData.video_link}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black"
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
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-black"
                />
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
                  <label className="block text-sm font-semibold mb-2">
                    Date
                  </label>
                  <input
                    name="date"
                    type="text"
                    placeholder="e.g. Oct 24, 2024"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3"
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
                    className="w-full border border-gray-300 rounded p-3"
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
                  value={formData.locationName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Features
                </label>
                <input
                  name="features"
                  type="text"
                  value={formData.features}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3"
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            {status.message && (
              <div
                className={`mb-4 p-3 text-sm text-center rounded font-medium ${status.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
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
