import React from 'react';

interface AvatarProps {
  photoUrl?: string;
  gender?: 'Male' | 'Female' | 'Couple';
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const MALE_AVATAR = 'https://api.dicebear.com/7.x/lorelei/svg?seed=Felix';
export const FEMALE_AVATAR = 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aneka';
export const COUPLE_AVATAR = 'https://api.dicebear.com/7.x/lorelei/svg?seed=Couple';

const COUPLE_MALE = 'https://api.dicebear.com/7.x/lorelei/svg?seed=Jack';
const COUPLE_FEMALE = 'https://api.dicebear.com/7.x/lorelei/svg?seed=Lily';

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

  const isCouple = gender === 'Couple' || (photoUrl && photoUrl.includes('Couple'));

  if (isCouple) {
    return (
      <div className={`relative ${sizeClasses} flex-shrink-0 flex items-center justify-center`} id={`avatar-couple-${name.replace(/\s+/g, '-')}`}>
        {/* Left/Back Avatar (Male) */}
        <div className="absolute left-0 bottom-0 w-[65%] h-[65%] rounded-full overflow-hidden border-2 border-white bg-blue-50 shadow-xs">
          <img 
            src={COUPLE_MALE} 
            alt="Male Partner" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Right/Front Avatar (Female) */}
        <div className="absolute right-0 top-0 w-[65%] h-[65%] rounded-full overflow-hidden border-2 border-white bg-pink-50 shadow-xs">
          <img 
            src={COUPLE_FEMALE} 
            alt="Female Partner" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  // Cute single avatar
  const defaultPhoto = gender === 'Female' ? FEMALE_AVATAR : MALE_AVATAR;
  const finalPhotoUrl = photoUrl || defaultPhoto;

  return (
    <div className={`${sizeClasses} rounded-full overflow-hidden bg-gray-50 border border-gray-100 shadow-2xs flex-shrink-0`} id={`avatar-single-${name.replace(/\s+/g, '-')}`}>
      {finalPhotoUrl ? (
        <img 
          src={finalPhotoUrl} 
          alt={name} 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className={`w-full h-full bg-indigo-50 text-brand-primary flex items-center justify-center font-bold ${fontClasses}`}>
          {name.split(' ').map(n => n[0]).join('')}
        </div>
      )}
    </div>
  );
}
