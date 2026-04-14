"use client";

import { useState, useRef, useEffect } from "react";

interface ProfileDetails {
  name: string;
  email: string;
  role: "user" | "admin";
  access: "Full" | "Limited";
  department: string;
  location: string;
  bio: string;
  photo: string;
}

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
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDetails>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDetails>(DEFAULT_PROFILE);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoMenuRef = useRef<HTMLDivElement>(null);

  // Hydration-safe localStorage load
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
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target as Node)) {
        setPhotoMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startEdit = () => { setDraft({ ...profile }); setEditing(true); };
  const cancelEdit = () => { setDraft({ ...profile }); setEditing(false); setPhotoMenuOpen(false); stopWebcam(); };
  const saveEdit = () => {
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
    reader.onload = (ev) => setDraft((d) => ({ ...d, photo: ev.target?.result as string }));
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

  return (
    <div className="min-h-screen bg-[#0d0d12] flex items-start justify-center px-4 py-12 font-sans text-[#e8e8f0]">
      <div className="w-full max-w-2xl bg-[#13131a] border border-[#1e1e2e] rounded-3xl overflow-hidden">

        {/* Banner */}
        <div className="h-28 bg-linear-to-br from-[#1a1040] via-[#0e1a3a] to-[#0a1a28] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-60"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
        </div>

        <div className="px-6 md:px-9 pb-9">
          {/* Avatar row */}
          <div className="flex flex-wrap items-end gap-4 -mt-11 mb-7">
            {/* Avatar */}
            <div className="relative shrink-0" ref={photoMenuRef}>
              <div className="w-22 h-22 rounded-full border-[3px] border-[#13131a] bg-gradient-to-br from-[#2d1b69] to-[#1a3a6b] flex items-center justify-center text-2xl font-bold text-purple-300 overflow-hidden w-[88px] h-[88px]">
                {currentPhoto
                  ? <img src={currentPhoto} alt="avatar" className="w-full h-full object-cover" />
                  : <span>{getInitials(currentName)}</span>
                }
              </div>
              {editing && (
                <button
                  onClick={() => setPhotoMenuOpen((p) => !p)}
                  className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-violet-600 border-2 border-[#fbfbfb] flex items-center justify-center hover:bg-violet-500 transition-colors"
                >
                  <svg className="w-3 h-3 fill-white" viewBox="0 0 16 16"><path d="M11.5 1.5a2.121 2.121 0 013 3L5 14H1v-4L11.5 1.5z" /></svg>
                </button>
              )}
              {photoMenuOpen && (
                <div className="absolute top-full mt-2 left-0 bg-[#1c1c28] border border-[#2a2a3e] rounded-2xl overflow-hidden min-w-[200px] z-50 shadow-2xl">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-3 text-sm text-left text-[#c8c8e0] hover:bg-[#242436] hover:text-white flex items-center gap-2.5 transition-colors">
                    <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                    Upload from device
                  </button>
                  <button onClick={openWebcam} className="w-full px-4 py-3 text-sm text-left text-[#c8c8e0] hover:bg-[#242436] hover:text-white flex items-center gap-2.5 border-t border-[#1e1e2e] transition-colors">
                    <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
                    Take a photo
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0 pb-1.5">
              {/* <div className="text-xl md:text-2xl font-bold text-[#f0f0ff] truncate z-90">{currentName}</div> */}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${currentRole === "admin" ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : "bg-sky-500/15 text-sky-300 border-sky-500/25"}`}>
                  {currentRole}
                </span>
                <span className="text-sm text-[#555570]">{currentDept}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 items-end pb-1.5 ml-auto">
              {!editing ? (
                <button onClick={startEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/25 transition-colors">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M11.5 1.5a2.121 2.121 0 013 3L5 14H1v-4L11.5 1.5z" /></svg>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={cancelEdit} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#888] border border-[#2a2a3e] hover:text-[#ccc] hover:border-[#444] transition-colors">Cancel</button>
                  <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg shadow-violet-900/40">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M13.5 2L6 11 2.5 7.5 1 9l5 5 9-11z" /></svg>
                    Save
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#1e1e2e] to-transparent mb-6" />

          {/* Fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {([ ["Full Name", "name", "text"], ["Email Address", "email", "email"], ] as const).map(([label, field, type]) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-widest text-[#555570]">{label}</label>
                {editing
                  ? <input type={type} value={draft[field]} onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))} className="bg-[#0d0d12] border border-[#2a2a3e] rounded-xl text-[#e8e8f0] text-sm px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 transition" />
                  : <span className="text-[15px] text-[#d0d0e8]">{profile[field]}</span>
                }
              </div>
            ))}

            {([ ["Role", "role", ["user", "admin"]], ["Access Level", "access", ["Full", "Limited"]], ] as const).map(([label, field, options]) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-widest text-[#555570]">{label}</label>
                {editing
                  ? <select value={draft[field]} onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value as never }))} className="bg-[#0d0d12] border border-[#2a2a3e] rounded-xl text-[#e8e8f0] text-sm px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 transition appearance-none">
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  : <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full border w-fit ${field === "role" ? "bg-violet-500/15 text-violet-300 border-violet-500/25" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"}`}>{profile[field]}</span>
                }
              </div>
            ))}

            {(["Department", "Location"] as const).map((label) => {
              const field = label.toLowerCase() as "department" | "location";
              return (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-widest text-[#555570]">{label}</label>
                  {editing
                    ? <input value={draft[field]} onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))} className="bg-[#0d0d12] border border-[#2a2a3e] rounded-xl text-[#e8e8f0] text-sm px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 transition" />
                    : <span className="text-[15px] text-[#d0d0e8]">{profile[field]}</span>
                  }
                </div>
              );
            })}

            {/* Bio - full width */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-widest text-[#555570]">Bio</label>
              {editing
                ? <textarea value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} className="bg-[#0d0d12] border border-[#2a2a3e] rounded-xl text-[#e8e8f0] text-sm px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 transition resize-y min-h-[72px]" />
                : <span className="text-[15px] text-[#d0d0e8]">{profile.bio}</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Webcam Modal */}
      {webcamOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#13131a] border border-[#2a2a3e] rounded-2xl p-7 w-[90%] max-w-md">
            <div className="text-lg font-bold text-[#f0f0ff] mb-4">Take a Photo</div>
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black aspect-[4/3] object-cover" />
            <div className="flex gap-2.5 justify-end mt-4">
              <button onClick={stopWebcam} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#888] border border-[#2a2a3e] hover:text-[#ccc] hover:border-[#444] transition-colors">Cancel</button>
              <button onClick={capturePhoto} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M20 6h-2.2c-.4-1.1-1.5-2-2.8-2H9c-1.3 0-2.4.9-2.8 2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2z" /></svg>
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}