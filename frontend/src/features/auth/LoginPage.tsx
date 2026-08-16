import AuthForm from "./components/AuthForm";

/**
 * Sign-in route.
 *
 * MainLayout owns the `<main>` landmark and the width container, so this page
 * only adds its own vertical rhythm — the same contract Search, Compare and
 * Product Details follow.
 */
export default function LoginPage() {
    return (
        <div className="py-10 sm:py-16">
            <AuthForm mode="login" />
        </div>
    );
}
