import Link from "next/link";
import Image from "next/image";

type CreatorCardProps = {
  name: string;
  description: string;
  worksCount: number;
  completeness: number;
  href: string;
  imagePath?: string;
};

export default function CreatorCard({
  name,
  description,
  worksCount,
  completeness,
  href,
  imagePath
}: CreatorCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <Link href={href} className="block group">
      <div className="relative overflow-hidden bg-babylon-lapis-900 border border-babylon-gold-600/30 hover:border-babylon-gold-500 transition-all duration-500">

        <div className="flex flex-col md:flex-row">
          {/* Image Section - Tablet/Fresco style */}
          <div className="w-full md:w-1/3 min-h-[300px] relative bg-babylon-lapis-800 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-babylon-gold-600/20">
             {/* Abstract pattern overlay */}
             <div className="absolute inset-0 opacity-10 bg-[url('/pattern.png')] mix-blend-overlay"></div>

             {/* Fallback stylized initial if image fails or isn't provided */}
             <div className="text-9xl font-serif text-babylon-gold-600/20 absolute select-none">
                {name.charAt(0)}
             </div>

             {/* Actual Image */}
             {imagePath && (
                 <img
                 src={imagePath}
                 alt={name}
                 className="relative z-10 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-luminosity group-hover:mix-blend-normal"
                 onError={handleImageError}
               />
             )}
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12 flex-1 flex flex-col justify-center relative">
            {/* Background flourish */}
            <div className="absolute top-4 right-4 text-6xl text-babylon-gold-600/5 font-serif">
                BABYLON
            </div>

            <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-babylon-sand-100 group-hover:text-babylon-gold-400 transition-colors">
              {name}
            </h3>

            <p className="text-babylon-sand-200/80 mb-8 leading-relaxed font-light border-l-2 border-babylon-gold-600/30 pl-4">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-8 mb-6 border-t border-babylon-gold-600/10 pt-6">
              <div>
                 <div className="text-xs tracking-widest text-babylon-gold-600 uppercase mb-1">Archived Works</div>
                 <div className="text-2xl font-serif text-babylon-sand-100">{worksCount}</div>
              </div>
              <div>
                 <div className="text-xs tracking-widest text-babylon-gold-600 uppercase mb-1">Preservation Level</div>
                 <div className="text-2xl font-serif text-babylon-sand-100">{Math.round(completeness * 100)}%</div>
              </div>
            </div>

            {/* Progress Bar styled as a timeline */}
            <div className="relative h-1 w-full bg-babylon-lapis-800 mt-2">
                <div
                    className="absolute top-0 left-0 h-full bg-babylon-gold-500 transition-all duration-1000 ease-out"
                    style={{ width: `${completeness * 100}%` }}
                ></div>
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-babylon-gold-400 rotate-45 border border-babylon-lapis-900"
                    style={{ left: `${completeness * 100}%` }}
                ></div>
            </div>

            <div className="mt-8 flex items-center text-babylon-gold-500 text-sm font-bold tracking-widest group-hover:translate-x-2 transition-transform">
                ENTER ARCHIVE
                <span className="ml-2 text-lg">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
