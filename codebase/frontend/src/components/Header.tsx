import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-babylon-lapis-950/90 border-b border-babylon-gold-600/30 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
            {/* Logo placeholder - stylized text */}
          <Link href="/" className="text-2xl font-serif font-bold text-babylon-gold-400 tracking-widest hover:text-babylon-gold-500 transition-colors">
            BABYLON
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/search" className="text-babylon-sand-200 hover:text-babylon-gold-400 font-medium tracking-wide transition-colors">
            SEARCH
          </Link>
          <Link href="/creators" className="text-babylon-sand-200 hover:text-babylon-gold-400 font-medium tracking-wide transition-colors">
            CREATORS
          </Link>
          <Link href="/about" className="text-babylon-sand-200 hover:text-babylon-gold-400 font-medium tracking-wide transition-colors">
            ABOUT
          </Link>
        </nav>

        <div className="md:hidden text-babylon-gold-500">
          {/* Mobile menu icon placeholder */}
          <span className="text-xl">☰</span>
        </div>
      </div>
    </header>
  );
}
