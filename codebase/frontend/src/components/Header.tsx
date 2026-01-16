import Link from 'next/link';


export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-lapis-glass border-b border-babylon-gold-600/20">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-serif font-bold text-gold-gradient tracking-wider">
              Library of Babylon
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 font-sans">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/creators">Creators</NavLink>
            <NavLink href="/search">Search</NavLink>
          </nav>

          {/* Right side action/info - can be a button or just text */}
          <div className="text-sm text-babylon-sand-200/50 hidden sm:block">
            A Digital Archive
          </div>

        </div>
      </div>
    </header>
  );
}

// NavLink component for consistent styling
function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link 
            href={href} 
            className="text-babylon-sand-200 hover:text-babylon-gold-400 transition-colors tracking-widest text-sm uppercase"
        >
            {children}
        </Link>
    );
}
