import Link from 'next/link';

type CreatorCardProps = {
  name: string;
  description: string;
  worksCount: number;
  completeness: number;
  href: string;
  imagePath: string;
};

export default function CreatorCard({
  name,
  description,
  worksCount,
  completeness,
  href,
  imagePath,
}: CreatorCardProps) {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <Link href={href}>
      <div className="bg-lapis-glass border border-babylon-gold-600/10 group transition-all hover:border-babylon-gold-600/30">
        <div className="flex flex-col md:flex-row items-center">
          {/* Image */}
          <div className="w-full md:w-1/3 h-80 md:h-auto relative">
            <img
              src={imagePath}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-babylon-lapis-900/50 via-transparent to-transparent"></div>
          </div>

          {/* Info */}
          <div className="w-full md:w-2/3 p-8 md:p-12">
            <h3 className="text-4xl font-bold font-serif mb-4 text-babylon-sand-100 group-hover:text-gold-gradient transition-all">
              {name.replace(/_/g, " ")}
            </h3>
            <p className="text-babylon-sand-200/80 mb-8 leading-relaxed">
              {description}
            </p>

            <div className="flex items-center gap-8 mb-6">
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
      </div>
    </Link>
  );
}
