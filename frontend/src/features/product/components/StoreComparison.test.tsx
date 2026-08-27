import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StoreComparison from "./StoreComparison";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { mockApi } from "../../../test/mockApi";
import type { StoreOffer } from "../types/product";

/**
 * The outbound path, from the user's side. Chapter 26.
 *
 * Three of these tests are about things that would not look broken if they were
 * wrong, which is why they are asserted at all:
 *
 * - A link pointing straight at amazon.in still takes the shopper to Amazon. It
 *   simply earns nothing and counts nothing, forever, silently.
 * - An affiliate tag rendered into the markup is a published credential, and
 *   nothing about the page would look different.
 * - A missing disclosure is a legal problem that no amount of manual clicking
 *   would surface, because the page works perfectly without it.
 */

function offer(overrides: Partial<StoreOffer> = {}): StoreOffer {
    return {
        id: "amazon",
        name: "Amazon",
        logo: "/assets/stores/amazon.svg",
        monogram: "AZ",
        gradient: "from-amber-500 to-orange-600",
        price: 129900,
        // `delivery: "Tomorrow"` was here until Chapter 26.5 removed the field,
        // and `storeRating: 4.5` until Chapter 28 removed that one. Neither was
        // ever asserted by a test in this file — the factory carried them only
        // because `StoreOffer` required them.
        inStock: true,
        ...overrides,
    };
}

const TRACKED_URL = "https://www.amazon.in/s?k=iPhone+16+Pro&tag=cartwise-test-00";

function renderComparison(stores: StoreOffer[]) {
    return renderWithProviders(
        <StoreComparison
            stores={stores}
            productName="iPhone 16 Pro"
            productSlug="iphone-16-pro"
        />,
    );
}

describe("the affiliate disclosure", () => {
    /**
     * The FTC standard is that a disclosure is met *before or at the same time
     * as* the link, so its position in the DOM is the assertion, not merely its
     * presence. `compareDocumentPosition` is the only way to state that.
     */
    it("appears above the first outbound link, not after it", () => {
        renderComparison([offer()]);

        const notice = screen.getByText(/may earn a commission/i);
        const link = screen.getByRole("link", { name: /visit amazon/i });

        expect(notice).toBeInTheDocument();
        expect(
            notice.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("says plainly that the links are affiliate links", () => {
        renderComparison([offer()]);

        // The heading of the notice is its own element; the sentence that
        // follows is a text node inside the surrounding <p>, so it is matched
        // with a text-content assertion rather than a second getByText that
        // would also match the parent.
        const notice = screen.getByText("Affiliate links.");
        expect(notice).toBeInTheDocument();

        expect(notice.parentElement).toHaveTextContent(
            /may earn a commission from that retailer/i,
        );
        expect(notice.parentElement).toHaveTextContent(
            /costs you nothing extra/i,
        );
    });

    it("links to the full disclosure page in addition to stating the disclosure inline", () => {
        renderComparison([offer()]);

        expect(
            screen.getByRole("link", { name: /full affiliate disclosure/i }),
        ).toHaveAttribute("href", "/affiliate-disclosure");
    });

    /** Per-link, because the banner alone stops being "near the link" on a long page. */
    it("labels each in-stock offer as an affiliate link", () => {
        renderComparison([offer(), offer({ id: "croma", name: "Croma", price: 131000 })]);

        expect(screen.getAllByText("Affiliate link")).toHaveLength(2);
    });
});

describe("the Visit store link", () => {
    it("points at CartWise's tracking redirect, never at the retailer directly", () => {
        renderComparison([offer()]);

        const link = screen.getByRole("link", { name: /visit amazon/i });
        const href = link.getAttribute("href") ?? "";

        expect(href).toContain("/affiliate/click/amazon/iphone-16-pro");
        expect(href).not.toContain("amazon.in");
    });

    /**
     * The credential must not be in the bundle. Asserted against the whole
     * rendered markup rather than one attribute, so it fails wherever someone
     * puts it.
     */
    it("embeds no affiliate tag anywhere in the rendered markup", () => {
        const { container } = renderComparison([offer()]);

        expect(container.innerHTML).not.toContain("cartwise-test-00");
        expect(container.innerHTML).not.toContain("tag=");
    });

    it("marks the link as sponsored and nofollow", () => {
        renderComparison([offer()]);

        const rel = screen.getByRole("link", { name: /visit amazon/i })
            .getAttribute("rel") ?? "";

        expect(rel).toContain("sponsored");
        expect(rel).toContain("nofollow");
    });

    /**
     * An out-of-stock offer has nothing to link to. A disabled anchor is not a
     * thing HTML has — assistive technology would still announce it as a link
     * and offer to follow it — so it must be a real disabled button.
     */
    it("renders a disabled button rather than a link when the offer is out of stock", () => {
        renderComparison([offer({ inStock: false })]);

        expect(screen.queryByRole("link", { name: /visit amazon/i })).toBeNull();
        expect(screen.getByRole("button", { name: /does not have/i })).toBeDisabled();
        // No disclosure label on a link that does not exist.
        expect(screen.queryByText("Affiliate link")).toBeNull();
    });
});

describe("clicking through", () => {
    let assign: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        assign = vi.fn();
        // jsdom refuses a real navigation, so the destination is captured
        // instead. Stubbed through `vi.stubGlobal` so `setup.ts` restores it.
        vi.stubGlobal("location", { ...window.location, assign });
    });

    it("records the click through the API and then navigates to the URL it returns", async () => {
        const api = mockApi({
            "/affiliate/clicks": {
                json: { url: TRACKED_URL, retailer: "amazon", affiliateTagged: true },
            },
        });

        renderComparison([offer()]);

        await userEvent.click(screen.getByRole("link", { name: /visit amazon/i }));

        await waitFor(() => expect(assign).toHaveBeenCalledWith(TRACKED_URL));

        // The POST is what carries the Authorization header, and therefore what
        // makes a signed-in user's click attributable at all — a plain
        // navigation could not.
        expect(api.calls.some((url) => url.endsWith("/affiliate/clicks"))).toBe(true);
    });

    /**
     * A rate limit or a dropped connection must not strand the shopper on a link
     * that works. The redirect endpoint still records the click; only the user
     * attribution is lost.
     */
    it("falls back to the tracking redirect when recording fails", async () => {
        mockApi({
            "/affiliate/clicks": { status: 429, body: { code: "RATE_LIMIT_EXCEEDED" } },
        });

        renderComparison([offer()]);

        await userEvent.click(screen.getByRole("link", { name: /visit amazon/i }));

        await waitFor(() => expect(assign).toHaveBeenCalled());
        expect(String(assign.mock.calls[0][0]))
            .toContain("/affiliate/click/amazon/iphone-16-pro");
    });
});
