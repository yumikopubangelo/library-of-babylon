'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent, ReactNode } from "react";
import CreatorCard from "@/components/CreatorCard";

type Creator = {
  id: string;
  name: string;
  worksCount: number;
  completeness: number;
  description?: string;
};

// --- Re-integrating Components into page.tsx ---

type StatCardProps = {
  title: string;
  value: number | string;
  icon?: ReactNode;
};

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-lapis-glass border border-babylon-gold-600/10 p-6 text-center transition-all hover:border-babylon-gold-600/20 hover:-translate-y-1">
      {icon && (
        <div className="text-4xl mb-4 opacity-70">
          {icon}
        </div>
      )}
      <div className="text-5xl font-bold text-gold-gradient mb-2">
        {value}
      </div>
      <div className="text-babylon-sand-200/70 tracking-widest uppercase text-sm">
        {title}
      </div>
    </div>
  );
}

export default function Home() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [totalWorks, setTotalWorks] = useState(0);
  const [loading, setLoading] = useState(true);

  // Re-enabling the API call
  useEffect(() => {
    setLoading(true);
    fetch("/api/creator", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        const creatorList: Creator[] = data.creators || [];
        setCreators(creatorList);
        setTotalWorks(creatorList.reduce((sum, c) => sum + c.worksCount, 0));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch creators:", err);
        setLoading(false);
      });
  }, []);

  const featuredCreator = creators.find(c => c.id === "Hoshimachi_Suisei");
  
  const getDaysSinceGenesis = () => {
    const genesisDate = new Date("2026-01-13");
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - genesisDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <main className="min-h-screen pt-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-babylon-lapis-900/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-babylon-gold-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">

        {/* Hero Section */}
        <div className="text-center mb-32">
          <div className="inline-block mb-8">
            <div className="text-sm tracking-[0.5em] text-babylon-gold-500 uppercase border-b border-babylon-gold-600/30 pb-2">
              Est. 2025
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-gold-gradient drop-shadow-lg tracking-tight">
            LIBRARY OF BABYLON
          </h1>

          <p className="text-xl md:text-2xl text-babylon-sand-200/80 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            "Preserving the ephemeral starlight of digital creation for the eternity of history."
          </p>
          
          <div className="flex justify-center gap-6">
            <Link
              href="/search"
              className="group relative px-8 py-4 bg-babylon-lapis-800 border border-babylon-gold-500/50 hover:bg-babylon-gold-600 hover:text-white transition-all duration-300"
            >
              <span className="font-serif tracking-widest">ENTER ARCHIVE</span>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 max-w-6xl mx-auto border-y border-babylon-gold-600/10 py-16">
          <StatCard
            title="Creators Archived"
            value={loading ? '...' : creators.length}
            icon="🏛️"
          />
          <StatCard
            title="Works Preserved"
            value={loading ? '...' : totalWorks}
            icon="📜"
          />
          <StatCard
            title="Days Since Genesis"
            value={loading ? '...' : getDaysSinceGenesis()}
            icon="⏳"
          />
        </section>

        {/* Featured Creator */}
        <section className="max-w-6xl mx-auto mb-24">
          <div className="flex items-end justify-between mb-12 border-b border-babylon-gold-600/20 pb-4">
            <h2 className="text-4xl font-bold text-babylon-sand-100">Featured Collection</h2>
            <Link href="/creators" className="text-babylon-gold-500 hover:text-babylon-gold-400 text-sm tracking-widest uppercase mb-2">
              View All Creators →
            </Link>
          </div>

          {loading ? (
             <div className="text-center py-20 border border-babylon-gold-600/20 bg-babylon-lapis-900/50">
                <div className="text-babylon-gold-600 mb-4 text-xl">Loading Collection...</div>
             </div>
          ) : featuredCreator ? (
            <CreatorCard
              name={featuredCreator.name}
              description={featuredCreator.description || "A pioneering VTuber known for her exceptional music and performances."}
              worksCount={featuredCreator.worksCount}
              completeness={featuredCreator.completeness}
              href={`/creator/${featuredCreator.id}`}
              imagePath={`/api/image?path=creators/${featuredCreator.id}/outfit/suisei.png`}
            />
          ) : (
            <div className="text-center py-20 border border-babylon-gold-600/20 bg-babylon-lapis-900/50">
              <div className="text-babylon-gold-600 mb-4 text-xl">Display Case Empty</div>
              <div className="text-babylon-sand-200/50">No featured creator currently selected.</div>
            </div>
          )}
        </section>

        {/* Mission Quote */}
        <section className="max-w-4xl mx-auto mb-20 text-center relative py-20">
            <div className="text-6xl text-babylon-gold-600/20 absolute top-0 left-0 font-serif">“</div>
            <p className="text-2xl md:text-3xl font-serif text-babylon-sand-200 italic leading-relaxed">
              We build not of brick and mortar, but of data and memory.
              Here, the song never ends, and the light never fades.
            </p>
            <div className="text-6xl text-babylon-gold-600/20 absolute bottom-0 right-0 font-serif">”</div>
        </section>

      </div>
    </main>
  );
}