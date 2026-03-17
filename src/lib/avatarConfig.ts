export interface AvatarOption {
  id: string;
  src: string;
  label: string;
}

export const AVATARS: AvatarOption[] = [
  { id: 'avatar-1', src: '/images/avatars/avatar-1.png', label: 'Avatar 1' },
  { id: 'avatar-2', src: '/images/avatars/avatar-2.png', label: 'Avatar 2' },
  { id: 'avatar-3', src: '/images/avatars/avatar-3.png', label: 'Avatar 3' },
  { id: 'avatar-4', src: '/images/avatars/avatar-4.png', label: 'Avatar 4' },
  { id: 'avatar-5', src: '/images/avatars/avatar-5.png', label: 'Avatar 5' },
  { id: 'avatar-6', src: '/images/avatars/avatar-6.png', label: 'Avatar 6' },
];

export const DEFAULT_AVATAR = AVATARS[0].src;

export function getAvatarSrc(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) return DEFAULT_AVATAR;
  // If it's already a full path, use it directly
  return avatarUrl;
}
