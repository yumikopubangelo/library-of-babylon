'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SongMetadata {
  title?: string;
  artist?: string;
  Release_date?: string;
  source?: string;
  description?: string;
  archived_by?: string;
  archived_date?: string;
  audio?: string;
  thumbnail?: string;
  analysis?: string;
}

export default function CreatorPage() {
  const { id } = useParams<{ id: string }>();
  const [songs, setSongs] = useState<SongMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [expandedSong, setExpandedSong] = useState<number | null>(null);

  const playAudio = (index: number) => {
    if (audioRef.current && songs[index]?.audio) {
      if (currentSong === index && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (currentSong !== index) {
          audioRef.current.src = `/api/audio?path=creators/${id}/Music/Singles/${songs[index].audio}`;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
        setCurrentSong(index);
      }
    }
  };

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/creator/${id}/songs`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setSongs(data);
        else console.error('Invalid data', data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (!id) {
    return (
      <main className="min-h-screen bg-babylon-lapis-900 text-babylon-sand-100 p-8 pt-24">
        <div className="max-w-6xl mx-auto text-center font-serif text-2xl animate-pulse">Consulting the archives...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 relative overflow-hidden text-babylon-sand-100">
       {/* Background Ambience */}
       <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-babylon-lapis-900/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-babylon-gold-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10">
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <Link href="/creators" className="text-babylon-gold-500 hover:text-babylon-gold-400 text-sm tracking-widest uppercase mb-8 inline-block">
             ← Back to Collection
          </Link>
          
          <div className="flex flex-col md:flex-row items-end gap-12 border-b border-babylon-gold-600/20 pb-12">
            <div className="w-64 h-64 bg-babylon-lapis-800 border border-babylon-gold-600/20 p-2 flex items-center justify-center relative shrink-0">
                 {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-babylon-gold-500"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-babylon-gold-500"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-babylon-gold-500"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-babylon-gold-500"></div>

              <div className="w-full h-full relative overflow-hidden bg-babylon-lapis-900/50">
                 <Image
                    src={`/api/image?path=creators/${id}/outfit/suisei.png`}
                    alt={id.replace(/_/g, " ")}
                    width={256}
                    height={256}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    }}
                />
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 font-serif text-babylon-sand-100">
                {id.replace(/_/g, " ")}
              </h1>
              <div className="h-1 w-24 bg-babylon-gold-500 mb-6"></div>

              <div className="grid grid-cols-2 gap-8 text-sm tracking-widest uppercase text-babylon-gold-500/80">
                  <div>
                      <div className="mb-1">Archived Works</div>
                      <div className="text-xl text-babylon-sand-100 font-bold font-sans">{loading ? '...' : songs.length}</div>
                  </div>
                  <div>
                      <div className="mb-1">Total Duration</div>
                      <div className="text-xl text-babylon-sand-100 font-bold font-sans">
                         {loading ? '...' : `${Math.ceil(songs.length * 3.5)} MIN`}
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        {loading ? (
           <div className="text-center py-20 border border-babylon-gold-600/20 bg-babylon-lapis-900/50">
                <div className="text-babylon-gold-600 mb-4 text-xl">Loading Records...</div>
            </div>
        ) : songs.length === 0 ? (
           <div className="text-center py-20 border border-babylon-gold-600/20 bg-babylon-lapis-900/50">
            <h2 className="text-2xl font-bold mb-2 text-babylon-sand-100">No records found</h2>
            <p className="text-babylon-sand-200/60">This section of the archive is empty.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-serif text-babylon-sand-100 mb-8 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-babylon-gold-500"></span>
              Archived Works
              <span className="flex-1 h-[1px] bg-babylon-gold-600/20"></span>
            </h2>
            
            <div className="space-y-4">
              {songs.map((song, i) => (
                <div
                  key={i}
                  onClick={() => setExpandedSong(expandedSong === i ? null : i)}
                  className={`bg-lapis-glass border backdrop-blur-sm p-6 transition-all cursor-pointer group hover:border-babylon-gold-600/50 ${
                    currentSong === i ? 'border-babylon-gold-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-babylon-gold-600/10'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    {/* Album Art / Number */}
                    <div className="w-20 h-20 bg-babylon-lapis-900 border border-babylon-gold-600/20 flex items-center justify-center text-xl font-serif text-babylon-gold-600/50 flex-shrink-0 overflow-hidden relative">
                      {song.thumbnail ? (
                        <Image
                          src={`/api/image?path=creators/${id}/Music/Singles/${song.thumbnail}`}
                          alt={`${song.title} cover`}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            // Fallback to number will show
                          }}
                        />
                      ) : (
                        <span className="font-serif italic">#{i + 1}</span>
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold mb-1 truncate font-serif text-babylon-sand-100 group-hover:text-gold-gradient transition-all">
                        {song.title ?? "Untitled Record"}
                      </h3>
                      <p className="text-babylon-gold-500/80 mb-3 text-sm tracking-widest uppercase">{song.artist}</p>
                      
                      {song.description && (
                        <p className="text-babylon-sand-200/60 mb-3 line-clamp-2 text-sm italic font-serif">
                          "{song.description}"
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs text-babylon-sand-200/40 mb-4 tracking-widest uppercase">
                        {song.Release_date && (
                          <span className="flex items-center gap-1">
                            {song.Release_date}
                          </span>
                        )}
                        {song.archived_by && (
                          <span className="flex items-center gap-1 border-l border-babylon-gold-600/20 pl-4">
                            Archivist: {song.archived_by}
                          </span>
                        )}
                      </div>

                      {/* Audio Player */}
                      {song.audio && (
                        <div className="bg-babylon-lapis-900/50 p-4 border border-babylon-gold-600/10">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); playAudio(i); }}
                              className={`w-12 h-12 flex items-center justify-center transition-all border border-babylon-gold-500/50 ${
                                currentSong === i && isPlaying
                                  ? 'bg-babylon-gold-600 text-babylon-lapis-900'
                                  : 'bg-transparent text-babylon-gold-500 hover:bg-babylon-gold-600/10'
                              }`}
                            >
                              {currentSong === i && isPlaying ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H6zM12 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1h-1z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8 5.14v9.72a1 1 0 001.555.832l6-4.5a1 1 0 000-1.664l-6-4.5A1 1 0 008 5.14z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>

                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-babylon-gold-500/50 mb-2 tracking-widest font-mono">
                                <span>PLAYBACK</span>
                                <span>
                                  {currentSong === i ? `${Math.floor(currentTime)}s` : '0s'} / 30s
                                </span>
                              </div>
                              <div className="w-full bg-babylon-lapis-900 h-1 overflow-hidden">
                                <div
                                  className="bg-babylon-gold-500 h-full transition-all duration-300"
                                  style={{ width: `${currentSong === i ? (currentTime / 30) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Waveform Visualization */}
                          {currentSong === i && isPlaying && (
                            <WaveformVisualizer />
                          )}
                        </div>
                      )}

                      {expandedSong === i && (
                        <div className="mt-6 pt-6 border-t border-babylon-gold-600/10 animate-in fade-in slide-in-from-top-4 duration-300">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1">
                                    {song.thumbnail && (
                                        <div className="w-full aspect-square bg-babylon-lapis-900 border border-babylon-gold-600/20 flex items-center justify-center p-2">
                                            <Image
                                                src={`/api/image?path=creators/${id}/Music/Singles/${song.thumbnail}`}
                                                alt={`${song.title} cover`}
                                                width={300}
                                                height={300}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <h4 className="text-babylon-gold-500 tracking-widest uppercase text-sm mb-4 border-b border-babylon-gold-600/10 pb-2">Analysis Data</h4>
                                    
                                    {song.analysis ? (
                                        <div className="prose prose-invert max-w-none">
                                        <div className="text-sm text-babylon-sand-200/80 whitespace-pre-wrap font-mono leading-relaxed bg-babylon-lapis-900/30 p-4 border border-babylon-gold-600/5">
                                            {song.analysis}
                                        </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                            {song.archived_date && (
                                                <div className="flex flex-col">
                                                    <span className="text-babylon-gold-500/50 text-xs uppercase tracking-widest mb-1">Date Archived</span>
                                                    <span className="text-babylon-sand-100 font-mono">{song.archived_date}</span>
                                                </div>
                                            )}
                                            {song.archived_by && (
                                                <div className="flex flex-col">
                                                    <span className="text-babylon-gold-500/50 text-xs uppercase tracking-widest mb-1">Archivist</span>
                                                    <span className="text-babylon-sand-100 font-mono">{song.archived_by}</span>
                                                </div>
                                            )}
                                            {song.audio && (
                                                <div className="flex flex-col sm:col-span-2">
                                                    <span className="text-babylon-gold-500/50 text-xs uppercase tracking-widest mb-1">Source File</span>
                                                    <span className="text-babylon-sand-100 font-mono break-all">{song.audio}</span>
                                                </div>
                                            )}
                                            {song.source && (
                                                 <div className="flex flex-col sm:col-span-2 mt-2">
                                                     <a href={song.source} target="_blank" rel="noopener" className="text-babylon-gold-500 hover:text-babylon-sand-100 underline decoration-babylon-gold-600/30 underline-offset-4 transition-colors">
                                                         View Original Source ↗
                                                     </a>
                                                 </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        className="hidden"
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          if (e.currentTarget.currentTime > 30) {
            e.currentTarget.pause();
            setIsPlaying(false);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentSong(null);
        }}
      />
    </main>
  );
}

// Waveform Visualizer Component
function WaveformVisualizer() {
  const bars = Array.from({ length: 40 }, (_, idx) => ({
    id: idx,
    height: Math.floor(Math.random() * 80) + 20, // 20-100%
    delay: idx * 0.05,
  }));

  return (
    <div className="flex gap-[2px] mt-4 justify-center h-8 items-end opacity-50">
      {bars.map((bar) => (
        <WaveformBar key={bar.id} height={bar.height} delay={bar.delay} />
      ))}
    </div>
  );
}

function WaveformBar({ height, delay }: { height: number; delay: number }) {
  return (
    <div
      className="w-[2px] bg-babylon-gold-500 rounded-full animate-pulse"
      style={{ 
        height: `${height}%`,
        animationDelay: `${delay}s`,
        animationDuration: '0.8s'
      }}
    />
  );
}
