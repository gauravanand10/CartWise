import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AffiliateDisclosure from "./AffiliateDisclosure";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockApi } from "../../test/mockApi";

/**
 * The disclosure page. Chapter 26.
 *
 * The tests worth having here are about accuracy rather than layout. A
 * disclosure page that renders beautifully and states a commercial relationship
 * CartWise does not have is a worse outcome than no page: it is a false claim in
 * the one place the reader is entitled to a true one.
 */

const RETAILERS = "/affiliate/retailers";

describe("the disclosure page", () => {
    it("states the substance without waiting for the network", () => {
        mockApi({ [RETAILERS]: { json: [] } });

        renderWithProviders(<AffiliateDisclosure />);

        // The short version is static content, so a failed or slow request must
        // not leave the reader with a heading and nothing else.
        expect(
            screen.getByRole("heading", { name: /affiliate disclosure/i }),
        ).toBeInTheDocument();
        expect(screen.getByText(/you never pay more/i)).toBeInTheDocument();

        // Split across a <strong>, so matched on the containing list item's text
        // content rather than with getByText, which only sees a single element's
        // own text.
        expect(
            screen.getByRole("heading", { name: /the short version/i })
                .parentElement?.textContent,
        ).toMatch(/does not\s*affect which offers we show you/i);
    });

    it("lists which retailers are actually paid, from the API rather than a hardcoded list", async () => {
        mockApi({
            [RETAILERS]: {
                json: [
                    { id: "amazon", name: "Amazon", status: "PAID" },
                    { id: "croma", name: "Croma", status: "NONE" },
                ],
            },
        });

        renderWithProviders(<AffiliateDisclosure />);

        expect(await screen.findByText("Amazon")).toBeInTheDocument();
        expect(
            screen.getByText(/yes — this is a paid affiliate link/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/no — tracked, but not paid/i)).toBeInTheDocument();
    });

    /**
     * The state this project is actually in, and the one it must not misreport:
     * no approved affiliate account exists, so nothing is being earned. The page
     * says so, and stops saying so on its own the moment a real tag is
     * configured — because it reads the setting rather than a sentence.
     */
    it("says outright that nothing is earned when no retailer is tagged", async () => {
        mockApi({
            [RETAILERS]: {
                json: [{ id: "croma", name: "Croma", status: "NONE" }],
            },
        });

        renderWithProviders(<AffiliateDisclosure />);

        expect(
            await screen.findByText(/earns nothing from any\s+of these links/i),
        ).toBeInTheDocument();
    });

    /**
     * The configuration this project actually ships with, and the bug that made
     * the three-state status necessary.
     *
     * A PLACEHOLDER retailer has a real affiliate parameter on its links and
     * earns nothing, because the value identifies no approved account. When this
     * was a boolean the page rendered "Yes — this is a paid affiliate link" for
     * Amazon and suppressed the "we earn nothing" notice — a false statement
     * about a commercial relationship, on the page whose entire job is to be
     * true about one.
     */
    it("does not call a placeholder tag a paid link", async () => {
        mockApi({
            [RETAILERS]: {
                json: [
                    { id: "amazon", name: "Amazon", status: "PLACEHOLDER" },
                    { id: "croma", name: "Croma", status: "NONE" },
                ],
            },
        });

        renderWithProviders(<AffiliateDisclosure />);

        expect(await screen.findByText(/nothing is earned|not yet/i)).toBeInTheDocument();
        expect(screen.queryByText(/yes — this is a paid affiliate link/i)).toBeNull();

        // And the standing notice must still be shown: a placeholder is not a
        // paid relationship, so "we earn nothing from any of these" is true.
        expect(
            screen.getByText(/earns nothing from any\s+of these links/i),
        ).toBeInTheDocument();
    });

    it("does not claim nothing is earned once a retailer is tagged", async () => {
        mockApi({
            [RETAILERS]: {
                json: [{ id: "amazon", name: "Amazon", status: "PAID" }],
            },
        });

        renderWithProviders(<AffiliateDisclosure />);

        await screen.findByText("Amazon");
        expect(screen.queryByText(/earns nothing/i)).toBeNull();
    });

    /** A failed request must degrade to the conservative claim, not to silence. */
    it("still discloses when the retailer list cannot be loaded", async () => {
        mockApi({ [RETAILERS]: { status: 500, body: { code: "INTERNAL_ERROR" } } });

        renderWithProviders(<AffiliateDisclosure />);

        expect(
            await screen.findByText(/every “Visit store” link is a tracked referral link/i),
        ).toBeInTheDocument();
    });

    it("explains what is recorded on a click, and what is not", () => {
        mockApi({ [RETAILERS]: { json: [] } });

        renderWithProviders(<AffiliateDisclosure />);

        expect(screen.getByText(/which retailer it went to/i)).toBeInTheDocument();
        expect(
            screen.getByText(/we do not record your IP address/i),
        ).toBeInTheDocument();
    });
});
