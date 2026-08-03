interface FeaturedProduct {
    id: number;
    name: string;
    category: string;
    price: string;
    rating: number;
    image: string;
}

const featuredProducts: FeaturedProduct[] = [
    {
        id: 1,
        name: "Apple iPhone 16 Pro",
        category: "Smartphone",
        price: "₹129,900",
        rating: 4.9,
        image: "📱",
    },
    {
        id: 2,
        name: "MacBook Air M4",
        category: "Laptop",
        price: "₹109,900",
        rating: 4.8,
        image: "💻",
    },
    {
        id: 3,
        name: "Sony WH-1000XM6",
        category: "Headphones",
        price: "₹34,990",
        rating: 4.8,
        image: "🎧",
    },
    {
        id: 4,
        name: "Samsung Neo QLED",
        category: "Television",
        price: "₹179,999",
        rating: 4.7,
        image: "📺",
    },
];

export default featuredProducts;
