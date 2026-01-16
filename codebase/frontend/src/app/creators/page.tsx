'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import CreatorCard from "@/components/CreatorCard";

type Creator = {
  id: string;
  name: string;
  worksCount: number;
  completeness: number;
  description?: string;
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        setCreators(data.creators || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen pt-20 relative overflow-hidden">
      {/* Background Ambience (Same as Home) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-babylon-lapis-900/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-babylon-gold-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-16 border-b border-babylon-gold-600/20 pb-8">
            <Link href="/" className="text-babylon-gold-500 hover:text-babylon-gold-400 text-sm tracking-widest uppercase mb-6 inline-block">
                ← Back to Home
            </Link>
            
            <h1 className="text-5xl md:text-6xl font-bold text-babylon-sand-100 font-serif mb-4">
                The Archives
            </h1>
            <p className="text-xl text-babylon-sand-200/80 max-w-2xl font-light">
                {loading ? 'Consulting the records...' : `Preserving the legacy of ${creators.length} ${creators.length === 1 ? 'creator' : 'creators'} for eternity.`}
            </p>
        </div>

        {/* Content */}
        <div className="">
            {loading ? (
            <div className="text-center py-20 border border-babylon-gold-600/20 bg-babylon-lapis-900/50">
                <div className="text-babylon-gold-600 mb-4 text-xl">Loading Archives...</div>
            </div>
            ) : creators.length === 0 ? (
            <div className="text-center py-20 border border-babylon-gold-600/20 bg-babylon-lapis-900/50">
                <h2 className="text-2xl font-bold text-babylon-sand-100 mb-2">The Halls are Empty</h2>
                <p className="text-babylon-sand-200/60">No creators have been archived yet.</p>
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {creators.map((c: Creator) => (
                <div key={c.id} className="h-full">
                    <CreatorCard
                        name={c.name}
                        description={c.description || "Archived content creator."}
                        worksCount={c.worksCount}
                        completeness={c.completeness}
                        href={`/creator/${c.id}`}
                        imagePath={`/api/image?path=creators/${c.id}/outfit/suisei.png`}
                        variant="vertical"
                    />
                </div>
                ))}
            </div>
            )}
        </div>
      </div>
    </main>
  );
}
