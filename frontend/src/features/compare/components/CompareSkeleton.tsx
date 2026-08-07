import Card from "../../../components/ui/Card";

export default function CompareSkeleton() {
    return (
        <div className="space-y-12 animate-pulse">

            <Card className="rounded-[36px] p-5 sm:p-8 lg:p-10">

                <div className="grid gap-10 lg:grid-cols-2">

                    <div className="space-y-6">

                        <div className="h-10 w-72 rounded bg-slate-200" />

                        <div className="h-6 w-full rounded bg-slate-200" />

                        <div className="h-6 w-5/6 rounded bg-slate-200" />

                        <div className="mt-10 h-64 rounded-3xl bg-slate-200" />

                    </div>

                    <div className="rounded-3xl bg-slate-200" />

                </div>

            </Card>

            {[1, 2, 3].map((item) => (

                <Card
                    key={item}
                    className="rounded-[32px] p-8"
                >

                    <div className="space-y-5">

                        <div className="h-8 w-52 rounded bg-slate-200" />

                        <div className="h-5 rounded bg-slate-200" />

                        <div className="h-5 rounded bg-slate-200" />

                        <div className="h-5 w-3/4 rounded bg-slate-200" />

                    </div>

                </Card>

            ))}

        </div>
    );
}
