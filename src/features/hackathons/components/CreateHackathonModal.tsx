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
  Coins,
  Award,
  DollarSign,
  MapPin,
  Building,
  Tag,
  Briefcase,
  ShieldCheck,
  Plus,
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
  hostOrgId?: string;
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
    name: "AI & Smart City",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    category: "AI & ML",
  },
  {
    name: "HealthTech & Med",
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    category: "HealthTech",
  },
  {
    name: "EdTech & Education",
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    category: "EdTech",
  },
  {
    name: "Green Energy & Climate",
    url: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
    category: "CleanTech",
  },
];

const SUGGESTED_TAGS = [
  "AI",
  "Machine Learning",
  "Web Development",
  "Mobile",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Agriculture",
  "Climate",
  "Blockchain",
  "Web3",
  "Cybersecurity",
  "IoT",
  "Data Science",
  "Cloud",
  "Open Source",
  "Entrepreneurship",
  "Innovation",
];

const FIELD_OPTIONS = [
  "Technology",
  "Artificial Intelligence",
  "Software Development",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Agriculture",
  "Climate & Environment",
  "Cybersecurity",
  "Blockchain / Web3",
  "Data Science",
  "IoT",
  "Robotics",
  "Business",
  "Entrepreneurship",
  "Government",
  "Social Impact",
  "Other",
];

export function CreateHackathonModal({
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  initialData,
  hostOrgId,
}: CreateHackathonModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bannerTab, setBannerTab] = useState<"upload" | "url" | "presets">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newTagInput, setNewTagInput] = useState("");
  const [customFieldInput, setCustomFieldInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    bannerUrl: "/futuristic_city_banner.png",
    locationMode: "in_person" as "in_person" | "online" | "hybrid",
    locationName: "Addis Ababa, Ethiopia",
    venue: "",
    field: "Artificial Intelligence",
    tags: ["AI", "Innovation"] as string[],
    openTo: ["ALL"] as string[], // "ALL" | "UNIVERSITY_STUDENT" | "GOVERNMENT_PUBLIC_SECTOR"
    status: "draft" as "draft" | "published",
    maxTeamSize: 5,
    registrationOpensAt: new Date().toISOString().split("T")[0],
    registrationClosesAt: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    submissionOpensAt: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    submissionClosesAt: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
    totalPrizeBudget: 10000,
    currency: "USD" as "ETB" | "USD",
    firstPlaceAmount: 6000,
    secondPlaceAmount: 3000,
    thirdPlaceAmount: 1000,
  });

  useEffect(() => {
    setShowDeleteConfirm(false);
    if (initialData) {
      const serverDist = (initialData.prizeDistribution || {}) as any;
      const initialField = initialData.field || "Technology";
      const isKnownField = FIELD_OPTIONS.includes(initialField);

      setFormData({
        title: initialData.title || "",
        tagline: initialData.tags?.[0] || "",
        description: initialData.description || "",
        bannerUrl: initialData.bannerUrl || "/futuristic_city_banner.png",
        locationMode: (initialData.locationMode as any) || "in_person",
        locationName: initialData.locationName || (initialData.locationMode === "online" ? "Online / Virtual" : "Addis Ababa, Ethiopia"),
        venue: initialData.venue || "",
        field: isKnownField ? initialField : "Other",
        tags: Array.isArray(initialData.tags) && initialData.tags.length > 0 ? initialData.tags : ["Innovation"],
        openTo: Array.isArray(initialData.openTo) && initialData.openTo.length > 0 ? initialData.openTo : ["ALL"],
        status: (initialData.status as any) || "draft",
        maxTeamSize: 5,
        registrationOpensAt: initialData.registrationOpensAt
          ? new Date(initialData.registrationOpensAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        registrationClosesAt: initialData.registrationClosesAt
          ? new Date(initialData.registrationClosesAt).toISOString().split("T")[0]
          : new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        submissionOpensAt: initialData.submissionOpensAt
          ? new Date(initialData.submissionOpensAt).toISOString().split("T")[0]
          : new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        submissionClosesAt: initialData.submissionClosesAt
          ? new Date(initialData.submissionClosesAt).toISOString().split("T")[0]
          : new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
        totalPrizeBudget: initialData.totalPrizeBudget ? Number(initialData.totalPrizeBudget) : 10000,
        currency: serverDist.currency || "USD",
        firstPlaceAmount: serverDist.firstPlaceAmount ? Number(serverDist.firstPlaceAmount) : 6000,
        secondPlaceAmount: serverDist.secondPlaceAmount ? Number(serverDist.secondPlaceAmount) : 3000,
        thirdPlaceAmount: serverDist.thirdPlaceAmount ? Number(serverDist.thirdPlaceAmount) : 1000,
      });

      if (!isKnownField && initialField) {
        setCustomFieldInput(initialField);
      }
    } else {
      setFormData({
        title: "",
        tagline: "",
        description: "",
        bannerUrl: "/futuristic_city_banner.png",
        locationMode: "in_person",
        locationName: "Addis Ababa, Ethiopia",
        venue: "",
        field: "Artificial Intelligence",
        tags: ["AI", "Innovation"],
        openTo: ["ALL"],
        status: "draft",
        maxTeamSize: 5,
        registrationOpensAt: new Date().toISOString().split("T")[0],
        registrationClosesAt: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        submissionOpensAt: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        submissionClosesAt: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
        totalPrizeBudget: 10000,
        currency: "USD",
        firstPlaceAmount: 6000,
        secondPlaceAmount: 3000,
        thirdPlaceAmount: 1000,
      });
      setCustomFieldInput("");
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

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleOpenToToggle = (option: "ALL" | "UNIVERSITY_STUDENT" | "GOVERNMENT_PUBLIC_SECTOR") => {
    if (option === "ALL") {
      setFormData((prev) => ({ ...prev, openTo: ["ALL"] }));
      return;
    }

    setFormData((prev) => {
      let current = prev.openTo.filter((o) => o !== "ALL");
      if (current.includes(option)) {
        current = current.filter((o) => o !== option);
      } else {
        current.push(option);
      }

      if (current.length === 0) {
        return { ...prev, openTo: ["ALL"] };
      }
      return { ...prev, openTo: current };
    });
  };

  const handleSubmit = async (submitStatus?: "draft" | "published") => {
    if (!formData.title.trim()) {
      alert("Please enter a Hackathon Name.");
      return;
    }

    if (!formData.locationName.trim()) {
      alert("Please specify a Location.");
      return;
    }

    const totalBudget = Number(formData.totalPrizeBudget) || 0;
    const firstPlace = Number(formData.firstPlaceAmount) || 0;
    const secondPlace = Number(formData.secondPlaceAmount) || 0;
    const thirdPlace = Number(formData.thirdPlaceAmount) || 0;
    const totalTiers = firstPlace + secondPlace + thirdPlace;

    if (totalBudget < 0 || firstPlace < 0 || secondPlace < 0 || thirdPlace < 0) {
      alert("Prize budget and prize amounts cannot be negative.");
      return;
    }

    if (totalBudget > 0 && totalTiers > totalBudget) {
      alert(
        `The sum of tier prizes (${totalTiers.toLocaleString()} ${formData.currency}) exceeds the total prize budget (${totalBudget.toLocaleString()} ${formData.currency}). Please adjust the prize distribution.`
      );
      return;
    }

    const finalField = formData.field === "Other"
      ? (customFieldInput.trim() || "General Innovation")
      : formData.field;

    setIsSubmitting(true);

    try {
      const finalStatus = submitStatus || formData.status;
      const payload: CreateHackathonInput = {
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        bannerUrl: formData.bannerUrl,
        locationMode: formData.locationMode,
        locationName: formData.locationName,
        venue: formData.venue,
        field: finalField,
        tags: formData.tags.length > 0 ? formData.tags : ["Innovation"],
        openTo: formData.openTo.length > 0 ? formData.openTo : ["ALL"],
        status: finalStatus,
        hostOrgId: hostOrgId || initialData?.hostOrgId,
        registrationOpensAt: new Date(formData.registrationOpensAt).toISOString(),
        registrationClosesAt: new Date(formData.registrationClosesAt).toISOString(),
        submissionOpensAt: new Date(formData.submissionOpensAt).toISOString(),
        submissionClosesAt: new Date(formData.submissionClosesAt).toISOString(),
        totalPrizeBudget: totalBudget,
        currency: formData.currency,
        prizeDistribution: {
          currency: formData.currency,
          firstPlaceAmount: firstPlace,
          secondPlaceAmount: secondPlace,
          thirdPlaceAmount: thirdPlace,
        },
      };

      let result: Hackathon;
      if (initialData?.id) {
        result = await updateHackathon(initialData.id, payload);
      } else {
        result = await createHackathon(payload);
        if (finalStatus === "published" && result.status !== "published") {
          try {
            const pub = await updateHackathon(result.id, { status: "published" });
            if (pub) result = pub;
          } catch (e) {
            console.warn("Could not transition newly created hackathon to published:", e);
          }
        }
      }

      onSuccess(result);
      onClose();
    } catch (err) {
      console.error("Failed to save hackathon:", err);
      alert(err instanceof Error ? err.message : "Failed to save hackathon.");
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
      alert(err instanceof Error ? err.message : "Failed to delete hackathon.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-3xl border border-[#d6e7e1] bg-white shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d6e7e1] px-6 py-4 bg-[#f8faf9]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0f6b5c] text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#122622]">
                {initialData ? "Edit Hackathon" : "Create Hackathon"}
              </h2>
              <p className="text-xs text-[#57685f]">
                Configure event details, location, field, tags, eligibility, and prize allocation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#57685f] hover:bg-gray-100 hover:text-[#122622] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-rose-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-extrabold text-center text-[#122622] mb-1">
                Delete Hackathon?
              </h3>
              <p className="text-xs text-center text-[#57685f] mb-6">
                Are you sure you want to delete &ldquo;{formData.title || "this hackathon"}&rdquo;? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 rounded-2xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
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
          className="max-h-[80vh] overflow-y-auto p-6 flex flex-col gap-6"
        >
          {/* Section 1: Basic Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c] flex items-center gap-1.5">
              <span>1. Basic Information</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#122622] mb-1.5">
                Hackathon Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., AI for Agriculture Hackathon"
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#122622] mb-1.5">
                Tagline / Short Summary
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
                Full Overview / Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
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

              {/* Tab 1: File Upload */}
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

              {/* Live Banner Preview */}
              {formData.bannerUrl && (
                <div className="mt-1 relative h-28 w-full overflow-hidden rounded-2xl border border-[#d6e7e1] shadow-xs bg-gray-900">
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

          {/* Section 2: Location & Event Type */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c] flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#0f6b5c]" />
              <span>2. Location & Event Type</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#122622] mb-2">
                Event Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "in_person", label: "In Person", desc: "Physical venue" },
                  { id: "online", label: "Online", desc: "100% Virtual event" },
                  { id: "hybrid", label: "Hybrid", desc: "Online & Physical" },
                ].map((type) => {
                  const isSelected = formData.locationMode === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        const newLocation = type.id === "online" ? "Online / Virtual" : "Addis Ababa, Ethiopia";
                        setFormData({
                          ...formData,
                          locationMode: type.id as any,
                          locationName: newLocation,
                        });
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#0f6b5c] bg-[#e8f3f0]/50 ring-2 ring-[#0f6b5c]/20"
                          : "border-[#d6e7e1] bg-white hover:border-[#0f6b5c]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-extrabold text-[#122622]">{type.label}</span>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#0f6b5c] bg-[#0f6b5c]" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#57685f]">{type.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#57685f]" />
                  <input
                    type="text"
                    required
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    placeholder="e.g., Addis Ababa, Ethiopia or Online / Virtual"
                    className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-9 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>
              </div>

              {formData.locationMode !== "online" && (
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Venue (Optional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-[#57685f]" />
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="e.g., Addis Ababa Science & Technology University"
                      className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-9 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Field / Industry & Tags */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c] flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-[#0f6b5c]" />
              <span>3. Field / Industry & Tags</span>
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Field / Main Industry <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-3 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] cursor-pointer"
                >
                  {FIELD_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {formData.field === "Other" && (
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Specify Field <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customFieldInput}
                    onChange={(e) => setCustomFieldInput(e.target.value)}
                    placeholder="Enter custom field / industry"
                    className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>
              )}
            </div>

            {/* Tags multi-select & custom input */}
            <div>
              <label className="block text-xs font-bold text-[#122622] mb-2 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#0f6b5c]" />
                <span>Tags</span>
              </label>

              {/* Selected Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#0f6b5c] px-2.5 py-1 text-xs font-bold text-white shadow-2xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-full hover:bg-black/20 p-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggested Tag Pills */}
              <div className="rounded-2xl border border-[#d6e7e1] bg-[#f8faf9] p-3">
                <p className="text-[11px] font-bold text-[#57685f] mb-2">
                  Suggested tags (click to toggle):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((sug) => {
                    const isSelected = formData.tags.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveTag(sug);
                          } else {
                            handleAddTag(sug);
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0f6b5c] text-white"
                            : "bg-white border border-[#d6e7e1] text-[#122622] hover:border-[#0f6b5c]"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {sug}
                      </button>
                    );
                  })}
                </div>

                {/* Custom tag input */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(newTagInput);
                      }
                    }}
                    placeholder="Add a custom tag..."
                    className="h-8 flex-1 rounded-xl border border-[#d6e7e1] bg-white px-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(newTagInput)}
                    className="inline-flex h-8 items-center gap-1 rounded-xl bg-[#0f6b5c] px-3 text-xs font-bold text-white hover:bg-[#0b5347] transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Open To / Eligibility */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#0f6b5c]" />
              <span>4. Open To / Eligibility</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#122622] mb-1">
                Who is eligible to participate? <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-[#57685f] mb-3">
                Select specific participant groups or choose Everyone to allow open participation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "ALL" as const,
                    label: "Everyone",
                    desc: "Open to all creators, professionals, and students.",
                  },
                  {
                    id: "UNIVERSITY_STUDENT" as const,
                    label: "University Students",
                    desc: "Undergraduate, graduate, or academic researchers.",
                  },
                  {
                    id: "GOVERNMENT_PUBLIC_SECTOR" as const,
                    label: "Government & Public Sector",
                    desc: "Public servants, ministry officers, and civic innovators.",
                  },
                ].map((item) => {
                  const isSelected = formData.openTo.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOpenToToggle(item.id)}
                      className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#0f6b5c] bg-[#e8f3f0]/50 ring-2 ring-[#0f6b5c]/20"
                          : "border-[#d6e7e1] bg-white hover:border-[#0f6b5c]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-extrabold text-[#122622]">{item.label}</span>
                        <div
                          className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                            isSelected ? "border-[#0f6b5c] bg-[#0f6b5c] text-white" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <CheckCircle className="h-3 w-3" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#57685f]">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Dates & Deadlines */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c]">
              5. Dates & Deadlines
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

          {/* Section 6: Prize & Budget Allocation */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c]">
                6. Prize & Budget Allocation
              </h3>
              <span className="text-[10px] font-semibold text-[#57685f]">
                Automated budget tracking & validation
              </span>
            </div>

            {/* Total Budget & Currency Selector */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Total Prize Budget
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-3 h-4 w-4 text-[#0f6b5c]" />
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.totalPrizeBudget || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalPrizeBudget: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    placeholder="e.g. 10000"
                    className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-9 pr-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value as "ETB" | "USD" })
                  }
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-3 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="ETB">ETB (Ethiopian Birr)</option>
                </select>
              </div>
            </div>

            {/* Tier Distributions */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    1st
                  </span>
                  <label className="text-[11px] font-bold text-[#122622]">
                    1st Place Prize
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.firstPlaceAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstPlaceAmount: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  placeholder="0"
                  className="h-9 w-full rounded-xl border border-amber-300/70 bg-white px-2.5 text-xs font-bold text-[#122622] outline-none focus:border-amber-500"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-400 text-[10px] font-bold text-white">
                    2nd
                  </span>
                  <label className="text-[11px] font-bold text-[#122622]">
                    2nd Place Prize
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.secondPlaceAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondPlaceAmount: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  placeholder="0"
                  className="h-9 w-full rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-bold text-[#122622] outline-none focus:border-slate-500"
                />
              </div>

              <div className="rounded-2xl border border-amber-800/20 bg-amber-900/5 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white">
                    3rd
                  </span>
                  <label className="text-[11px] font-bold text-[#122622]">
                    3rd Place Prize
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.thirdPlaceAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      thirdPlaceAmount: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  placeholder="0"
                  className="h-9 w-full rounded-xl border border-amber-800/30 bg-white px-2.5 text-xs font-bold text-[#122622] outline-none focus:border-amber-700"
                />
              </div>
            </div>

            {/* Live Budget Breakdown & Validation Status */}
            {(() => {
              const totalBudget = Number(formData.totalPrizeBudget) || 0;
              const totalAllocated =
                (Number(formData.firstPlaceAmount) || 0) +
                (Number(formData.secondPlaceAmount) || 0) +
                (Number(formData.thirdPlaceAmount) || 0);
              const remaining = totalBudget - totalAllocated;
              const isOverBudget = totalBudget > 0 && totalAllocated > totalBudget;

              return (
                <div
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-2xl p-3 text-xs ${
                    isOverBudget
                      ? "border border-rose-200 bg-rose-50 text-rose-800"
                      : "border border-[#d6e7e1] bg-[#e8f3f0]/50 text-[#122622]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isOverBudget ? (
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-[#0f6b5c] shrink-0" />
                    )}
                    <div>
                      <span className="font-extrabold">
                        {isOverBudget ? "Budget Over-Allocated: " : "Budget Summary: "}
                      </span>
                      <span>
                        Allocated:{" "}
                        <strong className="font-black">{totalAllocated.toLocaleString()} {formData.currency}</strong>
                        {" of "}
                        <strong className="font-black">{totalBudget.toLocaleString()} {formData.currency}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isOverBudget ? (
                      <span className="font-extrabold text-rose-600">
                        Exceeds by {Math.abs(remaining).toLocaleString()} {formData.currency}
                      </span>
                    ) : (
                      <span className="font-bold text-[#0f6b5c]">
                        {remaining >= 0 ? `${remaining.toLocaleString()} ${formData.currency} unallocated` : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
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
                <span>{isSubmitting ? "Saving..." : initialData ? "Update Hackathon" : "+ Create Hackathon"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
