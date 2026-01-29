import { getProfile } from '@/lib/data';
import ProfileHeader from '@/components/ProfileHeader';
import LinkCard from '@/components/LinkCard';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: { username: string }
};

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const profile = await getProfile(params.username);
 
  if (!profile) {
    return {
      title: 'Profile Not Found',
    };
  }
 
  return {
    title: `${profile.fullName} | LinkTree Clone`,
    description: profile.bio,
    openGraph: {
      images: [profile.avatarUrl],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const profile = await getProfile(params.username);

  if (!profile) {
    notFound();
  }

  // Theme map to Tailwind classes
  const themeClasses = {
    light: 'bg-gray-100 text-gray-900',
    dark: 'bg-gray-900 text-white',
    blue: 'bg-gradient-to-br from-blue-900 to-slate-900 text-white',
    custom: 'bg-black text-white' // Fallback
  };

  const currentTheme = themeClasses[profile.theme] || themeClasses.dark;

  return (
    <main className={`min-h-screen w-full flex flex-col items-center py-16 px-4 ${currentTheme}`}>
      <div className="max-w-md w-full">
        <ProfileHeader 
          fullName={profile.fullName} 
          bio={profile.bio} 
          avatarUrl={profile.avatarUrl} 
        />
        
        <div className="w-full space-y-4">
          {profile.links.map((link) => (
            <LinkCard key={link.id} link={link} username={profile.username} />
          ))}
        </div>

        <footer className="mt-16 text-center text-sm opacity-50">
          <p>© {new Date().getFullYear()} LinkTree Clone</p>
        </footer>
      </div>
    </main>
  );
}
