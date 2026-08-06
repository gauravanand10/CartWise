import type { CompareResult } from "../types/compare";

export const compareData: CompareResult = {
    winner: "right",

    confidence: 96,

    summary:
        "Samsung Galaxy S25 Ultra delivers the strongest overall flagship experience thanks to its industry-leading display, exceptional battery life, Snapdragon Elite performance and excellent value. The iPhone 16 Pro remains one of the best choices for users deeply invested in Apple's ecosystem and offers outstanding cameras together with long-term software support.",

    leftProduct: {
        id: "iphone16pro",

        brand: "Apple",

        name: "iPhone 16 Pro",

        image: "/assets/products/phones/iphone16pro.png",

        rating: 4.8,

        reviews: 19482,

        price: 129900,

        originalPrice: 139900,

        score: {
            performance: 91,
            camera: 96,
            battery: 88,
            display: 94,
            value: 90,
            overall: 92,
        },

        pros: [
            "Excellent cameras",
            "Best video recording",
            "Premium titanium build",
            "Smooth iOS experience",
            "Long software support",
        ],

        cons: [
            "Expensive",
            "Slow charging",
            "Limited customization",
            "No charger included",
        ],

        stores: [
            {
                store: "Amazon",
                logo: "/assets/stores/amazon/logo.png",
                price: 129900,
                delivery: "Tomorrow",
                availability: "In Stock",
            },
            {
                store: "Flipkart",
                logo: "/assets/stores/flipkart/logo.png",
                price: 128990,
                delivery: "Tomorrow",
                availability: "In Stock",
            },
            {
                store: "Croma",
                logo: "/assets/stores/croma/logo.png",
                price: 130499,
                delivery: "2 Days",
                availability: "In Stock",
            },
            {
                store: "Reliance Digital",
                logo: "/assets/stores/reliance-digital/logo.png",
                price: 129499,
                delivery: "Tomorrow",
                availability: "Limited",
            },
        ],

        specifications: [
            {
                label: "Display",
                left: "6.3-inch OLED",
                right: "6.9-inch AMOLED",
                winner: "right",
            },
            {
                label: "Resolution",
                left: "2622 × 1206",
                right: "3120 × 1440",
                winner: "right",
            },
            {
                label: "Refresh Rate",
                left: "120 Hz",
                right: "120 Hz",
                winner: "draw",
            },
            {
                label: "Processor",
                left: "Apple A18 Pro",
                right: "Snapdragon 8 Elite",
                winner: "right",
            },
            {
                label: "RAM",
                left: "8 GB",
                right: "12 GB",
                winner: "right",
            },
            {
                label: "Storage",
                left: "256 GB",
                right: "256 GB",
                winner: "draw",
            },
            {
                label: "Battery",
                left: "3582 mAh",
                right: "5000 mAh",
                winner: "right",
            },
            {
                label: "Charging",
                left: "27W",
                right: "45W",
                winner: "right",
            },
            {
                label: "Wireless Charging",
                left: "MagSafe",
                right: "Qi2",
                winner: "draw",
            },
            {
                label: "Rear Camera",
                left: "48+48+12 MP",
                right: "200+50+50+10 MP",
                winner: "right",
            },
            {
                label: "Front Camera",
                left: "12 MP",
                right: "12 MP",
                winner: "draw",
            },
            {
                label: "Weight",
                left: "199 g",
                right: "218 g",
                winner: "left",
            },
            {
                label: "Water Resistance",
                left: "IP68",
                right: "IP68",
                winner: "draw",
            },
            {
                label: "Fingerprint",
                left: "Face ID",
                right: "Ultrasonic",
                winner: "draw",
            },
            {
                label: "Operating System",
                left: "iOS 26",
                right: "One UI 8",
                winner: "draw",
            },
        ],
    },

    rightProduct: {
        id: "galaxys25ultra",

        brand: "Samsung",

        name: "Galaxy S25 Ultra",

        image: "/assets/products/phones/s25ultra.png",

        rating: 4.9,

        reviews: 22317,

        price: 124999,

        originalPrice: 134999,

        score: {
            performance: 97,
            camera: 92,
            battery: 95,
            display: 98,
            value: 96,
            overall: 96,
        },

        pros: [
            "Outstanding display",
            "Excellent battery",
            "Powerful Snapdragon Elite",
            "Great AI features",
            "Excellent value",
        ],

        cons: [
            "Heavy phone",
            "Large form factor",
            "Premium pricing",
        ],

        stores: [
            {
                store: "Amazon",
                logo: "/assets/stores/amazon/logo.png",
                price: 124999,
                delivery: "Tomorrow",
                availability: "In Stock",
            },
            {
                store: "Flipkart",
                logo: "/assets/stores/flipkart/logo.png",
                price: 123999,
                delivery: "Tomorrow",
                availability: "In Stock",
            },
            {
                store: "Croma",
                logo: "/assets/stores/croma/logo.png",
                price: 125499,
                delivery: "2 Days",
                availability: "In Stock",
            },
            {
                store: "Reliance Digital",
                logo: "/assets/stores/reliance-digital/logo.png",
                price: 124499,
                delivery: "Tomorrow",
                availability: "Limited",
            },
        ],

        specifications: [
            {
                label: "Display",
                left: "6.3-inch OLED",
                right: "6.9-inch AMOLED",
                winner: "right",
            },
            {
                label: "Resolution",
                left: "2622 × 1206",
                right: "3120 × 1440",
                winner: "right",
            },
            {
                label: "Refresh Rate",
                left: "120 Hz",
                right: "120 Hz",
                winner: "draw",
            },
            {
                label: "Processor",
                left: "Apple A18 Pro",
                right: "Snapdragon 8 Elite",
                winner: "right",
            },
            {
                label: "RAM",
                left: "8 GB",
                right: "12 GB",
                winner: "right",
            },
            {
                label: "Storage",
                left: "256 GB",
                right: "256 GB",
                winner: "draw",
            },
            {
                label: "Battery",
                left: "3582 mAh",
                right: "5000 mAh",
                winner: "right",
            },
            {
                label: "Charging",
                left: "27W",
                right: "45W",
                winner: "right",
            },
            {
                label: "Wireless Charging",
                left: "MagSafe",
                right: "Qi2",
                winner: "draw",
            },
            {
                label: "Rear Camera",
                left: "48+48+12 MP",
                right: "200+50+50+10 MP",
                winner: "right",
            },
            {
                label: "Front Camera",
                left: "12 MP",
                right: "12 MP",
                winner: "draw",
            },
            {
                label: "Weight",
                left: "199 g",
                right: "218 g",
                winner: "left",
            },
            {
                label: "Water Resistance",
                left: "IP68",
                right: "IP68",
                winner: "draw",
            },
            {
                label: "Fingerprint",
                left: "Face ID",
                right: "Ultrasonic",
                winner: "draw",
            },
            {
                label: "Operating System",
                left: "iOS 26",
                right: "One UI 8",
                winner: "draw",
            },
        ],
    },
};
