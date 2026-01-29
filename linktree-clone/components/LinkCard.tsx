'use client';

import React from 'react';
import { Link as LinkType } from '@/lib/data';
import * as Icons from 'lucide-react';

interface LinkCardProps {
  link: LinkType;
  username: string;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, username }) => {
  // Dynamic Icon rendering
  // @ts-ignore
  const IconComponent = link.icon && Icons[link.icon] ? Icons[link.icon] : Icons.Link;

  const handleClick = () => {
    // Call analytics endpoint or function here
    console.log('Navigating to:', link.url);
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-center p-4 mb-4 w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg group"
    >
      <div className="p-2 bg-white/10 rounded-full mr-4 text-white group-hover:text-blue-300 transition-colors">
        <IconComponent size={20} />
      </div>
      <div className="flex-1 text-center pr-10">
        <span className="font-medium text-white text-lg">{link.title}</span>
      </div>
    </a>
  );
};

export default LinkCard;
