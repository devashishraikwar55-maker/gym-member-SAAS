import React, { useState, useEffect } from 'react';

interface AvatarProps {
  photoUrl?: string;
  gender?: 'Male' | 'Female' | 'Couple';
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const MALE_AVATAR = 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/male.png';
export const FEMALE_AVATAR = 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/female.png';
export const COUPLE_AVATAR = 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/couple.png';

export function Avatar({ photoUrl, gender, name, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20'
  }[size];

  const fontClasses = {
    xs: 'text-[9px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-2xl'
  }[size];

  // Resolve default avatar based on gender/category
  let defaultPhoto = MALE_AVATAR;
  if (gender === 'Female') {
    defaultPhoto = FEMALE_AVATAR;
  } else if (gender === 'Couple') {
    defaultPhoto = COUPLE_AVATAR;
  }

  const finalPhotoUrl = photoUrl || defaultPhoto;
  
  // Stateful image source with fallback handlers
  const [src, setSrc] = useState(finalPhotoUrl);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setSrc(finalPhotoUrl);
    setHasFailed(false);
  }, [finalPhotoUrl]);

  const handleError = () => {
    if (hasFailed) return; // Prevent infinite error loops

    if (src.includes('/co.png')) {
      setSrc('https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/couple.png');
      setHasFailed(true);
    } else if (src.includes('/couple.png')) {
      setSrc('https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/co.png');
      setHasFailed(true);
    }
  };

  return (
    <div className={`${sizeClasses} rounded-full overflow-hidden bg-white border border-slate-200/60 shadow-3xs flex-shrink-0 flex items-center justify-center`} id={`avatar-${gender?.toLowerCase() || 'single'}-${name.replace(/\s+/g, '-')}`}>
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      ) : (
        <div className={`w-full h-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold ${fontClasses}`}>
          {name.split(' ').map(n => n[0]).join('')}
        </div>
      )}
    </div>
  );
}
