import { AlertTriangle, RefreshCcw } from "lucide-react";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

interface CompareErrorProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
}

export default function CompareError({
    title = "Unable to Compare Products",
    description = "Something went wrong while loading the comparison. Please try again.",
    onRetry,
}: CompareErrorProps) {
    return (
        <section className="flex min-h-[500px] items-center justify-center">

            <Card className="w-full max-w-3xl rounded-[36px] p-12 text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">

                    <AlertTriangle
                        size={44}
                        className="text-red-600"
                    />

                </div>

                <h2 className="mt-8 text-4xl font-black text-slate-900">

                    {title}

                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">

                    {description}

                </p>

                <div className="mt-10 flex justify-center">

                    <Button
                        size="lg"
                        leftIcon={<RefreshCcw size={18} />}
                        onClick={onRetry}
                    >
                        Try Again
                    </Button>

                </div>

            </Card>

        </section>
    );
}
