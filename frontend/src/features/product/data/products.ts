import type { Product } from "../types/product";

export const products: Product[] = [

    {
        id: 1,

        name: "Apple iPhone 16 Pro",

        brand: "Apple",

        category: "Smartphones",

        price: 129900,

        originalPrice: 139900,

        rating: 4.9,

        reviewCount: 245,

        stock: 18,

        sku: "APL-IP16PRO-256",

        description:
            "The iPhone 16 Pro combines Apple's latest A18 Pro chip, titanium design, ProMotion display, and professional camera system to deliver flagship performance and exceptional battery life.",

        images: [
            "📱",
            "📱",
            "📱",
            "📱",
        ],

        specifications: [

            {
                title: "Display",
                value: "6.3-inch Super Retina XDR OLED",
            },

            {
                title: "Processor",
                value: "Apple A18 Pro",
            },

            {
                title: "RAM",
                value: "8 GB",
            },

            {
                title: "Storage",
                value: "256 GB",
            },

            {
                title: "Rear Camera",
                value: "48MP + 12MP + 12MP",
            },

            {
                title: "Front Camera",
                value: "12MP",
            },

            {
                title: "Battery",
                value: "3582 mAh",
            },

            {
                title: "Operating System",
                value: "iOS 26",
            },

        ],

        features: [

            "Titanium Design",

            "Face ID",

            "USB-C",

            "5G",

            "IP68 Water Resistant",

            "Wireless Charging",

            "Apple Intelligence",

        ],

        reviews: [

            {
                id: 1,
                user: "Rahul",
                rating: 5,
                comment:
                    "Amazing flagship phone with excellent camera quality.",
                date: "2026-08-01",
            },

            {
                id: 2,
                user: "Sneha",
                rating: 5,
                comment:
                    "Battery life and performance are outstanding.",
                date: "2026-08-03",
            },

        ],

        relatedProducts: [2, 3],

    },

    {
        id: 2,

        name: "Samsung Galaxy S25 Ultra",

        brand: "Samsung",

        category: "Smartphones",

        price: 124999,

        originalPrice: 134999,

        rating: 4.8,

        reviewCount: 198,

        stock: 12,

        sku: "SMS-S25ULTRA-512",

        description:
            "Samsung's premium flagship smartphone with Dynamic AMOLED display, Snapdragon processor, AI features and industry-leading camera system.",

        images: [
            "📱",
            "📱",
            "📱",
        ],

        specifications: [

            {
                title: "Display",
                value: "6.9-inch Dynamic AMOLED 2X",
            },

            {
                title: "Processor",
                value: "Snapdragon 8 Elite",
            },

            {
                title: "RAM",
                value: "12 GB",
            },

            {
                title: "Storage",
                value: "512 GB",
            },

            {
                title: "Rear Camera",
                value: "200 MP Quad Camera",
            },

            {
                title: "Battery",
                value: "5000 mAh",
            },

            {
                title: "Operating System",
                value: "Android 16",
            },

        ],

        features: [

            "120Hz AMOLED",

            "S-Pen",

            "IP68",

            "Wireless Charging",

            "AI Camera",

            "5G",

        ],

        reviews: [

            {
                id: 1,
                user: "Amit",
                rating: 5,
                comment:
                    "One of the best Android phones available.",
                date: "2026-07-28",
            },

        ],

        relatedProducts: [1, 3],

    },

    {
        id: 3,

        name: "MacBook Air M4",

        brand: "Apple",

        category: "Laptops",

        price: 109900,

        originalPrice: 119900,

        rating: 4.9,

        reviewCount: 162,

        stock: 8,

        sku: "APL-MBA-M4-512",

        description:
            "Ultra-thin laptop powered by Apple's M4 processor offering exceptional performance, silent operation and all-day battery life.",

        images: [
            "💻",
            "💻",
            "💻",
        ],

        specifications: [

            {
                title: "Display",
                value: "13.6-inch Liquid Retina",
            },

            {
                title: "Processor",
                value: "Apple M4",
            },

            {
                title: "RAM",
                value: "16 GB",
            },

            {
                title: "Storage",
                value: "512 GB SSD",
            },

            {
                title: "Battery",
                value: "18 Hours",
            },

            {
                title: "Operating System",
                value: "macOS",
            },

        ],

        features: [

            "Touch ID",

            "MagSafe",

            "Backlit Keyboard",

            "Fast Charging",

            "Wi-Fi 7",

        ],

        reviews: [

            {
                id: 1,
                user: "Karan",
                rating: 5,
                comment:
                    "Excellent laptop for software development.",
                date: "2026-07-18",
            },

        ],

        relatedProducts: [1],

    },

];
