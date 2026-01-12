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
      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-8">
        <div className="max-w-6xl mx-auto">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Header Section with Background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent h-96" />
        <div className="relative max-w-6xl mx-auto px-8 py-16">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            Back to Home
          </Link>
          
          <div className="flex items-end gap-8 mt-8">
            <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden">
              <Image
                src={`/api/image?path=creators/${id}/outfit/suisei.png`}
                alt={id.replace(/_/g, " ")}
                width={192}
                height={192}
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {id.replace(/_/g, " ")}
              </h1>
              <p className="text-xl text-gray-400 mb-4">
                {loading ? 'Loading...' : `${songs.length} ${songs.length === 1 ? 'work' : 'works'} preserved for eternity`}
              </p>
              <div className="flex gap-4">
                <div className="bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
                  <span className="text-gray-400">Total Duration:</span>
                  <span className="ml-2 text-white font-semibold">
                    {songs.length * 3.5} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading archive...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2">No works archived yet</h2>
            <p className="text-gray-400">Start preserving this creator&apos;s legacy</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              Archived Works
            </h2>
            
            <div className="space-y-4">
              {songs.map((song, i) => (
                <div
                  key={i}
                  onClick={() => setExpandedSong(expandedSong === i ? null : i)}
                  className={`bg-gradient-to-r from-gray-800/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-xl border transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer ${
                    currentSong === i ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    {/* Album Art / Number */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
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
                        i + 1
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold mb-1 truncate">
                        {song.title ?? "Untitled"}
                      </h3>
                      <p className="text-blue-400 mb-3">{song.artist}</p>
                      
                      {song.description && (
                        <p className="text-gray-300 mb-3 line-clamp-2">
                          {song.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                        {song.Release_date && (
                          <span className="flex items-center gap-1">
                            {song.Release_date}
                          </span>
                        )}
                        {song.archived_by && (
                          <span className="flex items-center gap-1">
                            Archived by {song.archived_by}
                          </span>
                        )}
                        {song.source && (
                          <a
                            href={song.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                          >
                            Source
                          </a>
                        )}
                      </div>

                      {/* Audio Player */}
                      {song.audio && (
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); playAudio(i); }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                currentSong === i && isPlaying
                                  ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50'
                                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                              }`}
                            >
                              {currentSong === i && isPlaying ? (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H6zM12 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1h-1z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8 5.14v9.72a1 1 0 001.555.832l6-4.5a1 1 0 000-1.664l-6-4.5A1 1 0 008 5.14z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>

                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Preview (30s)</span>
                                <span>
                                  {currentSong === i ? `${Math.floor(currentTime)}s` : '0s'} / 30s
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
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
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          {song.thumbnail && (
                            <div className="mb-4 flex justify-center">
                              <div className="w-full max-w-xs h-64 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
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
                            </div>
                          )}
                          {song.analysis ? (
                            <div className="prose prose-invert max-w-none">
                              <div className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                                {song.analysis}
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className="text-lg font-semibold mb-2">Full Metadata</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {song.archived_date && (
                                  <div>
                                    <span className="text-gray-400">Archived Date:</span>
                                    <span className="ml-2 text-white">{song.archived_date}</span>
                                  </div>
                                )}
                                {song.archived_by && (
                                  <div>
                                    <span className="text-gray-400">Archived By:</span>
                                    <span className="ml-2 text-white">{song.archived_by}</span>
                                  </div>
                                )}
                                {song.audio && (
                                  <div className="md:col-span-2">
                                    <span className="text-gray-400">Audio File:</span>
                                    <span className="ml-2 text-white">{song.audio}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
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
    <div className="flex gap-1 mt-3 justify-center h-12 items-end">
      {bars.map((bar) => (
        <WaveformBar key={bar.id} height={bar.height} delay={bar.delay} />
      ))}
    </div>
  );
}

function WaveformBar({ height, delay }: { height: number; delay: number }) {
  return (
    <div
      className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse"
      style={{ 
        height: `${height}%`,
        animationDelay: `${delay}s`,
        animationDuration: '0.8s'
      }}
    />
  );
}