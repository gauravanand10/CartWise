import { specGroupIcon, specGroupTitle, specTemplates } from "../constants";
import type {
    ProductBase,
    ProductCategory,
    SpecGroup,
    SpecItem,
} from "../types/product";

/**
 * Specification data.
 *
 * Split deliberately in two:
 *
 * - `categoryDefaults` owns the *shape* — which rows a category shows, in what
 *   order, with sensible shared values. Two smartphones can therefore never
 *   disagree about whether the row is called "Refresh rate" or "Refresh Rate".
 * - `productSpecs` owns only the values that actually distinguish one product
 *   from another, keyed by row label.
 *
 * The alternative — a full spec table per product — would be ~25 rows × 23
 * products of near-identical copy, and every new row would have to be added 23
 * times.
 */

type GroupedSpecs = Record<string, SpecItem[]>;

const categoryDefaults: Record<ProductCategory, GroupedSpecs> = {
    Smartphone: {
        display: [
            { label: "Screen size", value: "6.7-inch" },
            { label: "Panel", value: "LTPO AMOLED" },
            { label: "Resolution", value: "2796 × 1290" },
            { label: "Refresh rate", value: "120 Hz adaptive" },
            { label: "Peak brightness", value: "2,000 nits" },
        ],
        processor: [
            { label: "Chipset", value: "Flagship-class octa-core" },
            { label: "Operating system", value: "Android 16" },
            { label: "Update policy", value: "4 OS versions" },
        ],
        memory: [
            { label: "RAM", value: "12 GB" },
            { label: "Storage", value: "256 GB" },
            { label: "Expandable", value: "No" },
        ],
        camera: [
            { label: "Main camera", value: "50 MP, f/1.8, OIS" },
            { label: "Ultra-wide", value: "12 MP, f/2.2" },
            { label: "Telephoto", value: "12 MP, 3× optical" },
            { label: "Front camera", value: "12 MP, f/2.2" },
            { label: "Video", value: "4K 60 fps, 10-bit HDR" },
        ],
        battery: [
            { label: "Capacity", value: "5,000 mAh" },
            { label: "Wired charging", value: "45 W" },
            { label: "Wireless charging", value: "15 W" },
            { label: "Rated screen time", value: "Up to 26 hours video" },
        ],
        connectivity: [
            { label: "Network", value: "5G (sub-6 GHz)" },
            { label: "Wi-Fi", value: "Wi-Fi 7" },
            { label: "Bluetooth", value: "5.4" },
            { label: "Port", value: "USB-C 3.2" },
            { label: "Water resistance", value: "IP68" },
        ],
        physical: [
            { label: "Dimensions", value: "160 × 75 × 8.2 mm" },
            { label: "Weight", value: "198 g" },
            { label: "Frame", value: "Aluminium" },
            { label: "Colours", value: "Black, Silver, Blue" },
        ],
    },

    Laptop: {
        display: [
            { label: "Screen size", value: "14-inch" },
            { label: "Panel", value: "IPS" },
            { label: "Resolution", value: "2880 × 1800" },
            { label: "Refresh rate", value: "90 Hz" },
            { label: "Brightness", value: "500 nits" },
        ],
        processor: [
            { label: "Processor", value: "12-core" },
            { label: "Graphics", value: "Integrated" },
            { label: "Operating system", value: "Windows 11 Home" },
        ],
        memory: [
            { label: "RAM", value: "16 GB LPDDR5" },
            { label: "Storage", value: "512 GB NVMe SSD" },
            { label: "Upgradeable", value: "Storage only" },
        ],
        battery: [
            { label: "Capacity", value: "58 Wh" },
            { label: "Charger", value: "65 W USB-C" },
            { label: "Rated battery life", value: "Up to 14 hours" },
        ],
        connectivity: [
            { label: "Ports", value: "2 × Thunderbolt 4, 3.5 mm" },
            { label: "Wi-Fi", value: "Wi-Fi 6E" },
            { label: "Bluetooth", value: "5.3" },
            { label: "Webcam", value: "1080p" },
        ],
        physical: [
            { label: "Dimensions", value: "312 × 221 × 15.5 mm" },
            { label: "Weight", value: "1.24 kg" },
            { label: "Chassis", value: "Aluminium" },
            { label: "Keyboard", value: "Backlit, 1.3 mm travel" },
        ],
    },

    Headphones: {
        audio: [
            { label: "Driver", value: "30 mm dynamic" },
            { label: "Frequency response", value: "4 Hz – 40 kHz" },
            { label: "Noise cancellation", value: "Adaptive hybrid ANC" },
            { label: "Codecs", value: "SBC, AAC, LDAC" },
            { label: "Microphones", value: "8, beamforming" },
        ],
        battery: [
            { label: "Playback (ANC on)", value: "30 hours" },
            { label: "Playback (ANC off)", value: "40 hours" },
            { label: "Quick charge", value: "3 min = 3 hours" },
            { label: "Charging", value: "USB-C" },
        ],
        connectivity: [
            { label: "Bluetooth", value: "5.3" },
            { label: "Multipoint", value: "Two devices" },
            { label: "Wired mode", value: "3.5 mm included" },
            { label: "App", value: "Yes, with EQ" },
        ],
        physical: [
            { label: "Weight", value: "250 g" },
            { label: "Folding", value: "Flat-fold, hard case" },
            { label: "Cushions", value: "Synthetic leather" },
            { label: "Controls", value: "Touch + physical" },
        ],
    },

    Earbuds: {
        audio: [
            { label: "Driver", value: "11 mm dynamic" },
            { label: "Noise cancellation", value: "Adaptive ANC" },
            { label: "Transparency mode", value: "Yes" },
            { label: "Codecs", value: "SBC, AAC" },
            { label: "Spatial audio", value: "With head tracking" },
        ],
        battery: [
            { label: "Buds (ANC on)", value: "6 hours" },
            { label: "With case", value: "30 hours" },
            { label: "Quick charge", value: "5 min = 1 hour" },
            { label: "Case charging", value: "USB-C + wireless" },
        ],
        connectivity: [
            { label: "Bluetooth", value: "5.3" },
            { label: "Multipoint", value: "Yes" },
            { label: "Water resistance", value: "IPX4" },
            { label: "Wear detection", value: "Yes" },
        ],
        physical: [
            { label: "Bud weight", value: "5.3 g each" },
            { label: "Case weight", value: "45 g" },
            { label: "Ear tips", value: "Four sizes" },
            { label: "Controls", value: "Pinch + swipe" },
        ],
    },

    Smartwatch: {
        display: [
            { label: "Screen size", value: "1.4-inch" },
            { label: "Panel", value: "LTPO OLED" },
            { label: "Always-on", value: "Yes" },
            { label: "Peak brightness", value: "2,000 nits" },
            { label: "Cover glass", value: "Sapphire crystal" },
        ],
        processor: [
            { label: "Chipset", value: "Dual-core wearable SoC" },
            { label: "Operating system", value: "Wear OS 6" },
            { label: "Storage", value: "32 GB" },
        ],
        battery: [
            { label: "Typical use", value: "36 hours" },
            { label: "Low-power mode", value: "72 hours" },
            { label: "Charging", value: "Magnetic, 0–80% in 45 min" },
        ],
        connectivity: [
            { label: "Cellular", value: "Optional LTE" },
            { label: "Bluetooth", value: "5.3" },
            { label: "Wi-Fi", value: "802.11 b/g/n" },
            { label: "Sensors", value: "HR, SpO₂, ECG, skin temp" },
            { label: "Water resistance", value: "50 m (5 ATM)" },
        ],
        physical: [
            { label: "Case size", value: "44 mm" },
            { label: "Case material", value: "Aluminium" },
            { label: "Weight", value: "39 g" },
            { label: "Strap", value: "20 mm quick-release" },
        ],
    },

    Television: {
        display: [
            { label: "Screen size", value: "55-inch" },
            { label: "Panel", value: "OLED" },
            { label: "Resolution", value: "4K (3840 × 2160)" },
            { label: "Refresh rate", value: "120 Hz" },
            { label: "HDR", value: "Dolby Vision, HDR10, HLG" },
        ],
        processor: [
            { label: "Picture processor", value: "Dedicated AI upscaler" },
            { label: "Operating system", value: "Google TV" },
            { label: "Gaming features", value: "VRR, ALLM, 4K 120 Hz" },
        ],
        audio: [
            { label: "Speakers", value: "2.2 channel, 40 W" },
            { label: "Formats", value: "Dolby Atmos, DTS:X" },
            { label: "eARC", value: "Yes" },
        ],
        connectivity: [
            { label: "HDMI", value: "4 × HDMI 2.1" },
            { label: "USB", value: "3 × USB 2.0" },
            { label: "Wi-Fi", value: "Wi-Fi 6" },
            { label: "Bluetooth", value: "5.3" },
            { label: "Tuner", value: "Digital + satellite" },
        ],
        physical: [
            { label: "Dimensions (with stand)", value: "1228 × 745 × 230 mm" },
            { label: "Weight (with stand)", value: "18.5 kg" },
            { label: "Wall mount", value: "VESA 300 × 200" },
            { label: "Power consumption", value: "120 W typical" },
        ],
    },

    Accessories: {
        connectivity: [
            { label: "Connection", value: "Bluetooth 5.2 + 2.4 GHz USB" },
            { label: "Multi-device", value: "Up to three" },
            { label: "Compatibility", value: "Windows, macOS, Linux, iPadOS" },
            { label: "Software", value: "Vendor configuration app" },
        ],
        battery: [
            { label: "Battery life", value: "70 days" },
            { label: "Charging", value: "USB-C" },
            { label: "Quick charge", value: "1 min = 3 hours" },
        ],
        physical: [
            { label: "Dimensions", value: "125 × 84 × 51 mm" },
            { label: "Weight", value: "141 g" },
            { label: "Material", value: "Recycled plastic" },
            { label: "Warranty", value: "1 year" },
        ],
    },
};

/**
 * Per-product overrides, keyed by row label.
 *
 * Only the values that actually differ from the category default appear here —
 * everything else is inherited, which is what keeps this file readable.
 */
const productSpecs: Record<string, Record<string, string>> = {
    "iphone-16-pro": {
        "Screen size": "6.3-inch",
        Panel: "Super Retina XDR OLED",
        Resolution: "2622 × 1206",
        Chipset: "Apple A18 Pro",
        "Operating system": "iOS 19",
        "Update policy": "5+ OS versions",
        RAM: "8 GB",
        "Main camera": "48 MP, f/1.78, second-gen sensor-shift OIS",
        Telephoto: "12 MP, 5× tetraprism",
        Video: "4K 120 fps ProRes, Log 2",
        Capacity: "3,582 mAh",
        "Wired charging": "30 W",
        Frame: "Grade 5 titanium",
        Weight: "199 g",
        Dimensions: "149.6 × 71.5 × 8.25 mm",
        Colours: "Black, White, Natural, Desert",
    },
    "samsung-galaxy-s25-ultra": {
        "Screen size": "6.9-inch",
        Resolution: "3120 × 1440",
        "Peak brightness": "2,600 nits",
        Chipset: "Snapdragon 8 Elite for Galaxy",
        "Update policy": "7 OS versions",
        "Main camera": "200 MP, f/1.7, OIS",
        Telephoto: "50 MP, 5× optical",
        Video: "8K 30 fps, 4K 120 fps",
        Frame: "Titanium",
        Weight: "218 g",
        Dimensions: "162.8 × 77.6 × 8.2 mm",
        Colours: "Titanium Black, Grey, Silver",
    },
    "google-pixel-10": {
        "Screen size": "6.3-inch",
        Chipset: "Google Tensor G5",
        "Update policy": "7 OS versions",
        RAM: "16 GB",
        "Main camera": "50 MP, f/1.68, OIS",
        Telephoto: "48 MP, 5× optical",
        Weight: "207 g",
        Colours: "Obsidian, Porcelain, Peony",
    },
    "oneplus-14": {
        "Screen size": "6.82-inch",
        Chipset: "Snapdragon 8 Elite",
        "Operating system": "OxygenOS 16",
        RAM: "16 GB",
        Capacity: "6,100 mAh",
        "Wired charging": "100 W SuperVOOC",
        "Wireless charging": "50 W",
        Weight: "212 g",
    },
    "oneplus-13": {
        "Screen size": "6.82-inch",
        Chipset: "Snapdragon 8 Gen 3",
        "Operating system": "OxygenOS 15",
        Capacity: "5,400 mAh",
        "Wired charging": "80 W SuperVOOC",
        Weight: "210 g",
    },
    "nothing-phone-3": {
        "Screen size": "6.6-inch",
        Chipset: "Snapdragon 8s Gen 4",
        "Operating system": "Nothing OS 4",
        Frame: "Aluminium with Glyph LEDs",
        Telephoto: "Not included",
        Weight: "194 g",
        Colours: "White, Black",
    },

    "macbook-air-m4": {
        "Screen size": "13.6-inch",
        Panel: "Liquid Retina IPS",
        Resolution: "2560 × 1664",
        "Refresh rate": "60 Hz",
        Processor: "Apple M4, 10-core CPU",
        Graphics: "10-core GPU",
        "Operating system": "macOS 16",
        RAM: "16 GB unified",
        Upgradeable: "No",
        Capacity: "53.8 Wh",
        "Rated battery life": "Up to 18 hours",
        Charger: "35 W dual USB-C",
        Ports: "2 × Thunderbolt 4, MagSafe 3, 3.5 mm",
        Weight: "1.24 kg",
        Dimensions: "304 × 215 × 11.3 mm",
    },
    "dell-xps-14": {
        Panel: "OLED InfinityEdge",
        Resolution: "3200 × 2000",
        "Refresh rate": "120 Hz",
        Processor: "Intel Core Ultra 7 165H",
        Graphics: "NVIDIA RTX 4050, 6 GB",
        RAM: "32 GB LPDDR5X",
        Storage: "1 TB NVMe SSD",
        Capacity: "69.5 Wh",
        Charger: "100 W USB-C",
        Weight: "1.74 kg",
    },
    "hp-spectre-x360": {
        Panel: "OLED touch, 2-in-1",
        Processor: "Intel Core Ultra 7 155H",
        RAM: "16 GB LPDDR5",
        Storage: "1 TB NVMe SSD",
        Weight: "1.44 kg",
        Keyboard: "Backlit, 360° hinge",
    },
    "lenovo-yoga-pro-9i": {
        "Screen size": "16-inch",
        Panel: "Mini-LED PureSight Pro",
        Resolution: "3200 × 2000",
        "Refresh rate": "165 Hz",
        Processor: "Intel Core Ultra 9 185H",
        Graphics: "NVIDIA RTX 4060, 8 GB",
        RAM: "32 GB LPDDR5X",
        Storage: "1 TB NVMe SSD",
        Weight: "2.15 kg",
    },

    "sony-wh-1000xm6": {
        Driver: "30 mm carbon-fibre composite",
        "Noise cancellation": "QN3 processor, 12 mics",
        Codecs: "SBC, AAC, LDAC, LC3",
        Weight: "254 g",
    },
    "airpods-pro-3": {
        Driver: "Custom high-excursion",
        Codecs: "AAC, Apple Lossless (via H3)",
        "Noise cancellation": "Adaptive, 2× the H2",
        "Buds (ANC on)": "8 hours",
        "With case": "36 hours",
        "Water resistance": "IP57",
        "Bud weight": "5.3 g each",
    },
    "samsung-galaxy-buds-3-pro": {
        Driver: "2-way: 10.5 mm woofer + 6.1 mm tweeter",
        Codecs: "SBC, AAC, SSC UHQ",
        "Buds (ANC on)": "6 hours",
        "With case": "26 hours",
    },
    "samsung-galaxy-buds-4-pro": {
        Driver: "2-way: 11 mm woofer + 6.1 mm tweeter",
        Codecs: "SBC, AAC, SSC UHQ",
        "Buds (ANC on)": "7 hours",
        "With case": "31 hours",
        "Water resistance": "IP57",
    },

    "apple-watch-series-11": {
        "Screen size": "1.9-inch",
        Panel: "LTPO3 OLED",
        Chipset: "Apple S11 SiP",
        "Operating system": "watchOS 13",
        Storage: "64 GB",
        "Typical use": "24 hours",
        "Low-power mode": "48 hours",
        "Case size": "46 mm",
        "Cover glass": "Ion-X / sapphire",
        Weight: "38 g",
    },
    "apple-watch-ultra-3": {
        "Screen size": "2.1-inch",
        Chipset: "Apple S11 SiP",
        "Operating system": "watchOS 13",
        Storage: "64 GB",
        "Typical use": "42 hours",
        "Low-power mode": "72 hours",
        "Case size": "49 mm",
        "Case material": "Grade 5 titanium",
        "Water resistance": "100 m (EN13319 diving)",
        Weight: "61 g",
    },
    "samsung-galaxy-watch-8": {
        "Screen size": "1.5-inch",
        Chipset: "Exynos W1000",
        Sensors: "HR, SpO₂, ECG, BIA body composition",
        "Case size": "44 mm",
        Weight: "34 g",
    },
    "google-pixel-watch-4": {
        "Screen size": "1.3-inch",
        Chipset: "Snapdragon W5 Gen 2",
        "Cover glass": "Gorilla Glass 5",
        "Case size": "41 mm",
        Weight: "31 g",
        Sensors: "HR, SpO₂, ECG, skin temp, Fitbit suite",
    },

    "lg-oled-c5": {
        "Screen size": "65-inch",
        Panel: "OLED evo with Brightness Booster",
        "Refresh rate": "144 Hz",
        "Picture processor": "α9 AI Processor Gen 8",
        "Operating system": "webOS 25",
        Speakers: "2.2 channel, 40 W",
        "Dimensions (with stand)": "1442 × 859 × 230 mm",
        "Weight (with stand)": "24.2 kg",
        "Wall mount": "VESA 300 × 200",
    },
    "samsung-neo-qled-qn90f": {
        "Screen size": "65-inch",
        Panel: "Neo QLED Mini-LED, anti-glare",
        "Refresh rate": "144 Hz",
        HDR: "HDR10+, HLG",
        "Picture processor": "NQ4 AI Gen3",
        "Operating system": "Tizen",
        Speakers: "4.2.2 channel, 60 W",
        "Dimensions (with stand)": "1447 × 906 × 279 mm",
        "Weight (with stand)": "26.4 kg",
    },
    "sony-bravia-9": {
        "Screen size": "65-inch",
        Panel: "Mini-LED with backlight master drive",
        "Picture processor": "XR Processor with Backlight Master Drive",
        "Operating system": "Google TV",
        Speakers: "2.2.2 Acoustic Multi-Audio+, 70 W",
        "Dimensions (with stand)": "1449 × 883 × 371 mm",
        "Weight (with stand)": "30.5 kg",
    },

    "logitech-mx-master-3s": {
        Connection: "Bluetooth 5.2 + Logi Bolt USB",
        Software: "Logi Options+",
        "Battery life": "70 days",
        Dimensions: "125 × 84 × 51 mm",
        Weight: "141 g",
    },
    "keychron-k8-pro": {
        Connection: "Bluetooth 5.1 + USB-C wired",
        "Multi-device": "Up to three",
        Software: "QMK / VIA, fully remappable",
        "Battery life": "300 hours (backlight off)",
        Dimensions: "356 × 127 × 38 mm",
        Weight: "913 g",
        Material: "Aluminium frame, hot-swap sockets",
    },
};

/**
 * Assembles the grouped specification table for one product.
 *
 * Group order comes from the category template; values come from the category
 * default with any per-product override applied on top. A "Released" row is
 * appended to the last group so the launch date is visible without a
 * near-empty "General" section of its own.
 */
export function buildSpecGroups(base: ProductBase): SpecGroup[] {
    const overrides = productSpecs[base.slug] ?? {};
    const defaults = categoryDefaults[base.category];

    const groups = specTemplates[base.category].map<SpecGroup>((id) => ({
        id,
        title: specGroupTitle[id] ?? id,
        icon: specGroupIcon[id] ?? specGroupIcon.physical,
        items: (defaults[id] ?? []).map((item) => ({
            label: item.label,
            value: overrides[item.label] ?? item.value,
        })),
    }));

    // Chapter 26.5 removed the "Released" row that used to sit here.
    //
    // It read `base.releasedAt`, an ISO date that existed only in the local
    // catalogue file and had never been researched for any product — the values
    // were plausible-looking and invented. A release date is a checkable fact
    // about someone else's product, which makes inventing one worse than
    // omitting it, so the field and this row went together. Brand stays: it
    // comes from the database.
    const last = groups.at(-1);
    if (last) {
        last.items = [
            ...last.items,
            { label: "Brand", value: base.brand },
        ];
    }

    return groups;
}
