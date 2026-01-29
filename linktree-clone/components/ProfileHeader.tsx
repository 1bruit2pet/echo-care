import React from 'react';
import Image from 'next/image';

interface ProfileHeaderProps {
  fullName: string;
  bio: string;
  avatarUrl: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ fullName, bio, avatarUrl }) => {
  return (
    <div className="flex flex-col items-center mb-8 animate-fade-in-down">
      <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
        <Image 
          src={avatarUrl} 
          alt={fullName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">{fullName}</h1>
      <p className="text-white/80 text-center max-w-md leading-relaxed">{bio}</p>
    </div>
  );
};

export default ProfileHeader;
