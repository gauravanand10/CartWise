import Hero from "../../components/home/Hero";
import Categories from "../../components/home/Categories";
import FeaturedProducts from "../../components/home/FeaturedProducts";
import Stats from "../../components/home/Stats";
import WhyCartWise from "../../components/home/WhyCartWise";

export default function Home() {
    return (
        <>
            <Hero />

            <Categories />

            <FeaturedProducts />

            <Stats />

            <WhyCartWise />
        </>
    );
}
