import AuthForm from "./components/AuthForm";

/** Registration route. Same layout contract as {@link LoginPage}. */
export default function SignupPage() {
    return (
        <div className="py-10 sm:py-16">
            <AuthForm mode="signup" />
        </div>
    );
}
