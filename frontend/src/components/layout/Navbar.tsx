import { useLocation } from "react-router-dom";

import CategoryStrip from "./navbar/CategoryStrip";
import Container from "./Container";
import Logo from "./navbar/Logo";
import NavActions from "./navbar/NavActions";
import SearchBar from "./navbar/SearchBar";
import TopBar from "./navbar/TopBar";
import { useScrolledPast } from "../../hooks/useScrolledPast";

/** Roughly the height of the homepage hero search — past this, it's off screen. */
const HERO_SEARCH_HEIGHT = 380;

export default function Navbar() {
  const { pathname } = useLocation();
  const scrolledPastHero = useScrolledPast(HERO_SEARCH_HEIGHT);

  // The homepage already leads with a large search field, so showing a second
  // one in the header at the same time is just duplication. It fades in only
  // once the hero field has scrolled away, and every other route keeps it.
  const isHome = pathname === "/";
  const showSearch = !isHome || scrolledPastHero;

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl">

      <TopBar />

      {/* Primary row */}

      <div className="border-b border-slate-100">

        <Container className="flex h-16 items-center gap-4 sm:gap-6">

          <Logo />

          {/* Kept mounted and space-reserving so revealing it can't shift the
              logo or the actions sideways. */}

          <div
            className={`
              hidden
              flex-1
              transition-opacity
              duration-300
              md:flex
              ${showSearch ? "opacity-100" : "pointer-events-none opacity-0"}
            `}
            aria-hidden={!showSearch}
            inert={!showSearch}
          >
            <SearchBar />
          </div>

          <div className="flex flex-1 justify-end md:flex-none">
            <NavActions />
          </div>

        </Container>

      </div>

      <CategoryStrip />

    </header>
  );
}
