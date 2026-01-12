export default function Footer() {
  return (
    <footer className="bg-babylon-lapis-900 border-t border-babylon-gold-600/20 py-12 mt-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-babylon-gold-500 text-xl font-bold mb-4">LIBRARY OF BABYLON</h3>
            <p className="text-babylon-sand-200/70 text-sm leading-relaxed max-w-xs">
              A digital sanctuary dedicated to the eternal preservation of ephemeral culture.
              Safeguarding the legacy of creators for the next 200 years.
            </p>
          </div>

          <div>
            <h4 className="text-babylon-sand-100 font-bold mb-4">EXPLORE</h4>
            <ul className="space-y-2 text-sm text-babylon-sand-200/70">
              <li><a href="/search" className="hover:text-babylon-gold-400 transition-colors">The Archive</a></li>
              <li><a href="/creators" className="hover:text-babylon-gold-400 transition-colors">Creator Index</a></li>
              <li><a href="/collections" className="hover:text-babylon-gold-400 transition-colors">Curated Collections</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-babylon-sand-100 font-bold mb-4">PROJECT</h4>
            <ul className="space-y-2 text-sm text-babylon-sand-200/70">
              <li><a href="/mission" className="hover:text-babylon-gold-400 transition-colors">Mission Statement</a></li>
              <li><a href="/roadmap" className="hover:text-babylon-gold-400 transition-colors">200-Year Roadmap</a></li>
              <li><a href="https://github.com/library-of-babylon" className="hover:text-babylon-gold-400 transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-babylon-gold-600/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-babylon-sand-200/40">
          <p>© {new Date().getFullYear()} Library of Babylon Project. Open Source.</p>
          <p className="mt-2 md:mt-0 font-serif italic">"Verba volant, scripta manent"</p>
        </div>
      </div>
    </footer>
  );
}
