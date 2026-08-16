export { default as AuthProvider } from "./context/AuthProvider";
export { default as ProtectedRoute } from "./components/ProtectedRoute";

export { default as LoginPage } from "./LoginPage";
export { default as SignupPage } from "./SignupPage";

export { useAuth } from "./hooks/useAuth";

export type { AuthStatus, AuthUser } from "./context/authContext";
