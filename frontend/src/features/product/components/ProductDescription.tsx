import { Check, FileText, Info } from "lucide-react";

import ProductSection from "./ProductSection";

interface ProductDescriptionProps {
    overview: string;
    highlights: string[];
    /** CartWise's own note. Rendered attributed to CartWise, never to a person. */
    note: string;
}

/**
 * Overview, highlights, and CartWise's own note.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 26.5 — TWO BLOCKS OUT, ONE IN
 *
 * REMOVED: "Features" and "What's in the box".
 *
 * Both were generated from the product's slug by `data/editorial.ts`, and both
 * made specific claims about a physical object nobody had opened. "What's in
 * the box" is the clearest case in the whole chapter — a list of what a
 * manufacturer ships is a plain matter of fact, entirely checkable, and CartWise
 * had no source for it. Being wrong about it is not a style regression; it is
 * telling a shopper a charger is included when it may not be.
 *
 * The "Features" list was marketing prose in the same position: sentences about
 * what the product is good at, assembled from a template.
 *
 * ADDED: the CartWise note.
 *
 * This is what fills the space the fabricated customer reviews used to occupy
 * on this page. The distinction it has to carry is legal as much as editorial:
 * a site may state its own opinion, and may not manufacture other people's. So
 * the note is written in CartWise's voice, labelled "CartWise's note" in the
 * heading, marked with an information glyph rather than a quotation mark, and
 * carries no author, no avatar, no date and no star rating — none of the
 * furniture that would make it read as a testimonial.
 *
 * Its content is derived, not written: see `deriveNote` in productService.ts.
 * It restates the product's rating, discount and price, and says outright that
 * CartWise has not handled the product.
 *
 * KEPT: overview and highlights, but both are now derived from real fields
 * rather than authored. Every highlight restates something the reader can see
 * elsewhere on this page.
 * ---------------------------------------------------------------------------
 */
export default function ProductDescription({
    overview,
    highlights,
    note,
}: ProductDescriptionProps) {
    return (
        <ProductSection
            id="description"
            title="About this product"
            icon={FileText}
        >
            <div className="space-y-8">

                <p className="max-w-3xl text-[15px] leading-relaxed text-slate-600">
                    {overview}
                </p>

                <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                        Highlights
                    </h3>

                    <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                        {highlights.map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                            >
                                <Check
                                    size={15}
                                    className="mt-0.5 shrink-0 text-blue-600"
                                    aria-hidden="true"
                                />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/*
                    Attribution is the point of this block's markup.

                    The heading names CartWise as the author before the note is
                    read, and the glyph is `Info` rather than a quote mark. A
                    reader skimming cannot mistake this for something a customer
                    said, which is the only way this may occupy the space a
                    review section used to.
                */}
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Info size={15} className="text-slate-400" aria-hidden="true" />
                        CartWise's note
                    </h3>

                    <p className="mt-3 max-w-3xl border-l-2 border-slate-200 pl-4 text-sm leading-relaxed text-slate-600">
                        {note}
                    </p>
                </div>

            </div>
        </ProductSection>
    );
}
