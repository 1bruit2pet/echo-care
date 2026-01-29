// Simulation of database types
export type Link = {
  id: string;
  title: string;
  url: string;
  icon?: string; // lucid-react icon name or url
  clicks: number;
};

export type Profile = {
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  theme: 'light' | 'dark' | 'blue' | 'custom';
  links: Link[];
};

// Mock Database
const MOCK_DB: Record<string, Profile> = {
  'demo': {
    username: 'demo',
    fullName: 'Demo User',
    bio: 'Full Stack Developer | Jamstack Enthusiast',
    avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    theme: 'dark',
    links: [
      { id: '1', title: 'Portfolio', url: 'https://example.com', clicks: 120, icon: 'Globe' },
      { id: '2', title: 'GitHub', url: 'https://github.com', clicks: 85, icon: 'Github' },
      { id: '3', title: 'Twitter', url: 'https://twitter.com', clicks: 200, icon: 'Twitter' },
      { id: '4', title: 'LinkedIn', url: 'https://linkedin.com', clicks: 150, icon: 'Linkedin' },
    ]
  },
  'gemini': {
    username: 'gemini',
    fullName: 'Gemini AI',
    bio: 'Creating the future of AI.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Gemini+AI&background=0d9488&color=fff',
    theme: 'blue',
    links: [
      { id: '1', title: 'Official Website', url: 'https://deepmind.google/technologies/gemini/', clicks: 5000 },
      { id: '2', title: 'Documentation', url: 'https://ai.google.dev/', clicks: 1200 },
    ]
  }
};

export async function getProfile(username: string): Promise<Profile | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_DB[username.toLowerCase()] || null;
}

export async function incrementClick(username: string, linkId: string) {
  // In a real app, this would perform a database update
  console.log(`Click recorded for ${username} on link ${linkId}`);
}
