"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { z } from "zod";
import Link from "next/link";
import { usePathname } from "next/navigation";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[A-Za-z\s]+$/, "Name must contain only alphabets"),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["user", "admin"], "Role must be 'user' or 'admin'"),
  access: z.enum(["Full", "Limited"], "Access must be 'Full' or 'Limited'"),
  department: z
    .string()
    .min(1, "Department is required")
    .regex(/^[A-Za-z\s]+$/, "Department must contain only alphabets"),
  location: z
    .string()
    .min(1, "Location is required")
    .regex(/^[A-Za-z\s,]+$/, "Location must contain only alphabets"),
  bio: z.string(),
  photo: z.string(),
});

type ProfileDetails = z.infer<typeof profileSchema>;
type ValidationErrors = Partial<Record<keyof ProfileDetails, string>>;

const DEFAULT_PROFILE: ProfileDetails = {
  name: "Alex Morgan",
  email: "alex.morgan@company.com",
  role: "admin",
  access: "Full",
  department: "Engineering",
  location: "San Francisco, CA",
  bio: "Building great products and leading teams.",
  photo: "",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

// ----------------------------------------------------------------------
// Breadcrumb Component (inline, styled nicely)
// ----------------------------------------------------------------------
function ProfileBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);

  if (pathname === "/") return null;

  return (
    <nav className="mb-5" aria-label="breadcrumb">
      <ul className="flex items-center flex-wrap text-sm">
        <li className="text-gray-500 transition-colors hover:text-violet-600">
          <Link href="/" className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </Link>
        </li>
        {paths.map((link, index) => {
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isActive = pathname === href;
          const isLast = index === paths.length - 1;
          const displayName = link.charAt(0).toUpperCase() + link.slice(1);

          return (
            <Fragment key={index}>
              <li className="mx-2 text-gray-400 select-none">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </li>
              <li>
                {isActive || isLast ? (
                  <span className="font-medium text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full text-xs">
                    {displayName}
                  </span>
                ) : (
                  <Link href={href} className="text-gray-500 transition-colors hover:text-violet-600">
                    {displayName}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDetails>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDetails>(DEFAULT_PROFILE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("profileDetails");
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfile(parsed);
      setDraft(parsed);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        photoMenuRef.current &&
        !photoMenuRef.current.contains(e.target as Node)
      ) {
        setPhotoMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startEdit = () => {
    setDraft({ ...profile });
    setErrors({});
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft({ ...profile });
    setErrors({});
    setEditing(false);
    setPhotoMenuOpen(false);
    stopWebcam();
  };

  const saveEdit = () => {
    const result = profileSchema.safeParse(draft);
    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      result.error.issues.forEach((err) => {
        const key = err.path[0] as keyof ProfileDetails;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setProfile(draft);
    localStorage.setItem("profileDetails", JSON.stringify(draft));
    setEditing(false);
    setSaved(true);
    stopWebcam();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setDraft((d) => ({ ...d, photo: ev.target?.result as string }));
    reader.readAsDataURL(file);
    setPhotoMenuOpen(false);
  };

  const openWebcam = async () => {
    setPhotoMenuOpen(false);
    setWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert("Camera access denied or unavailable.");
      setWebcamOpen(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setDraft((d) => ({ ...d, photo: canvas.toDataURL("image/png") }));
    stopWebcam();
  };

  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setWebcamOpen(false);
  };

  const currentPhoto = editing ? draft.photo : profile.photo;
  const currentName = editing ? draft.name : profile.name;
  const currentRole = editing ? draft.role : profile.role;
  const currentDept = editing ? draft.department : profile.department;

  if (!mounted) return null;

  // ─── Shared input class ──────────────────────────────────────────────────────
  const inputCls = (field: keyof ProfileDetails) =>
    `bg-[#f8f8fc] border rounded-xl text-[#1a1a2e] text-sm px-3 py-2.5 outline-none transition w-full ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-[#d8d8ea] focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
    }`;

  return (
    <div className="h-fit bg-[#f4f4f7] flex items-start justify-center px-4 py-12 font-sans text-[#1a1a2e]">
      <div className="w-full max-w-2xl">
        {/* Breadcrumb placed just above the card */}
        <ProfileBreadcrumb />

        {/* Card */}
        <div className="bg-white border border-[#e0e0ee] rounded-3xl overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-28 bg-linear-to-br from-[#ddd8f8] via-[#c8d8f8] to-[#b8d8f0] relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(90,70,200,0.18) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="px-6 md:px-9 pb-9">
            {/* Avatar row */}
            <div className="flex flex-wrap items-end gap-4 -mt-11 mb-7 relative z-10">
              {/* Avatar */}
              <div className="relative shrink-0" ref={photoMenuRef}>
                <div className="rounded-full border-[3px] border-white bg-linear-to-br from-[#ede8ff] to-[#dceeff] flex items-center justify-center text-2xl font-bold text-violet-600 overflow-hidden w-22 h-22">
                  {currentPhoto ? (
                    <img
                      src={currentPhoto}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(currentName)}</span>
                  )}
                </div>
                {editing && (
                  <button
                    onClick={() => setPhotoMenuOpen((p) => !p)}
                    className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-violet-600 border-2 border-white flex items-center justify-center hover:bg-violet-500 transition-colors"
                  >
                    <svg className="w-3 h-3 fill-white" viewBox="0 0 16 16">
                      <path d="M11.5 1.5a2.121 2.121 0 013 3L5 14H1v-4L11.5 1.5z" />
                    </svg>
                  </button>
                )}
                {photoMenuOpen && (
                  <div className="absolute top-full mt-2 left-0 bg-white border border-[#e0e0ee] rounded-2xl overflow-hidden min-w-50 z-50 shadow-lg">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 text-sm text-left text-[#444460] hover:bg-[#f4f4f7] flex items-center gap-2.5 transition-colors"
                    >
                      <svg className="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                      Upload from device
                    </button>
                    <button
                      onClick={openWebcam}
                      className="w-full px-4 py-3 text-sm text-left text-[#444460] hover:bg-[#f4f4f7] flex items-center gap-2.5 border-t border-[#e8e8f4] transition-colors"
                    >
                      <svg className="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 7l-7 5 7 5V7z" />
                        <rect x="1" y="5" width="15" height="14" rx="2" />
                      </svg>
                      Take a photo
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Name + role */}
              <div className="flex-1 min-w-0 pb-1.5">
                <div className="text-xl md:text-2xl font-bold text-[#1a1a2e] truncate">
                  {currentName}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${
                      currentRole === "admin"
                        ? "bg-violet-100 text-violet-700 border-violet-200"
                        : "bg-sky-100 text-sky-700 border-sky-200"
                    }`}
                  >
                    {currentRole}
                  </span>
                  <span className="text-sm text-[#8888a0]">{currentDept}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 items-end pb-1.5 ml-auto">
                {saved && (
                  <span className="text-xs text-emerald-600 font-medium self-center px-2">
                    ✓ Saved
                  </span>
                )}
                {!editing ? (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-violet-700 bg-violet-100 border border-violet-200 hover:bg-violet-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M11.5 1.5a2.121 2.121 0 013 3L5 14H1v-4L11.5 1.5z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-[#666] border border-[#d8d8ea] hover:text-[#333] hover:border-[#bbb] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.5 2L6 11 2.5 7.5 1 9l5 5 9-11z" />
                      </svg>
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-linear-to-r from-transparent via-[#d8d8ea] to-transparent mb-6" />

            {/* Fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[#9999b0]">
                  Full Name
                </label>
                {editing ? (
                  <>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                      className={inputCls("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </>
                ) : (
                  <span className="text-[15px] text-[#333350]">{profile.name}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[#9999b0]">
                  Email Address
                </label>
                {editing ? (
                  <>
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, email: e.target.value }))
                      }
                      className={inputCls("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                  </>
                ) : (
                  <span className="text-[15px] text-[#333350]">{profile.email}</span>
                )}
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[#9999b0]">
                  Role
                </label>
                {editing ? (
                  <>
                    <select
                      value={draft.role}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          role: e.target.value as "user" | "admin",
                        }))
                      }
                      className={inputCls("role") + " appearance-none"}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    {errors.role && (
                      <p className="text-xs text-red-500">{errors.role}</p>
                    )}
                  </>
                ) : (
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full border w-fit bg-violet-100 text-violet-700 border-violet-200">
                    {profile.role}
                  </span>
                )}
              </div>

              {/* Access */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[#9999b0]">
                  Access Level
                </label>
                {editing ? (
                  <>
                    <select
                      value={draft.access}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          access: e.target.value as "Full" | "Limited",
                        }))
                      }
                      className={inputCls("access") + " appearance-none"}
                    >
                      <option value="Full">Full</option>
                      <option value="Limited">Limited</option>
                    </select>
                    {errors.access && (
                      <p className="text-xs text-red-500">{errors.access}</p>
                    )}
                  </>
                ) : (
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full border w-fit bg-emerald-50 text-emerald-700 border-emerald-200">
                    {profile.access}
                  </span>
                )}
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[#9999b0]">
                  Department
                </label>
                {editing ? (
                  <>
                    <input
                      value={draft.department}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, department: e.target.value }))
                      }
                      className={inputCls("department")}
                    />
                    {errors.department && (
                      <p className="text-xs text-red-500">{errors.department}</p>
                    )}
                  </>
                ) : (
                  <span className="text-[15px] text-[#333350]">{profile.department}</span>
                )}
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[#9999b0]">
                  Location
                </label>
                {editing ? (
                  <>
                    <input
                      value={draft.location}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, location: e.target.value }))
                      }
                      className={inputCls("location")}
                    />
                    {errors.location && (
                      <p className="text-xs text-red-500">{errors.location}</p>
                    )}
                  </>
                ) : (
                  <span className="text-[15px] text-[#333350]">{profile.location}</span>
                )}
              </div>

              {/* Bio */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[#9999b0]">
                  Bio
                </label>
                {editing ? (
                  <textarea
                    value={draft.bio}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, bio: e.target.value }))
                    }
                    className="bg-[#f8f8fc] border border-[#d8d8ea] rounded-xl text-[#1a1a2e] text-sm px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition resize-y min-h-18 w-full"
                  />
                ) : (
                  <span className="text-[15px] text-[#333350]">{profile.bio}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {webcamOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border border-[#e0e0ee] rounded-2xl p-7 w-[90%] max-w-md shadow-xl">
            <div className="text-lg font-bold text-[#1a1a2e] mb-4">Take a Photo</div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-xl bg-black aspect-4/3 object-cover"
            />
            <div className="flex gap-2.5 justify-end mt-4">
              <button
                onClick={stopWebcam}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#666] border border-[#d8d8ea] hover:text-[#333] hover:border-[#bbb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M20 6h-2.2c-.4-1.1-1.5-2-2.8-2H9c-1.3 0-2.4.9-2.8 2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2z" />
                </svg>
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}