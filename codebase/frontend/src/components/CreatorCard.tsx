import Link from 'next/link';

type CreatorCardProps = {
  name: string;
  description: string;
  worksCount: number;
  completeness: number;
  href: string;
  imagePath: string;
  variant?: 'horizontal' | 'vertical';
};

export default function CreatorCard({
  name,
  description,
  worksCount,
  completeness,
  href,
  imagePath,
  variant = 'horizontal',
}: CreatorCardProps) {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  const isHorizontal = variant === 'horizontal';

  return (
    <Link href={href} className="block h-full">
      <div className={`bg-lapis-glass border border-babylon-gold-600/10 group transition-all hover:border-babylon-gold-600/30 h-full flex ${isHorizontal ? 'flex-col md:flex-row' : 'flex-col'}`}>
        {/* Image */}
        <div className={`${isHorizontal ? 'w-full md:w-1/3 h-80 md:h-auto' : 'w-full h-80'} relative shrink-0 overflow-hidden bg-babylon-lapis-900/20`}>
          <img
            src={imagePath}
            alt={name}
            className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            onError={handleImageError}
          />
          <div className={`absolute inset-0 pointer-events-none ${isHorizontal ? 'bg-gradient-to-t md:bg-gradient-to-r from-babylon-lapis-900/50 via-transparent to-transparent' : 'bg-gradient-to-t from-babylon-lapis-900/50 via-transparent to-transparent'}`}></div>
        </div>

        {/* Info */}
        <div className={`${isHorizontal ? 'w-full md:w-2/3 p-8 md:p-12' : 'w-full p-8 flex flex-col grow'}`}>
          <h3 className="text-4xl font-bold font-serif mb-4 text-babylon-sand-100 group-hover:text-gold-gradient transition-all">
            {name.replace(/_/g, " ")}
          </h3>
          <p className="text-babylon-sand-200/80 mb-8 leading-relaxed line-clamp-3">
            {description}
          </p>

          <div className={`${isHorizontal ? 'flex items-center gap-8 mb-6' : 'grid grid-cols-2 gap-4 mb-6 mt-auto'}`}>
              <div>
                  <div className="text-sm text-babylon-gold-500 tracking-widest">WORKS</div>
                  <div className="text-2xl font-bold text-babylon-sand-100">{worksCount}</div>
              </div>
              <div>
                  <div className="text-sm text-babylon-gold-500 tracking-widest">COMPLETENESS</div>
                  <div className="text-2xl font-bold text-babylon-sand-100">{Math.round(completeness * 100)}%</div>
              </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-babylon-lapis-900 rounded-full h-2 overflow-hidden border border-babylon-gold-600/20">
            <div
              className="bg-babylon-gold-500 h-full rounded-full"
              style={{ width: `${completeness * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
