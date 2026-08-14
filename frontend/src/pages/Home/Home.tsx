import Hero from "../../features/home/components/hero/Hero";
import CategoryTileGrid from "../../features/discovery/components/CategoryTileGrid";
import PromoRow from "../../features/discovery/components/PromoRow";
import TrendingProducts from "../../features/home/components/TrendingProducts";
import FlashDeals from "../../features/home/components/FlashDeals";
import PriceDrops from "../../features/home/components/PriceDrops";
import AIPicks from "../../features/home/components/AIPicks";
import BrandCollections from "../../features/home/components/BrandCollections";
import RecentlyViewed from "../../features/home/components/RecentlyViewed";
import RecommendedProducts from "../../features/home/components/RecommendedProducts";

export default function Home() {
    return (
        // Section rhythm scales with the viewport: 28rem of air between
        // sections reads as generous on a desktop and as dead space on a phone.
        <div className="flex flex-col gap-14 sm:gap-20 md:gap-24 lg:gap-28">

            {/* Search + promotions */}

            <Hero />

            {/* Start browsing. Chapter 20 replaced the mock-data CategoryGrid
                with one driven by GET /api/categories, so the tiles reflect the
                catalogue rather than a hardcoded list that drifts from it. */}

            <div className="section !py-0">
                <CategoryTileGrid />
            </div>

            {/* What the product is for. Original CartWise copy, routed to real
                screens — no card claims a capability the app does not have. */}

            <div className="section !py-0">
                <PromoRow />
            </div>

            {/* Social proof */}

            <TrendingProducts />

            {/* Urgency */}

            <FlashDeals />

            {/* Value, ranked by how far prices have fallen */}

            <PriceDrops />

            {/* The differentiator */}

            <AIPicks />

            {/* Familiar entry points */}

            <BrandCollections />

            {/* Return-visit shortcuts */}

            <RecentlyViewed />

            <RecommendedProducts />

        </div>
    );
}
