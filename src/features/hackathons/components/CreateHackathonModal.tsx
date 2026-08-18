"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Upload,
  Sparkles,
  Layers,
  Users,
  CheckCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  createHackathon,
  updateHackathon,
  deleteHackathon,
  CreateHackathonInput,
} from "../lib/hackathons-client";
import type { Hackathon } from "@/lib/api-types-helpers";

interface CreateHackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hackathon: Hackathon) => void;
  onDelete?: (hackathonId: string) => void;
  initialData?: Hackathon | null;
}

const PRESET_BANNERS = [
  {
    name: "AgriTech & IoT",
    url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80",
    category: "AgriTech",
  },
  {
    name: "FinTech & Banking",
    url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    category: "FinTech",
  },
  {
    name: "HealthTech & AI",
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    category: "HealthTech",
  },
  {
    name: "Futuristic Addis City",
    url: "/futuristic_city_banner.png",
    category: "Smart Cities",
  },
  {
    name: "Innovation Hub",
    url: "/project_preview_dashboard.png",
    category: "AI & Machine Learning",
  },
  {
    name: "GreenTech & Climate",
    url: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
    category: "GreenTech",
  },
  {
    name: "Cyber & Security",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    category: "CyberTech",
  },
];

export function CreateHackathonModal({
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  initialData,
}: CreateHackathonModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bannerTab, setBannerTab] = useState<"upload" | "url" | "presets">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    bannerUrl: "/futuristic_city_banner.png",
    category: "AgriTech",
    status: "draft" as "draft" | "published",
    maxTeamSize: 5,
    registrationOpensAt: new Date().toISOString().split("T")[0],
    registrationClosesAt: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    submissionClosesAt: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
  });

  useEffect(() => {
    setShowDeleteConfirm(false);
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        tagline: initialData.tags?.[0] || "AgriTech",
        description: initialData.description || "",
        bannerUrl: initialData.bannerUrl || "/futuristic_city_banner.png",
        category: initialData.tags?.[0] || "AgriTech",
        status: (initialData.status as any) || "draft",
        maxTeamSize: 5,
        registrationOpensAt: initialData.registrationOpensAt
          ? new Date(initialData.registrationOpensAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        registrationClosesAt: initialData.registrationClosesAt
          ? new Date(initialData.registrationClosesAt).toISOString().split("T")[0]
          : new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        submissionClosesAt: initialData.submissionClosesAt
          ? new Date(initialData.submissionClosesAt).toISOString().split("T")[0]
          : new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
      });
    } else {
      setFormData({
        title: "",
        tagline: "",
        description: "",
        bannerUrl: "/futuristic_city_banner.png",
        category: "AgriTech",
        status: "draft",
        maxTeamSize: 5,
        registrationOpensAt: new Date().toISOString().split("T")[0],
        registrationClosesAt: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        submissionClosesAt: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData((prev) => ({ ...prev, bannerUrl: e.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (submitStatus?: "draft" | "published") => {
    if (!formData.title.trim()) return;
    setIsSubmitting(true);

    try {
      const finalStatus = submitStatus || formData.status;
      const payload: CreateHackathonInput = {
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        bannerUrl: formData.bannerUrl,
        tags: [formData.category],
        status: finalStatus,
        maxTeamSize: Number(formData.maxTeamSize),
        registrationOpensAt: new Date(formData.registrationOpensAt).toISOString(),
        registrationClosesAt: new Date(formData.registrationClosesAt).toISOString(),
        submissionOpensAt: new Date(formData.registrationOpensAt).toISOString(),
        submissionClosesAt: new Date(formData.submissionClosesAt).toISOString(),
      };

      let result: Hackathon;
      if (initialData?.id) {
        result = await updateHackathon(initialData.id, payload);
      } else {
        result = await createHackathon(payload);
      }

      onSuccess(result);
      onClose();
    } catch (err) {
      console.error("Failed to save hackathon:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setIsDeleting(true);
    try {
      await deleteHackathon(initialData.id);
      if (onDelete) {
        onDelete(initialData.id);
      }
      onClose();
    } catch (err) {
      console.error("Failed to delete hackathon:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-indigo-100/80 text-[#1E1E38]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#d6e7e1]">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#122622]">
              {initialData ? "Edit Hackathon Setup" : "Launch New Hackathon"}
            </h2>
            <p className="text-xs text-[#57685f]">
              Configure branding, cover image, timeline, and registration limits for your hackathon.
            </p>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold">Permanently Delete Hackathon?</h4>
                <p className="mt-0.5 text-xs text-rose-700">
                  This will remove the hackathon &quot;{formData.title || "this hackathon"}&quot; and its associated data. This action cannot be undone.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Hackathon"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-xl bg-white border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-6 flex flex-col gap-6"
        >
          {/* Section 1: Event Metadata */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c]">
              1. Event Metadata & Branding
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#122622] mb-1.5">
                Hackathon Name *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., AgriTech Hackathon 2026"
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Category / Domain
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                >
                  <option value="AgriTech">AgriTech</option>
                  <option value="FinTech">FinTech</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="Smart Cities">Smart Cities</option>
                  <option value="GreenTech">GreenTech</option>
                  <option value="CyberTech">CyberTech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Max Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.maxTeamSize}
                  onChange={(e) => setFormData({ ...formData, maxTeamSize: Number(e.target.value) })}
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#122622] mb-1.5">
                Tagline / Short Description
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g., Transforming agricultural supply chains through IoT & AI"
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#122622] mb-1.5">
                Full Overview / Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed hackathon rules, challenge scope, and eligibility requirements..."
                className="w-full rounded-2xl border border-[#d6e7e1] bg-white p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
              />
            </div>

            {/* Banner Image Upload & Selection Section */}
            <div className="flex flex-col gap-3 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#122622] flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-[#0f6b5c]" />
                  <span>Hackathon Cover Image & Banner</span>
                </label>

                {/* Banner Tab Selector */}
                <div className="flex rounded-xl bg-white p-1 border border-[#d6e7e1] text-[11px] font-bold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setBannerTab("upload")}
                    className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                      bannerTab === "upload"
                        ? "bg-[#0f6b5c] text-white"
                        : "text-[#57685f] hover:text-[#122622]"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerTab("presets")}
                    className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                      bannerTab === "presets"
                        ? "bg-[#0f6b5c] text-white"
                        : "text-[#57685f] hover:text-[#122622]"
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerTab("url")}
                    className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                      bannerTab === "url"
                        ? "bg-[#0f6b5c] text-white"
                        : "text-[#57685f] hover:text-[#122622]"
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {/* Tab 1: File Upload (Drag & Drop or File Picker) */}
              {bannerTab === "upload" && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all bg-white ${
                    isDragging
                      ? "border-[#0f6b5c] bg-[#e8f3f0]/80 scale-[1.01]"
                      : "border-[#d6e7e1] hover:border-[#0f6b5c] hover:bg-[#e8f3f0]/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c]">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#122622]">
                      Click to upload or drag and drop image
                    </p>
                    <p className="text-[10px] text-[#57685f]">
                      PNG, JPG, WebP, GIF, or SVG (Recommended: 1200 x 630 px)
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Curated Preset Gallery */}
              {bannerTab === "presets" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_BANNERS.map((preset) => {
                    const isSelected = formData.bannerUrl === preset.url;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, bannerUrl: preset.url })}
                        className={`group relative overflow-hidden rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#0f6b5c] ring-2 ring-[#0f6b5c]/40 shadow-xs"
                            : "border-[#d6e7e1] hover:border-[#0f6b5c]"
                        }`}
                      >
                        <div className="h-16 w-full overflow-hidden bg-gray-100">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-1.5 bg-white">
                          <p className="text-[10px] font-bold text-[#122622] truncate">
                            {preset.name}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 rounded-full bg-[#0f6b5c] p-0.5 text-white">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tab 3: Custom Web URL */}
              {bannerTab === "url" && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-[#57685f]" />
                    <input
                      type="url"
                      value={formData.bannerUrl}
                      onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                      placeholder="https://example.com/hackathon-banner.jpg"
                      className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-9 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                    />
                  </div>
                </div>
              )}

              {/* Live Banner Preview Card */}
              {formData.bannerUrl && (
                <div className="mt-1 relative h-32 w-full overflow-hidden rounded-2xl border border-[#d6e7e1] shadow-xs bg-gray-900">
                  <img
                    src={formData.bannerUrl}
                    alt="Cover Banner Preview"
                    className="h-full w-full object-cover opacity-90"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/futuristic_city_banner.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3.5">
                    <span className="self-start rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md">
                      BANNER PREVIEW
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-white truncate">
                        {formData.title || "Hackathon Title Preview"}
                      </p>
                      <p className="text-[10px] text-white/80 line-clamp-1">
                        {formData.tagline || formData.description || "Empowering Ethiopian innovators."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Dates & Deadlines */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c]">
              2. Dates & Deadlines
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Registration Start
                </label>
                <input
                  type="date"
                  value={formData.registrationOpensAt}
                  onChange={(e) => setFormData({ ...formData, registrationOpensAt: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  value={formData.registrationClosesAt}
                  onChange={(e) => setFormData({ ...formData, registrationClosesAt: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Submission Deadline
                </label>
                <input
                  type="date"
                  value={formData.submissionClosesAt}
                  onChange={(e) => setFormData({ ...formData, submissionClosesAt: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-[#d6e7e1] pt-6">
            {/* Delete Option (When editing) */}
            {initialData?.id ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Hackathon</span>
              </button>
            ) : (
              <div />
            )}

            <div className="w-full sm:w-auto flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit("draft")}
                className="rounded-2xl border border-[#d6e7e1] bg-white px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit("published")}
                className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{isSubmitting ? "Saving..." : initialData ? "Update Setup" : "+ Publish Event"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
