import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./features/auth";
import { CompareProvider } from "./features/compare";
import { WishlistProvider } from "./features/wishlist";

function App() {
  // All three selections wrap the router, not a single route: the navbar badges
  // and the heart/scales buttons on product cards live outside their own pages
  // but read and write the same state.
  //
  // NESTING ORDER IS LOAD-BEARING, and only for the outermost one.
  //
  // AuthProvider must be outside the other two because both of them now read
  // `useAuth()` — as of Chapter 23.5 the wishlist and comparison are fetched
  // from user-scoped endpoints, so a provider that cannot see who is signed in
  // cannot fetch anything. Inverting this pair is not a subtle bug: the hook
  // throws, and the app fails to render at all.
  //
  // Wishlist and Compare, by contrast, remain deliberately independent and
  // could be swapped freely. They share no state and no table, and removing a
  // product from one must never disturb the other. They are nested only because
  // JSX has to nest something.
  return (
    <AuthProvider>
      <WishlistProvider>
        <CompareProvider>
          <AppRoutes />
        </CompareProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
