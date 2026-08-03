import { useParams } from "react-router-dom";

function Product() {
    const { id } = useParams();

    return (
        <section>
            <h1 className="mb-4 text-4xl font-bold">
                Product Details
            </h1>

            <p className="text-lg text-gray-600">
                Product ID: {id}
            </p>
        </section>
    );
}

export default Product;
