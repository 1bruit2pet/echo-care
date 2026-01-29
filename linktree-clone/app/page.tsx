import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col">
        <h1 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
          LinkTree Clone
        </h1>
        <p className="text-xl mb-12 text-center max-w-2xl text-gray-300">
          A performant, serverless-ready link sharing platform. 
          Built with Next.js 14, Tailwind CSS, and optimized for speed.
        </p>

        <div className="flex gap-4">
          <Link 
            href="/demo" 
            className="px-8 py-4 bg-white text-purple-900 rounded-full font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
          >
            View Demo Profile
          </Link>
          <button className="px-8 py-4 border border-white/30 bg-white/10 rounded-full font-bold hover:bg-white/20 transition backdrop-blur-sm">
            Create Yours (Soon)
          </button>
        </div>
      </div>
    </main>
  );
}
