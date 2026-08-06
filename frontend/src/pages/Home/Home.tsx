import Hero from "../../features/home/components/hero/Hero";
import CategoryGrid from "../../features/home/components/category/CategoryGrid";
import TrendingProducts from "../../features/home/components/TrendingProducts";
import FlashDeals from "../../features/home/components/FlashDeals";
import PriceDrops from "../../features/home/components/PriceDrops";
import AIPicks from "../../features/home/components/AIPicks";
import BrandCollections from "../../features/home/components/BrandCollections";
import RecentlyViewed from "../../features/home/components/RecentlyViewed";
import RecommendedProducts from "../../features/home/components/RecommendedProducts";

export default function Home() {
    return (
        <div className="flex flex-col gap-20 md:gap-28">

            {/* Search + promotions */}

            <Hero />

            {/* Start browsing */}

            <CategoryGrid />

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
