import React, { useState, useEffect } from 'react';
import { User, Users } from 'lucide-react';

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

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-10 h-10'
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
    if (src.includes('/co.png')) {
      setSrc('https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/couple.png');
    } else {
      setHasFailed(true);
    }
  };

  // Render high-quality vector illustration avatar fallback if image failed or isn't available
  if (hasFailed || !src) {
    const initials = name
      ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'GM';

    return (
      <div 
        id={`avatar-${gender?.toLowerCase() || 'single'}-${name.replace(/\s+/g, '-')}`}
        className={`${sizeClasses} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border shadow-3xs transition-all ${
          gender === 'Female' 
            ? 'bg-gradient-to-br from-rose-100 to-pink-200 border-rose-200 text-rose-700' 
            : gender === 'Couple' 
              ? 'bg-gradient-to-br from-purple-100 to-indigo-200 border-purple-200 text-purple-700' 
              : 'bg-gradient-to-br from-blue-100 to-indigo-200 border-blue-200 text-blue-700'
        }`}
        title={name}
      >
        {gender === 'Couple' ? (
          <Users className={`${iconSizes} stroke-[2.2]`} />
        ) : (
          <User className={`${iconSizes} stroke-[2.2]`} />
        )}
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses} rounded-full overflow-hidden bg-slate-100 border border-slate-200/60 shadow-3xs flex-shrink-0 flex items-center justify-center`} 
      id={`avatar-${gender?.toLowerCase() || 'single'}-${name.replace(/\s+/g, '-')}`}
    >
      <img 
        src={src} 
        alt={name} 
        className="w-full h-full object-cover" 
        referrerPolicy="no-referrer"
        onError={handleError}
      />
    </div>
  );
}

