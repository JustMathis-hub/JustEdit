'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, X, Check, Loader2 } from 'lucide-react';
import { AVATARS, getAvatarSrc } from '@/lib/avatarConfig';
import type { Profile } from '@/types';

interface ProfileEditorProps {
  profile: Profile | null;
  email: string;
  memberSince: string;
  purchaseCount: number;
}

export function ProfileEditor({ profile, email, memberSince, purchaseCount }: ProfileEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    profile?.avatar_url ?? getAvatarSrc(null)
  );
  const [saving, setSaving] = useState(false);

  const displayName = profile?.full_name || email.split('@')[0];
  const currentAvatar = getAvatarSrc(profile?.avatar_url);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, avatar_url: selectedAvatar }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur');
      toast.success('Profil mis à jour');
      setIsEditing(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(profile?.full_name ?? '');
    setSelectedAvatar(profile?.avatar_url ?? getAvatarSrc(null));
    setIsEditing(false);
  }

  return (
    <div className="w-full">
      {/* ── Banner row ── */}
      <div className="flex items-center gap-5 sm:gap-6">

        {/* Avatar */}
        <div className="profile-avatar-ring shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5">
          <div className="w-full h-full rounded-full overflow-hidden bg-[oklch(0.08_0_0)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isEditing ? selectedAvatar : currentAvatar}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23111'/%3E%3Ccircle cx='40' cy='32' r='13' fill='%23282828'/%3E%3Cellipse cx='40' cy='76' rx='22' ry='16' fill='%23282828'/%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
            {displayName}
          </h2>
          <p className="text-[13px] text-[oklch(0.45_0.005_0)] truncate mt-0.5">{email}</p>
        </div>

        {/* Stats + edit button — right side */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <span className="text-[11px] px-3 py-1.5 rounded-full bg-[oklch(0.13_0_0)] border border-[oklch(0.20_0_0)] text-[oklch(0.50_0.005_0)] whitespace-nowrap">
            Membre depuis {memberSince}
          </span>
          <span className="text-[11px] px-3 py-1.5 rounded-full bg-[oklch(0.13_0_0)] border border-[oklch(0.20_0_0)] text-[oklch(0.50_0.005_0)] whitespace-nowrap">
            {purchaseCount} pack{purchaseCount !== 1 ? 's' : ''}
          </span>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-[oklch(0.22_0_0)] bg-[oklch(0.13_0_0)] text-[oklch(0.55_0.005_0)] hover:border-[rgba(139,26,26,0.5)] hover:text-white transition-all duration-200 whitespace-nowrap"
            >
              <Pencil size={11} />
              Modifier
            </button>
          )}
          {isEditing && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-[oklch(0.22_0_0)] text-[oklch(0.45_0.005_0)] hover:text-white transition-colors"
            >
              <X size={11} /> Annuler
            </button>
          )}
        </div>
      </div>

      {/* Mobile stats + button */}
      <div className="flex sm:hidden items-center gap-2 mt-3 flex-wrap">
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[oklch(0.13_0_0)] border border-[oklch(0.20_0_0)] text-[oklch(0.50_0.005_0)]">
          Membre depuis {memberSince}
        </span>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[oklch(0.13_0_0)] border border-[oklch(0.20_0_0)] text-[oklch(0.50_0.005_0)]">
          {purchaseCount} pack{purchaseCount !== 1 ? 's' : ''}
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border border-[oklch(0.22_0_0)] bg-[oklch(0.13_0_0)] text-[oklch(0.55_0.005_0)] hover:border-[rgba(139,26,26,0.5)] hover:text-white transition-all"
          >
            <Pencil size={10} /> Modifier
          </button>
        ) : (
          <button onClick={handleCancel} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-[oklch(0.22_0_0)] text-[oklch(0.45_0.005_0)] hover:text-white transition-colors">
            <X size={10} /> Annuler
          </button>
        )}
      </div>

      {/* ── Edit panel ── */}
      {isEditing && (
        <div className="mt-5 pt-5 border-t border-[oklch(0.18_0_0)]">
          <div className="flex flex-col sm:flex-row gap-6">

            {/* Avatar grid */}
            <div className="shrink-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[oklch(0.38_0.005_0)] mb-2.5">
                Avatar
              </p>
              <div className="grid grid-cols-6 sm:grid-cols-3 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.src)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                      selectedAvatar === av.src
                        ? 'border-[#c0392b] shadow-[0_0_10px_rgba(192,57,43,0.5)]'
                        : 'border-[oklch(0.20_0_0)] hover:border-[oklch(0.30_0_0)]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={av.src}
                      alt={av.label}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        const fallback = el.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-[oklch(0.12_0_0)] items-center justify-center text-[oklch(0.35_0.005_0)] text-[9px] hidden">
                      {av.id}
                    </div>
                    {selectedAvatar === av.src && (
                      <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#c0392b] flex items-center justify-center">
                        <Check size={8} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name + save */}
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[oklch(0.38_0.005_0)] mb-2">
                  Nom affiché
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ton nom..."
                  maxLength={40}
                  className="w-full px-3 py-2.5 rounded-lg bg-[oklch(0.08_0_0)] border border-[oklch(0.22_0_0)] text-white text-sm placeholder:text-[oklch(0.35_0.005_0)] focus:outline-none focus:border-[rgba(139,26,26,0.6)] transition-colors"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg bg-[#8b1a1a] hover:bg-[#a52020] text-white text-sm font-semibold transition-colors disabled:opacity-60 self-start"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
