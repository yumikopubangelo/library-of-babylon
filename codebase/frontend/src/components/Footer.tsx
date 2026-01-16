import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-babylon-lapis-900 text-babylon-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-babylon-sand-100 mb-4">Library of Babylon</h3>
            <p className="text-sm">
              A 200-year digital archive preserving ephemeral digital creators and their works
              for future generations.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-babylon-sand-100 mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-babylon-sand-100 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/creators" className="hover:text-babylon-sand-100 transition-colors">
                  Creators
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-babylon-sand-100 transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-babylon-sand-100 mb-4">Project</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/mission" className="hover:text-babylon-sand-100 transition-colors">
                  Mission
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-babylon-sand-100 transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/contributing" className="hover:text-babylon-sand-100 transition-colors">
                  Contribute
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-babylon-lapis-800 mt-8 pt-8 text-center">
          <p className="text-sm">
            © 2024 Library of Babylon. Preserving digital beauty for 200 years.
          </p>
        </div>
      </div>
    </footer>
  );
}