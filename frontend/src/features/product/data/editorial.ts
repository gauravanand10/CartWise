import type { AiVerdict, ProductBase, ProductCategory } from "../types/product";

/**
 * Editorial content: description copy, highlights, box contents and the static
 * AI verdict.
 *
 * Category writers produce a complete, product-specific draft by interpolating
 * the base record, and `productEditorial` overrides only the parts worth
 * hand-writing for a given product. That way every product in the catalogue has
 * a full description page — a per-product-only approach would leave the long
 * tail with empty sections.
 *
 * All of it is static mock content. No model is called anywhere in this chapter.
 */

export interface Editorial {
    overview: string;
    highlights: string[];
    features: string[];
    boxContents: string[];
    ai: Omit<AiVerdict, "score" | "confidence">;
}

type Writer = (base: ProductBase) => Editorial;

const categoryWriters: Record<ProductCategory, Writer> = {
    Smartphone: (p) => ({
        overview: `The ${p.name} is ${p.brand}'s current flagship phone. It pairs a high-refresh OLED panel with the fastest silicon ${p.brand} ships, and the camera system is the part most buyers will notice day to day — particularly in low light, where the larger main sensor and multi-frame processing do most of the work. Battery life comfortably covers a full day of mixed use.`,
        highlights: [
            "Adaptive high-refresh OLED that stays readable in direct sun",
            "Flagship chipset with headroom for years of updates",
            "Multi-camera system with optical stabilisation",
            "All-day battery with fast wired charging",
        ],
        features: [
            "Adaptive refresh rate that drops to 1 Hz on static content to save power",
            "Computational photography pipeline for night and portrait modes",
            "IP68 dust and water resistance",
            "Wireless and reverse wireless charging",
            "Multi-year OS and security update commitment",
        ],
        boxContents: [
            `${p.name} handset`,
            "USB-C to USB-C cable",
            "SIM ejector tool",
            "Quick start guide and warranty card",
        ],
        ai: {
            summary: `A well-rounded flagship. The ${p.name} is the phone to buy if you want the camera and the software support without shopping on price — you are paying a premium over the upper-mid tier for photography, display brightness and update length rather than raw speed.`,
            pros: [
                "Camera performance holds up in poor light",
                "Display brightness is class-leading",
                "Long software support window",
                "Build quality and water resistance are flagship-grade",
            ],
            cons: [
                "Significantly more expensive than upper-mid alternatives",
                "Charging speed trails Chinese competitors",
                "No storage expansion",
            ],
            bestFor: ["Photography", "Long-term ownership", "Gaming"],
            whoShouldBuy:
                "Buy it if you keep a phone for three or more years and take a lot of photos — the camera and the update policy are where the money goes.",
            whoShouldAvoid:
                "Skip it if you mainly message and browse. An upper-mid phone at half the price will feel identical for those tasks.",
        },
    }),

    Laptop: (p) => ({
        overview: `The ${p.name} is aimed at people who carry a laptop every day. ${p.brand} has prioritised chassis rigidity, keyboard feel and battery life over raw benchmark scores, and the result is a machine that stays quiet and cool through everyday work. Sustained heavy workloads are where you will find its limits.`,
        highlights: [
            "High-resolution display with accurate colour out of the box",
            "Full-day battery under real mixed use",
            "Rigid aluminium chassis with no flex",
            "Quiet under normal load",
        ],
        features: [
            "Colour-calibrated panel suitable for photo and video work",
            "Backlit keyboard with a large glass trackpad",
            "Fast NVMe storage",
            "USB-C / Thunderbolt charging from either side",
            "Windows Hello or biometric sign-in",
        ],
        boxContents: [
            `${p.name}`,
            "USB-C power adapter",
            "USB-C charging cable",
            "Quick start guide and warranty card",
        ],
        ai: {
            summary: `A strong everyday ultrabook. The ${p.name} makes sense if portability and battery life matter more than peak sustained performance — it is a better writing, browsing and meetings machine than it is a rendering box.`,
            pros: [
                "Battery life genuinely lasts a working day",
                "Excellent keyboard and trackpad",
                "Display is bright and colour-accurate",
                "Stays quiet and cool at typical load",
            ],
            cons: [
                "Limited port selection",
                "RAM is not user-upgradeable",
                "Sustained heavy workloads will throttle",
            ],
            bestFor: ["Travel", "Office work", "Students"],
            whoShouldBuy:
                "Buy it if you work in cafés, on trains or in meetings and want to leave the charger behind.",
            whoShouldAvoid:
                "Skip it if you render video or compile large projects daily — a thicker laptop with better cooling will finish those jobs faster.",
        },
    }),

    Headphones: (p) => ({
        overview: `The ${p.name} is a noise-cancelling over-ear pair built for commuting and flights. ${p.brand} tunes them slightly warm out of the box, with an app to flatten that if you prefer. Comfort over long sessions is the quiet advantage — the clamping force is light enough to wear for a full flight.`,
        highlights: [
            "Class-leading adaptive noise cancellation",
            "30+ hours of playback with ANC enabled",
            "Multipoint pairing across two devices",
            "Folds flat into a hard case",
        ],
        features: [
            "Adaptive noise cancellation that adjusts to your surroundings",
            "Transparency mode for announcements and conversation",
            "Wear detection that pauses playback when removed",
            "Companion app with a parametric equaliser",
            "Wired 3.5 mm fallback for in-flight entertainment",
        ],
        boxContents: [
            `${p.name} headphones`,
            "Hard carry case",
            "USB-C charging cable",
            "3.5 mm audio cable",
            "Airline adapter",
        ],
        ai: {
            summary: `The default recommendation in this price bracket. The ${p.name} wins on noise cancellation and comfort rather than absolute sound quality — audiophiles will prefer wired alternatives at the same price, but nobody flies with those.`,
            pros: [
                "Noise cancellation is the best available",
                "Comfortable for multi-hour wear",
                "Battery life outlasts any long-haul flight",
                "Call quality is genuinely usable",
            ],
            cons: [
                "Warm default tuning needs EQ for neutral listening",
                "Touch controls can misfire with gloves",
                "Expensive against wired alternatives",
            ],
            bestFor: ["Flights", "Commuting", "Open-plan offices"],
            whoShouldBuy:
                "Buy them if you fly or commute regularly — the noise cancellation is the whole product and it delivers.",
            whoShouldAvoid:
                "Skip them if you listen at a desk in a quiet room. You are paying for ANC you will never switch on.",
        },
    }),

    Earbuds: (p) => ({
        overview: `The ${p.name} are compact noise-cancelling earbuds designed to disappear in a pocket. They are at their best inside ${p.brand}'s own ecosystem, where pairing, switching and spatial audio are handled automatically. On other platforms they work well but lose some of the convenience.`,
        highlights: [
            "Adaptive noise cancellation in a pocketable case",
            "Automatic switching between your own devices",
            "Spatial audio with head tracking",
            "Wireless charging case",
        ],
        features: [
            "Adaptive ANC with a transparency mode",
            "In-ear detection that pauses on removal",
            "Sweat and water resistance for workouts",
            "Find-my support for a misplaced case",
            "Fit test to confirm the right ear tip size",
        ],
        boxContents: [
            `${p.name}`,
            "Charging case",
            "Four sizes of silicone ear tips",
            "USB-C charging cable",
            "Documentation",
        ],
        ai: {
            summary: `Excellent inside their own ecosystem, merely good outside it. The ${p.name} are the obvious pick if your phone is from ${p.brand}; if it is not, cheaper buds get you most of the way.`,
            pros: [
                "Seamless pairing and device switching",
                "Effective noise cancellation for the size",
                "Genuinely pocketable case",
                "Comfortable for long listening",
            ],
            cons: [
                "Best features are locked to one ecosystem",
                "Battery life trails over-ear alternatives",
                "Ear tips wear out and need replacing",
            ],
            bestFor: ["Workouts", "Calls", "Travel light"],
            whoShouldBuy:
                "Buy them if you already own the matching phone and want earbuds you never have to think about.",
            whoShouldAvoid:
                "Skip them if you are on another platform, or if you want maximum battery life per charge.",
        },
    }),

    Smartwatch: (p) => ({
        overview: `The ${p.name} is a full smartwatch rather than a fitness band — notifications, payments and apps alongside the health tracking. ${p.brand}'s sensor suite is the draw, and the battery is sized for daily charging rather than week-long endurance.`,
        highlights: [
            "Always-on display that stays legible outdoors",
            "Comprehensive health sensor suite",
            "On-wrist payments and app support",
            "Swim-proof water resistance",
        ],
        features: [
            "Continuous heart rate with irregular rhythm notifications",
            "Blood oxygen and skin temperature sensing",
            "Sleep staging with a nightly readiness summary",
            "Workout auto-detection across common activities",
            "Quick-release straps in standard sizes",
        ],
        boxContents: [
            `${p.name}`,
            "Fitted strap",
            "Magnetic charging cable",
            "Quick start guide",
        ],
        ai: {
            summary: `A capable everyday smartwatch. The ${p.name} is worth it for the health tracking and notification handling; if you only want step counts and sleep, a fitness band does that for a fraction of the price and a week of battery.`,
            pros: [
                "Health sensors are accurate and well presented",
                "Display is bright enough for outdoor running",
                "Tight integration with its phone platform",
                "Straps are easy to swap",
            ],
            cons: [
                "Needs charging most nights",
                "Locked to one phone platform",
                "Cellular models cost noticeably more",
            ],
            bestFor: ["Fitness tracking", "Notifications", "Contactless payments"],
            whoShouldBuy:
                "Buy it if you want health data and wrist notifications and do not mind a nightly charge.",
            whoShouldAvoid:
                "Skip it if multi-day battery matters, or if your phone is on the other platform.",
        },
    }),

    Television: (p) => ({
        overview: `The ${p.name} is built for a dedicated viewing room as much as a living room. ${p.brand}'s picture processing is the differentiator — upscaling and motion handling are noticeably better than budget panels — and the gaming feature set is complete enough for a current-generation console.`,
        highlights: [
            "Reference-grade picture processing and upscaling",
            "Full HDMI 2.1 feature set for consoles",
            "Wide viewing angles with no colour shift",
            "Low input lag in game mode",
        ],
        features: [
            "Variable refresh rate and auto low-latency mode",
            "Dolby Vision and Dolby Atmos passthrough",
            "Filmmaker mode that disables motion smoothing",
            "Built-in streaming platform with voice search",
            "eARC for a single-cable soundbar connection",
        ],
        boxContents: [
            `${p.name} panel`,
            "Table-top stand and fixing screws",
            "Voice remote with batteries",
            "Power cable",
            "Setup guide and warranty card",
        ],
        ai: {
            summary: `An excellent panel if the room suits it. The ${p.name} rewards controlled lighting and a proper source; feeding it low-bitrate streams in a bright room wastes most of what you are paying for.`,
            pros: [
                "Picture processing is genuinely class-leading",
                "Complete gaming feature set",
                "Excellent motion handling in film content",
                "Sensible, fast smart platform",
            ],
            cons: [
                "Built-in speakers need a soundbar to match the picture",
                "Premium over a mid-range panel is substantial",
                "Bright rooms will limit contrast",
            ],
            bestFor: ["Films", "Console gaming", "Sport"],
            whoShouldBuy:
                "Buy it if you watch films properly and can control the light in the room.",
            whoShouldAvoid:
                "Skip it if the television lives in a sunlit room and mostly plays background content.",
        },
    }),

    Accessories: (p) => ({
        overview: `The ${p.name} is a desk accessory built to last. ${p.brand} has focused on ergonomics, build quality and configurability rather than novelty features, and it pairs with multiple machines so it can follow you between them.`,
        highlights: [
            "Multi-device pairing with instant switching",
            "Long battery life measured in weeks",
            "Fully remappable with the companion software",
            "Built to survive daily use",
        ],
        features: [
            "Switch between up to three paired devices",
            "USB-C charging with a fast top-up",
            "Per-application customisation profiles",
            "Cross-platform support",
            "Quiet operation for shared spaces",
        ],
        boxContents: [
            `${p.name}`,
            "USB-C charging cable",
            "Wireless receiver",
            "Documentation",
        ],
        ai: {
            summary: `A safe, long-lived purchase. The ${p.name} is the accessory people replace least often, and the multi-device switching is the feature you will actually use daily.`,
            pros: [
                "Ergonomics hold up over long sessions",
                "Battery life is measured in weeks, not days",
                "Configuration software is genuinely useful",
                "Works across every major platform",
            ],
            cons: [
                "Costs several times a basic equivalent",
                "Software is required for the best features",
                "Too large for a laptop bag in some cases",
            ],
            bestFor: ["Desk work", "Multi-machine setups", "Long sessions"],
            whoShouldBuy:
                "Buy it if you work at a desk all day and switch between machines.",
            whoShouldAvoid:
                "Skip it if you use a laptop on the move and rarely dock.",
        },
    }),
};

/**
 * Hand-written overrides for the products people actually land on first.
 *
 * Anything omitted falls through to the category writer above.
 */
const productEditorial: Record<string, Partial<Editorial>> = {
    "iphone-16-pro": {
        overview:
            "The iPhone 16 Pro is the most complete phone Apple has shipped. The titanium frame drops meaningful weight against the steel generations, the A18 Pro has headroom nothing on the App Store currently needs, and the 5× tetraprism telephoto finally makes the Pro worth the premium over the standard model. Video is the standout: 4K 120 fps in ProRes Log, straight to an external drive over USB-C.",
        highlights: [
            "5× tetraprism telephoto with sensor-shift stabilisation",
            "4K 120 fps ProRes Log recording to external storage",
            "Grade 5 titanium frame, 199 g",
            "Five or more years of iOS updates",
        ],
        ai: {
            summary:
                "The best video camera in a phone, and the longest software support you can buy. The iPhone 16 Pro is worth the premium specifically for the telephoto and the recording pipeline — if you shoot neither, the standard iPhone 16 is the smarter purchase.",
            pros: [
                "Video capability is unmatched at any phone price",
                "5× telephoto is a genuine upgrade over the base model",
                "Titanium build is noticeably lighter than steel",
                "Software support runs longer than any Android rival",
            ],
            cons: [
                "30 W charging is slow for the money",
                "Base 128 GB fills fast if you shoot ProRes",
                "No storage expansion, ever",
            ],
            bestFor: ["Video", "Photography", "Long-term ownership"],
            whoShouldBuy:
                "Buy it if you shoot video seriously or want one phone for the next five years.",
            whoShouldAvoid:
                "Skip it for the standard iPhone 16 if you never use the telephoto — you would be paying for a lens you do not touch.",
        },
    },
    "samsung-galaxy-s25-ultra": {
        overview:
            "The Galaxy S25 Ultra is the most feature-dense phone on sale. The 6.9-inch panel hits 2,600 nits, which makes it the only flagship genuinely readable in Indian midday sun, and the built-in S Pen remains something no rival offers. Seven years of OS updates now matches Google's commitment.",
        highlights: [
            "2,600-nit 6.9-inch panel, the brightest on any phone",
            "Built-in S Pen for notes and precise editing",
            "200 MP main sensor with a 5× optical telephoto",
            "Seven years of OS and security updates",
        ],
        ai: {
            summary:
                "The most capable Android phone, and the largest. The S25 Ultra earns its price on display brightness, the S Pen and update length — but it is a two-handed device and the 200 MP sensor is more about flexibility than everyday image quality.",
            pros: [
                "Brightest display available, readable in direct sun",
                "S Pen has no equivalent on any competitor",
                "Seven-year update commitment",
                "Zoom range is genuinely useful",
            ],
            cons: [
                "218 g and 6.9 inches is too large for one-handed use",
                "200 MP mode is slow and rarely the better choice",
                "One UI ships with a lot of preinstalled software",
            ],
            bestFor: ["Productivity", "Zoom photography", "Outdoor use"],
            whoShouldBuy:
                "Buy it if you want the most capable Android phone and do not mind the size.",
            whoShouldAvoid:
                "Skip it if you use your phone one-handed — the standard S25 does almost everything this does in a smaller body.",
        },
    },
    "macbook-air-m4": {
        overview:
            "The MacBook Air M4 is the laptop most people should buy. It is fanless, so it is completely silent; the M4 is fast enough that the lack of active cooling only shows up in sustained exports; and the 18-hour battery rating survives contact with real use. The 13.6-inch Liquid Retina panel is sharp and colour-accurate, though it stays at 60 Hz.",
        highlights: [
            "Completely fanless and silent under normal load",
            "18-hour rated battery that holds up in practice",
            "Apple M4 with 10-core CPU and GPU",
            "1.24 kg with a rigid aluminium chassis",
        ],
        ai: {
            summary:
                "The default laptop recommendation. The MacBook Air M4 is silent, light and lasts all day, and the only people who should look elsewhere are those running sustained heavy workloads or needing more than two ports.",
            pros: [
                "Silent operation — there is no fan to hear",
                "Battery life genuinely lasts a full working day",
                "Best trackpad on any laptop",
                "Excellent performance per watt",
            ],
            cons: [
                "Only two Thunderbolt ports, both on one side",
                "60 Hz display feels dated next to 120 Hz rivals",
                "RAM and storage are fixed at purchase",
                "Sustained exports throttle without a fan",
            ],
            bestFor: ["Travel", "Writing and office work", "Students"],
            whoShouldBuy:
                "Buy it if you want a quiet, light laptop that lasts all day and you can live with two ports.",
            whoShouldAvoid:
                "Skip it for the MacBook Pro if you export video daily — the Air will throttle where the Pro will not.",
        },
    },
    "sony-wh-1000xm6": {
        overview:
            "The WH-1000XM6 is the quietest pair of headphones you can buy. The QN3 processor and twelve microphones cut engine drone almost entirely, and Sony has returned to a flat-folding hinge after the XM5 dropped it. The default tuning is warm; the app's parametric EQ fixes that in about a minute.",
        highlights: [
            "QN3 processor with twelve microphones for ANC",
            "30 hours of playback with noise cancelling on",
            "Flat-folding hinge and hard case are back",
            "LDAC and LC3 for high-bitrate wireless",
        ],
        ai: {
            summary:
                "The best noise cancellation available, full stop. The XM6 is the right buy for flights and commuting; if you listen at a quiet desk, the same money spent on wired headphones gets far better sound.",
            pros: [
                "Noise cancellation is measurably ahead of every rival",
                "Comfortable across a long-haul flight",
                "Folds flat again, unlike the XM5",
                "Call quality is clear even in noise",
            ],
            cons: [
                "Warm default tuning needs EQ to sound neutral",
                "Touch panel misfires in cold weather with gloves",
                "Expensive against wired alternatives",
            ],
            bestFor: ["Flights", "Commuting", "Open-plan offices"],
            whoShouldBuy:
                "Buy them if you fly or commute — the ANC is worth every rupee in that context.",
            whoShouldAvoid:
                "Skip them if you listen in a quiet room. Wired headphones at this price sound considerably better.",
        },
    },
    "lg-oled-c5": {
        overview:
            "The C5 is the safest television recommendation at any price. OLED gives you per-pixel black levels, the α9 Gen 8 processor handles upscaling and motion better than anything at this money, and all four HDMI 2.1 ports support 4K 144 Hz — so both consoles and a PC can stay connected. Bright rooms are its only real weakness.",
        highlights: [
            "OLED evo panel with per-pixel contrast",
            "Four HDMI 2.1 ports at 4K 144 Hz",
            "α9 AI Processor Gen 8 upscaling",
            "Dolby Vision and Filmmaker mode",
        ],
        ai: {
            summary:
                "The reference living-room television. The C5 is the right choice for films and console gaming in a room where you can control the light; a Mini-LED panel is the better call for a bright, sunlit space.",
            pros: [
                "Perfect blacks and per-pixel contrast",
                "All four HDMI ports are full-bandwidth 2.1",
                "Motion handling in film content is excellent",
                "webOS is fast and well organised",
            ],
            cons: [
                "Not bright enough for a sunlit room",
                "Built-in audio needs a soundbar",
                "Static-content burn-in risk over years of use",
            ],
            bestFor: ["Films", "Console gaming", "Dark rooms"],
            whoShouldBuy:
                "Buy it if you watch films in a room you can darken and want the best picture for the money.",
            whoShouldAvoid:
                "Skip it for a Mini-LED set if the room is bright all day, or if the screen shows a static channel logo for hours.",
        },
    },
};

/** Category draft with any hand-written overrides applied on top. */
export function buildEditorial(base: ProductBase): Editorial {
    const draft = categoryWriters[base.category](base);
    const override = productEditorial[base.slug];

    if (!override) return draft;

    return {
        ...draft,
        ...override,
        ai: { ...draft.ai, ...override.ai },
    };
}
