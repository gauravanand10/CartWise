import HomeHero from "../../features/home/components/hero/HomeHero";
import CatalogueRail from "../../features/home/components/CatalogueRail";
import CategoryTileGrid from "../../features/discovery/components/CategoryTileGrid";
import PromoRow from "../../features/discovery/components/PromoRow";

/**
 * The homepage.
 *
 * ===========================================================================
 * CHAPTER 26.5 — SEVEN SECTIONS REMOVED
 *
 * This page used to render, in order: Hero, CategoryTileGrid, PromoRow,
 * TrendingProducts, FlashDeals, PriceDrops, AIPicks, BrandCollections,
 * RecentlyViewed and RecommendedProducts.
 *
 * The last seven are gone, and not because the homepage was crowded — though
 * it was. Every one of them read `features/home/data/products.ts`, a
 * hand-written mock array, and rendered it as fact:
 *
 *   AIPicks           "AI score 96", "AI score 98", with a confidence figure
 *                     and a verdict line. No model produced any of it.
 *   PriceDrops        "Lowest price of the last 90 days". CartWise stores no
 *                     price history at all — there is no table for it.
 *   FlashDeals        "Time-boxed price drops, refreshed hourly across every
 *                     store we track", under a live countdown timer. Nothing
 *                     is refreshed hourly; nothing is refreshed.
 *   TrendingProducts  "Lowest at Amazon" / "Lowest at Croma" per product, on a
 *                     site with no live pricing feed. Chapter 24 and Chapter 26
 *                     both established that no free one exists to call.
 *   BrandCollections  product counts per brand, hardcoded and already wrong
 *                     against the 100-product catalogue.
 *   RecentlyViewed    a "recently viewed" list for a visitor who had viewed
 *                     nothing. No view history is recorded anywhere.
 *   RecommendedProducts  ordered by the same fabricated AI score.
 *
 * This is the same class of claim Chapter 26 built an FTC-grade affiliate
 * disclosure to avoid making, on the same site, one scroll higher. A project
 * that carefully discloses that a "Visit store" button may earn commission,
 * while telling the same reader a price is the lowest in ninety days when it
 * has never recorded a price, has not solved the problem it thinks it solved.
 *
 * WHAT DEPENDED ON THEM: nothing but this file. Verified before deletion by
 * grepping the whole of `src` for each component name — every hit was an import
 * and a JSX tag in this module. No test, no route and no other component
 * referenced any of the seven.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS LEFT, AND WHAT BACKS IT
 *
 *   HomeHero          real product from GET /api/products?sort=rating-desc,
 *                     with its Openverse photograph and attribution
 *   CategoryTileGrid  GET /api/categories — the real seven, with real counts
 *   CatalogueRail ×2  GET /api/products with a query stated in the section's
 *                     own description
 *   PromoRow          no data at all: four links to routes that exist, which
 *                     is the one thing on this page that cannot drift from
 *                     reality
 *
 * Four sections, every one of them checkable. The page is shorter than it was
 * and says less, and both of those are the improvement.
 * ===========================================================================
 */
export default function Home() {
    return (
        // Section rhythm from the design system's spacing scale. Wider at
        // desktop than the old page, which is the restraint pass's main lever:
        // fewer things, further apart.
        <div className="flex flex-col gap-16 pb-8 sm:gap-20 lg:gap-24">

            <HomeHero />

            {/* The seven real categories, counted by the API rather than by a
                list somebody maintained by hand. */}
            <CategoryTileGrid />

            {/*
                Two rails, and only two, because the API supports exactly two
                honest selections beyond "everything".

                A third — "Recently added" — is the obvious next one and is NOT
                here: `GET /api/products` sorts by price-asc, price-desc,
                rating-desc and name-asc, and has no created-desc. Adding it is
                backend work, and this chapter is scoped to data and appearance.
                Ordering a rail by something other than what its title says
                would be exactly the habit the deletions above are correcting.
            */}
            <CatalogueRail
                title="Top rated"
                description="The catalogue's highest customer ratings, across every category."
                query={{ sort: "rating-desc" }}
                seeAllHref="/browse?sort=rating-desc"
            />

            <CatalogueRail
                title="Under ₹15,000"
                description="Everything in the catalogue below ₹15,000, cheapest first."
                query={{ maxPrice: 15000, sort: "price-asc" }}
                seeAllHref="/browse?maxPrice=15000&sort=price-asc"
            />

            {/* What the product is for. Original CartWise copy, routed to real
                screens — no card claims a capability the app does not have. */}
            <div className="section !py-0">
                <PromoRow />
            </div>

        </div>
    );
}
