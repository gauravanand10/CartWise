import type { AIPick, FlashDeal, HomeProduct } from "../types/home";

/**
 * Mock catalogue for the homepage.
 *
 * Every section reads from this single source rather than re-declaring its own
 * copy of the same handful of products. When the API lands, only this file (and
 * the hooks that will replace it) needs to change.
 */
const catalogue = {
    iphone16pro: {
        id: "iphone16pro",
        slug: "iphone-16-pro",
        name: "iPhone 16 Pro",
        image: "/assets/products/phones/iphone16pro.png",
        category: "phones",
        price: "₹1,29,999",
        originalPrice: "₹1,39,900",
        discount: "Save ₹9,901",
        rating: 4.9,
        reviews: "19.4k",
        aiScore: 96,
        store: "Amazon",
    },
    s25ultra: {
        id: "s25ultra",
        slug: "samsung-galaxy-s25-ultra",
        name: "Galaxy S25 Ultra",
        image: "/assets/products/phones/s25ultra.png",
        category: "phones",
        price: "₹1,24,999",
        originalPrice: "₹1,34,999",
        discount: "Save ₹10,000",
        rating: 4.9,
        reviews: "22.3k",
        aiScore: 98,
        store: "Flipkart",
    },
    macbookair: {
        id: "macbookair",
        slug: "macbook-air-m4",
        name: "MacBook Air M4",
        image: "/assets/products/laptops/macbook-air-m4.png",
        category: "laptops",
        price: "₹1,14,999",
        originalPrice: "₹1,24,900",
        discount: "Save ₹9,901",
        rating: 4.8,
        reviews: "12.8k",
        aiScore: 95,
        store: "Croma",
    },
    oneplus14: {
        id: "oneplus14",
        slug: "oneplus-14",
        name: "OnePlus 14",
        image: "/assets/products/phones/oneplus14.png",
        category: "phones",
        price: "₹54,999",
        originalPrice: "₹64,999",
        discount: "Save ₹10,000",
        rating: 4.8,
        reviews: "15.2k",
        aiScore: 94,
        store: "Amazon",
    },
    sonyxm6: {
        id: "sonyxm6",
        slug: "sony-wh-1000xm6",
        name: "Sony WH-1000XM6",
        image: "/assets/products/audio/sony-wh1000xm6.png",
        category: "audio",
        price: "₹32,999",
        originalPrice: "₹39,990",
        discount: "Save ₹6,991",
        rating: 4.9,
        reviews: "11.6k",
        aiScore: 95,
        store: "Croma",
    },
    applewatch: {
        id: "applewatch",
        slug: "apple-watch-ultra-3",
        name: "Apple Watch Ultra 3",
        image: "/assets/products/wearables/apple-watch-ultra3.png",
        category: "wearables",
        price: "₹89,999",
        originalPrice: "₹94,999",
        discount: "Save ₹5,000",
        rating: 4.9,
        reviews: "5.2k",
        aiScore: 94,
        store: "Reliance Digital",
    },
    galaxybuds: {
        id: "galaxybuds",
        slug: "samsung-galaxy-buds-4-pro",
        name: "Galaxy Buds 4 Pro",
        image: "/assets/products/audio/galaxy-buds4-pro.png",
        category: "audio",
        price: "₹19,999",
        originalPrice: "₹24,999",
        discount: "Save ₹5,000",
        rating: 4.7,
        reviews: "4.1k",
        aiScore: 91,
        store: "Flipkart",
    },
    dellxps: {
        id: "dellxps",
        slug: "dell-xps-14",
        name: "Dell XPS 14",
        image: "/assets/products/laptops/dell-xps-14.png",
        category: "laptops",
        price: "₹1,54,999",
        originalPrice: "₹1,79,990",
        discount: "Save ₹24,991",
        rating: 4.8,
        reviews: "4.2k",
        aiScore: 92,
        store: "Amazon",
    },
} satisfies Record<string, Omit<HomeProduct, "badge">>;

/** Applies a section-specific badge without mutating the shared catalogue entry. */
function withBadge(
    product: Omit<HomeProduct, "badge">,
    badge: string,
): HomeProduct {
    return { ...product, badge };
}

export const trendingProducts: HomeProduct[] = [
    withBadge(catalogue.iphone16pro, "Trending"),
    withBadge(catalogue.s25ultra, "AI Pick"),
    withBadge(catalogue.macbookair, "Bestseller"),
    withBadge(catalogue.sonyxm6, "Hot"),
];

export const recentlyViewedProducts: HomeProduct[] = [
    withBadge(catalogue.iphone16pro, "Viewed"),
    withBadge(catalogue.s25ultra, "Compared"),
    withBadge(catalogue.sonyxm6, "Viewed"),
    withBadge(catalogue.oneplus14, "Viewed"),
    withBadge(catalogue.applewatch, "Compared"),
];

export const recommendedProducts: HomeProduct[] = [
    withBadge(catalogue.s25ultra, "Best match"),
    withBadge(catalogue.macbookair, "For you"),
    withBadge(catalogue.galaxybuds, "For you"),
    withBadge(catalogue.dellxps, "For you"),
    withBadge(catalogue.applewatch, "For you"),
];

/** Parses "₹1,29,900" → 129900. Indian digit grouping, so strip every non-digit. */
function parseRupees(value: string): number {
    return Number(value.replace(/\D/g, ""));
}

/** Percentage below the original price, rounded. 0 when there's no genuine drop. */
function discountPercent(product: Omit<HomeProduct, "badge">): number {
    if (!product.originalPrice) return 0;

    const was = parseRupees(product.originalPrice);
    const now = parseRupees(product.price);

    if (!was || was <= now) return 0;

    return Math.round(((was - now) / was) * 100);
}

/**
 * Biggest percentage drops first.
 *
 * The badge is computed from the price fields rather than hardcoded, so it can
 * never disagree with the prices shown on the same card.
 */
export const priceDropProducts: HomeProduct[] = [
    catalogue.galaxybuds,
    catalogue.sonyxm6,
    catalogue.oneplus14,
    catalogue.macbookair,
]
    .sort((a, b) => discountPercent(b) - discountPercent(a))
    .map((product) => ({
        ...product,
        badge: `${discountPercent(product)}% off`,
    }));

export const flashDeals: FlashDeal[] = [
    {
        id: "iphone16pro-deal",
        // Taken from the catalogue entry so a deal can never point at a slug
        // the product page does not have.
        slug: catalogue.iphone16pro.slug,
        name: "iPhone 16 Pro",
        image: catalogue.iphone16pro.image,
        category: "phones",
        price: "₹1,11,900",
        originalPrice: "₹1,29,999",
        discountPercent: 14,
        store: "Amazon",
        endsInSeconds: 11_561,
        claimedPercent: 78,
    },
    {
        id: "s25ultra-deal",
        slug: catalogue.s25ultra.slug,
        name: "Galaxy S25 Ultra",
        image: catalogue.s25ultra.image,
        category: "phones",
        price: "₹1,09,999",
        originalPrice: "₹1,24,999",
        discountPercent: 12,
        store: "Flipkart",
        endsInSeconds: 8_245,
        claimedPercent: 64,
    },
    {
        id: "macbookair-deal",
        slug: catalogue.macbookair.slug,
        name: "MacBook Air M4",
        image: catalogue.macbookair.image,
        category: "laptops",
        price: "₹89,900",
        originalPrice: "₹1,14,999",
        discountPercent: 22,
        store: "Croma",
        endsInSeconds: 15_030,
        claimedPercent: 41,
    },
    {
        id: "sonyxm6-deal",
        slug: catalogue.sonyxm6.slug,
        name: "Sony WH-1000XM6",
        image: catalogue.sonyxm6.image,
        category: "audio",
        price: "₹22,490",
        originalPrice: "₹32,999",
        discountPercent: 32,
        store: "Croma",
        endsInSeconds: 5_400,
        claimedPercent: 88,
    },
    {
        id: "oneplus14-deal",
        slug: catalogue.oneplus14.slug,
        name: "OnePlus 14",
        image: catalogue.oneplus14.image,
        category: "phones",
        price: "₹49,999",
        originalPrice: "₹54,999",
        discountPercent: 9,
        store: "Amazon",
        endsInSeconds: 19_800,
        claimedPercent: 55,
    },
];

export const aiPicks: AIPick[] = [
    {
        id: "s25ultra-pick",
        slug: catalogue.s25ultra.slug,
        name: "Galaxy S25 Ultra",
        image: catalogue.s25ultra.image,
        category: "phones",
        price: "₹1,24,999",
        score: 98,
        confidence: 97,
        verdict: "Best overall flagship",
        reasons: [
            "Brightest display in its class",
            "Two-day battery under mixed use",
            "Lowest price of the last 90 days",
        ],
        gradient: "from-blue-600 to-indigo-700",
    },
    {
        id: "macbookair-pick",
        slug: catalogue.macbookair.slug,
        name: "MacBook Air M4",
        image: catalogue.macbookair.image,
        category: "laptops",
        price: "₹1,14,999",
        score: 96,
        confidence: 94,
        verdict: "Best productivity laptop",
        reasons: [
            "18-hour real-world battery",
            "Silent, fanless under load",
            "Cheapest at Croma right now",
        ],
        gradient: "from-violet-600 to-purple-700",
    },
    {
        id: "sonyxm6-pick",
        slug: catalogue.sonyxm6.slug,
        name: "Sony WH-1000XM6",
        image: catalogue.sonyxm6.image,
        category: "audio",
        price: "₹32,999",
        score: 95,
        confidence: 92,
        verdict: "Best noise cancellation",
        reasons: [
            "Class-leading ANC on flights",
            "30-hour battery with ANC on",
            "Consistent 4.9 across 11.6k reviews",
        ],
        gradient: "from-indigo-600 to-blue-700",
    },
];
