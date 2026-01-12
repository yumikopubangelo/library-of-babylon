type StatCardProps = {
  title: string;
  value: number | string;
  icon?: string;
};

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="relative group bg-babylon-lapis-900 border border-babylon-gold-600/30 p-8 hover:border-babylon-gold-500 transition-all duration-500">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-babylon-gold-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-babylon-gold-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-babylon-gold-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-babylon-gold-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

      {icon && (
        <div className="text-4xl mb-4 text-babylon-gold-600 group-hover:text-babylon-gold-400 transition-colors">
          {icon}
        </div>
      )}

      <div className="font-serif text-4xl font-bold mb-2 text-babylon-sand-100 group-hover:text-gold-gradient transition-all">
        {value}
      </div>

      <div className="text-babylon-sand-200/60 uppercase tracking-widest text-xs font-semibold">
        {title}
      </div>
    </div>
  );
}
