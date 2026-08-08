import type { LucideIcon, } from "lucide-react";
import type { ReactNode } from "react";

interface ProductSectionProps {
    id: string;
    title: string;
    /** Optional line under the title explaining what the section is for. */
    description?: string;
    icon?: LucideIcon;
    /** Rendered on the right of the header, e.g. a count or a link. */
    action?: ReactNode;
    children: ReactNode;
    /** Drops the white card shell for sections that manage their own surface. */
    bare?: boolean;
}

/**
 * The shared shell every Product Details section sits in.
 *
 * Section heading treatment, radius, border and padding live here once so the
 * eight sections on this page cannot drift apart — the same reason the homepage
 * keeps its card recipe in `styles.ts`.
 */
export default function ProductSection({
    id,
    title,
    description,
    icon: Icon,
    action,
    children,
    bare = false,
}: ProductSectionProps) {
    const shell = bare
        ? ""
        : "rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-[24px] sm:p-6 lg:p-8";

    return (
        <section id={id} aria-labelledby={`${id}-heading`} className={shell}>

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2
                        id={`${id}-heading`}
                        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
                    >
                        {Icon && (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Icon size={16} aria-hidden="true" />
                            </span>
                        )}
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
                            {description}
                        </p>
                    )}
                </div>

                {action && <div className="shrink-0">{action}</div>}
            </div>

            <div className="mt-5 sm:mt-6">{children}</div>

        </section>
    );
}
