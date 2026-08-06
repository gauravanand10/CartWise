import StickyCompareBar from "./components/StickyCompareBar";

import ComparisonOverview from "./components/ComparisonOverview";

import StoreComparison from "./components/StoreComparison";

import WinnerCard from "./components/WinnerCard";

import ComparisonScore from "./components/ComparisonScore";

import ComparisonTable from "./components/ComparisonTable";

import AISummary from "./components/AISummary";

import ComparisonCharts from "./components/ComparisonCharts";

import BenchmarkComparison from "./components/BenchmarkComparison";

import CameraComparison from "./components/CameraComparison";

import BatteryComparison from "./components/BatteryComparison";

import DisplayComparison from "./components/DisplayComparison";

import SoftwareComparison from "./components/SoftwareComparison";

import ReviewComparison from "./components/ReviewComparison";

import FinalVerdict from "./components/FinalVerdict";

import RelatedComparisons from "./components/RelatedComparisons";

export default function ComparePage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-50">

            {/* Background Decorations */}

            <div className="absolute left-0 top-0 h-[700px] w-[700px] rounded-full bg-fuchsia-300/20 blur-[180px]" />

            <div className="absolute right-0 top-[500px] h-[700px] w-[700px] rounded-full bg-violet-300/20 blur-[180px]" />

            <div className="absolute bottom-0 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-300/20 blur-[180px]" />

            <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-24 px-6 py-10 lg:px-10">

                {/* Sticky Header */}

                <StickyCompareBar />

                {/* Hero */}

                <ComparisonOverview />

                {/* Price Comparison */}

                <StoreComparison />

                {/* AI Winner */}

                <WinnerCard />

                {/* Score Comparison */}

                <ComparisonScore />

                {/* Specifications */}

                <ComparisonTable />

                {/* AI Summary */}

                <AISummary />

                {/* Charts */}

                <ComparisonCharts />

                {/* Benchmarks */}

                <BenchmarkComparison />

                {/* Camera */}

                <CameraComparison />

                {/* Battery */}

                <BatteryComparison />

                {/* Display */}

                <DisplayComparison />

                {/* Software */}

                <SoftwareComparison />

                {/* Reviews */}

                <ReviewComparison />

                {/* Final Verdict */}

                <FinalVerdict />

                {/* Related Products */}

                <RelatedComparisons />

            </div>

        </main>
    );
}
