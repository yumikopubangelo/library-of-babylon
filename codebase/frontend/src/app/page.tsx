'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";

type Creator = {
  id: string;
  name: string;
  worksCount: number;
  completeness: number;
};

// SVG Icon Components
const UserGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.226a11.96 11.96 0 0 1-2.61-3.321m2.61 3.321a11.96 11.96 0 0 0-2.61 3.321M3 16.5v-1.5A2.25 2.25 0 0 1 5.25 12.75h5.25a2.25 2.25 0 0 1 2.25 2.25v1.5m-9.75-5.873A5.625 5.625 0 0 1 9 5.625c1.355 0 2.59.562 3.5 1.473m-6.036 4.356a5.625 5.625 0 0 1 9.75 0m-9.75 0V12.75m9.75 0V12.75m0 3.75v-1.5m-9.75 0h9.75M9 11.25c-1.24 0-2.25-.933-2.25-2.083s1.01-2.083 2.25-2.083 2.25.933 2.25 2.083-1.01 2.083-2.25 2.083Z" />
  </svg>
);

const ArchiveBoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


export default function Home() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [totalWorks, setTotalWorks] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/creator", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        const creatorList = data.creators || [];
        setCreators(creatorList);
        setTotalWorks(creatorList.reduce((sum: number, c: Creator) => sum + c.worksCount, 0));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const featuredCreator = creators.find(c => c.id === "Hoshimachi_Suisei");
  
  // Calculate days since a specific date (e.g., project genesis)
  const getDaysSinceGenesis = () => {
    const genesisDate = new Date("2023-01-01"); // Example date
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - genesisDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };


  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-blue-900/30 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-purple-900/30 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center pt-16 pb-24">
          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Library of Babylon
          </h1>
          <p 
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            A digital archive dedicated to preserving the works of digital creators for future generations.
          </p>

          <form 
            onSubmit={handleSearch} 
            className="max-w-2xl mx-auto animate-fade-in-up" 
            style={{ animationDelay: '0.6s' }}
          >
            <div className="relative">
              <input
                type="search"
                name="search"
                placeholder="Search for a song, artist, or lyric..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-full px-6 py-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all backdrop-blur-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-full font-semibold text-lg transition-all transform hover:scale-105">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-5xl mx-auto">
          <StatCard
            icon={<UserGroupIcon />}
            title="Creators Archived"
            value={loading ? '...' : creators.length}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<ArchiveBoxIcon />}
            title="Works Preserved"
            value={loading ? '...' : totalWorks}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<ClockIcon />}
            title="Days Since Genesis"
            value={getDaysSinceGenesis()}
            gradient="from-orange-500 to-red-500"
          />
        </section>

        {/* Featured Creator */}
        {featuredCreator && (
          <section className="max-w-5xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-8">Featured Creator</h2>
            <CreatorCard
              name={featuredCreator.name}
              description="A pioneering VTuber known for her exceptional music and performances. Her works blend powerful vocals with meaningful lyrics, creating timeless pieces of digital culture."
              worksCount={featuredCreator.worksCount}
              completeness={featuredCreator.completeness}
              href={`/creator/${featuredCreator.id}`}
            />
          </section>
        )}

        {/* CTA */}
        <section className="text-center">
            <Link
                href="/creators"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
                <span>Or browse all creators</span>
                <span className="text-xl">→</span>
            </Link>
        </section>
      </div>
    </main>
  );
}

/* ------------------ COMPONENTS ------------------ */

type StatCardProps = {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  gradient: string;
};

function StatCard({ title, value, icon, gradient }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all hover:shadow-xl hover:-translate-y-1 group">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="text-gray-500 group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
        <div>
            <div className={`text-4xl font-bold mb-1 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {value}
            </div>
            <div className="text-gray-400">{title}</div>
        </div>
      </div>
    </div>
  );
}

type CreatorCardProps = {
  name: string;
  description: string;
  worksCount: number;
  completeness: number;
  href: string;
};

function CreatorCard({
  name,
  description,
  worksCount,
  completeness,
  href,
}: CreatorCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <Link href={href}>
      <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-[1.01]">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Creator Image */}
          <div className="w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/30 transition-all">
              <img
                src="/api/image?path=creators/Hoshimachi_Suisei/outfit/suisei.png"
                alt={name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-3xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
              {name.replace(/_/g, " ")}
            </h3>

            <p className="text-gray-400 mb-6 leading-relaxed max-w-lg mx-auto md:mx-0">
              {description}
            </p>

            {/* Progress Bar */}
            <div className="max-w-sm mx-auto md:mx-0">
              <div className="flex justify-between items-center text-gray-400 mb-2">
                  <span>Archive Completeness</span>
                  <span className="font-semibold text-white">{Math.round(completeness * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completeness * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
