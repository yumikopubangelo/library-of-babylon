type StatCardProps = {
  title: string;
  value: number | string;
  icon?: string;
};

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-lapis-glass border border-babylon-gold-600/10 p-6 text-center">
      {icon && (
        <div className="text-4xl mb-4">
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
