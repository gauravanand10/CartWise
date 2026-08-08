import { useState } from "react";
import { ListTree } from "lucide-react";

import ProductSection from "./ProductSection";
import SpecGroupPanel from "./SpecGroupPanel";
import type { SpecGroup } from "../types/product";

interface ProductSpecsProps {
    groups: SpecGroup[];
}

/**
 * The full specification table, grouped and collapsible.
 *
 * Only the first group is open by default — a 40-row wall of specifications
 * pushes the reviews and related products a screen and a half further down, and
 * most visitors want one or two numbers rather than all of them. The expand-all
 * control is there for the ones who want everything.
 */
export default function ProductSpecs({ groups }: ProductSpecsProps) {
    // Remounting the panels via `key` is what makes expand/collapse-all work
    // without lifting every panel's open state into this component.
    const [generation, setGeneration] = useState(0);
    const [allOpen, setAllOpen] = useState(false);

    const toggleAll = () => {
        setAllOpen((value) => !value);
        setGeneration((value) => value + 1);
    };

    const total = groups.reduce((sum, group) => sum + group.items.length, 0);

    return (
        <ProductSection
            id="specifications"
            title="Specifications"
            icon={ListTree}
            description={`${total} specifications across ${groups.length} groups.`}
            action={
                <button
                    type="button"
                    onClick={toggleAll}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    {allOpen ? "Collapse all" : "Expand all"}
                </button>
            }
        >
            <div className="space-y-2.5">
                {groups.map((group, index) => (
                    <SpecGroupPanel
                        key={`${group.id}-${generation}`}
                        group={group}
                        defaultOpen={allOpen || index === 0}
                    />
                ))}
            </div>
        </ProductSection>
    );
}
