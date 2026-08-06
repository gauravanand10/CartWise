import CategoryStrip from "./navbar/CategoryStrip";
import Container from "./Container";
import Logo from "./navbar/Logo";
import NavActions from "./navbar/NavActions";
import SearchBar from "./navbar/SearchBar";
import TopBar from "./navbar/TopBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl">

      <TopBar />

      {/* Primary row */}

      <div className="border-b border-slate-100">

        <Container className="flex h-16 items-center gap-4 sm:gap-6">

          <Logo />

          {/* Below md there isn't room for a usable field alongside the logo and
              actions, so the field is dropped and NavActions shows a search
              icon that jumps to the search page instead. */}

          <div className="hidden flex-1 md:flex">
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
