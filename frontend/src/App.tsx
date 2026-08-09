import AppRoutes from "./routes/AppRoutes";
import { CompareProvider } from "./features/compare";
import { WishlistProvider } from "./features/wishlist";

function App() {
  // Both selections wrap the router, not a single route: the navbar badges and
  // the heart/scales buttons on product cards live outside their own pages but
  // read and write the same state.
  //
  // Deliberately two independent providers with two storage keys — wishlist and
  // comparison are separate concerns, and removing a product from one must
  // never disturb the other.
  return (
    <WishlistProvider>
      <CompareProvider>
        <AppRoutes />
      </CompareProvider>
    </WishlistProvider>
  );
}

export default App;
