import type { ProductBase, RatingBucket, Review } from "../types/product";

/**
 * Customer reviews.
 *
 * The bodies are authored templates rather than 23 × 3 hand-written reviews.
 * Each is written to read naturally once the product name and category are
 * filled in, and selection is *deterministic* — seeded from the slug — so a
 * product always shows the same reviews across renders and reloads. Random
 * picking would make the section change under the user on every keystroke.
 */

interface ReviewTemplate {
    author: string;
    rating: number;
    title: string;
    body: (name: string) => string;
    daysAgo: number;
    verified: boolean;
    helpful: number;
}

const POOL: ReviewTemplate[] = [
    {
        author: "Aditya R.",
        rating: 5,
        title: "Lives up to the reviews",
        body: (n) =>
            `Been using the ${n} for about six weeks now. It does everything the reviews said it would, and the build quality is better in person than in photos. No regrets at this price.`,
        daysAgo: 12,
        verified: true,
        helpful: 214,
    },
    {
        author: "Meera S.",
        rating: 4,
        title: "Very good, with one caveat",
        body: (n) =>
            `The ${n} is genuinely excellent day to day. My only complaint is that it took a couple of weeks to get the settings the way I wanted — the defaults are not great. Once configured, it is hard to fault.`,
        daysAgo: 27,
        verified: true,
        helpful: 168,
    },
    {
        author: "Karthik V.",
        rating: 5,
        title: "Worth the upgrade",
        body: (n) =>
            `Upgraded from a three-year-old model and the difference is immediately obvious. The ${n} feels faster in every interaction and the battery easily gets me through a full day.`,
        daysAgo: 41,
        verified: true,
        helpful: 132,
    },
    {
        author: "Priya N.",
        rating: 4,
        title: "Great, but not cheap",
        body: (n) =>
            `No real complaints about the ${n} itself — it performs exactly as advertised. It is expensive though, and I would wait for a sale rather than paying list price.`,
        daysAgo: 58,
        verified: true,
        helpful: 97,
    },
    {
        author: "Rahul D.",
        rating: 5,
        title: "Best purchase this year",
        body: (n) =>
            `I did a lot of comparison shopping before settling on the ${n} and I am glad I did. It handles everything I throw at it and I have not found a situation where it struggles.`,
        daysAgo: 73,
        verified: true,
        helpful: 88,
    },
    {
        author: "Sneha T.",
        rating: 3,
        title: "Good hardware, average software",
        body: (n) =>
            `The hardware on the ${n} is excellent. The software is where it falls short — a few rough edges and one feature that has not worked reliably since I bought it. Hopefully an update fixes it.`,
        daysAgo: 90,
        verified: false,
        helpful: 64,
    },
    {
        author: "Vikram J.",
        rating: 5,
        title: "Exactly what I needed",
        body: (n) =>
            `Bought the ${n} for daily use and it has slotted straight into my routine. Setup took ten minutes and I have not had to think about it since, which is the highest compliment I can give.`,
        daysAgo: 104,
        verified: true,
        helpful: 51,
    },
    {
        author: "Ananya G.",
        rating: 4,
        title: "Solid, minor niggles",
        body: (n) =>
            `Overall very happy with the ${n}. Two small annoyances that stop it being a five: it picks up fingerprints constantly, and I wish the bundled accessories were better quality.`,
        daysAgo: 121,
        verified: true,
        helpful: 43,
    },
    {
        author: "Farhan A.",
        rating: 2,
        title: "Not for my use case",
        body: (n) =>
            `The ${n} is well made but it was the wrong choice for what I needed. Read the specifications carefully rather than the marketing — I did not, and that is on me.`,
        daysAgo: 137,
        verified: true,
        helpful: 29,
    },
    {
        author: "Divya M.",
        rating: 5,
        title: "No complaints at all",
        body: (n) =>
            `Three months with the ${n} and it has been flawless. Delivery was quick, packaging was good, and the product does exactly what it says.`,
        daysAgo: 152,
        verified: true,
        helpful: 22,
    },
];

/** Small deterministic hash of the slug, used to pick a stable review window. */
function seedFrom(slug: string): number {
    let hash = 0;

    for (let i = 0; i < slug.length; i += 1) {
        hash = (hash * 31 + slug.charCodeAt(i)) % 100_000;
    }

    return hash;
}

/**
 * Reviews for one product.
 *
 * Higher-rated products surface their positive reviews first, which is what a
 * real "most helpful" sort would produce and stops a 4.9-star product leading
 * with a two-star complaint.
 */
export function buildReviews(base: ProductBase, count: number): Review[] {
    const seed = seedFrom(base.slug);

    // Within one star of the headline rating: a 4.9-rated product leading with
    // a three-star complaint is not what a "most helpful" sort would ever
    // produce, and it made the section read as though it belonged to a
    // different product.
    const candidates = [...POOL]
        .filter(
            (template) =>
                Math.abs(template.rating - Math.round(base.rating)) <= 1,
        )
        .sort((a, b) => b.helpful - a.helpful);

    // Rotate with wraparound so different products show different sets while
    // every set stays consistent with its own rating.
    const start = candidates.length > 0 ? seed % candidates.length : 0;

    const selected = Array.from({ length: Math.min(count, candidates.length) },
        (_, offset) => candidates[(start + offset) % candidates.length],
    );

    return selected.map((template, index) => {
        const date = new Date(base.releasedAt);
        date.setDate(date.getDate() + template.daysAgo);

        return {
            id: `${base.slug}-review-${index}`,
            author: template.author,
            rating: template.rating,
            title: template.title,
            body: template.body(base.name),
            date: date.toISOString().slice(0, 10),
            verified: template.verified,
            helpful: template.helpful,
        };
    });
}

/**
 * Rating histogram.
 *
 * Derived from the headline rating so the bars can never contradict the average
 * printed beside them, and forced to sum to exactly `reviewCount` by pushing
 * any rounding remainder into the top bucket.
 */
export function buildRatingBuckets(base: ProductBase): RatingBucket[] {
    // Weight the distribution towards the headline rating: the closer a star
    // value is to the average, the more reviews it gets.
    const weights = [5, 4, 3, 2, 1].map((stars) => {
        const distance = Math.abs(stars - base.rating);
        return 1 / (0.35 + distance * distance);
    });

    const total = weights.reduce((sum, weight) => sum + weight, 0);

    const buckets = [5, 4, 3, 2, 1].map((stars, index) => ({
        stars,
        count: Math.floor((weights[index] / total) * base.reviewCount),
    }));

    const assigned = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
    buckets[0].count += base.reviewCount - assigned;

    return buckets;
}
