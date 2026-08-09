import AppRoutes from "./routes/AppRoutes";
import { CompareProvider } from "./features/compare";

function App() {
  // Comparison selection wraps the router, not a single route: the navbar badge
  // and the compare buttons on product cards live outside the Compare page but
  // read and write the same selection.
  return (
    <CompareProvider>
      <AppRoutes />
    </CompareProvider>
  );
}

export default App;
