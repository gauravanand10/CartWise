import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AffiliateClicks from "./AffiliateClicks";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockApi } from "../../test/mockApi";
import { TEST_USER_ID } from "../../test/fakeBackend";

/**
 * The admin click report. Chapter 26.
 *
 * The test that matters most is the 403 one. This route sits behind
 * `ProtectedRoute`, which only knows whether *somebody* is signed in — the
 * frontend never learns a role — so the thing actually keeping non-admins out is
 * the server's `hasRole("ADMIN")` on `/api/admin/**`. This asserts the page
 * behaves correctly when that refusal arrives, which is the behaviour a
 * signed-in ordinary user will really see.
 */

const STATS = "/admin/affiliate/clicks";

const report = {
    totalClicks: 5,
    attributedClicks: 2,
    anonymousClicks: 3,
    byProduct: [{ slug: "iphone-16-pro", name: "iPhone 16 Pro", clicks: 3 }],
    byRetailer: [{ retailer: "amazon", clicks: 4 }],
    byDay: [{ day: "2026-08-17", clicks: 5 }],
};

describe("the click report", () => {
    it("shows the aggregates when the server allows the request", async () => {
        mockApi({ [STATS]: { json: report } });

        renderWithProviders(<AffiliateClicks />, { signedInAs: TEST_USER_ID });

        expect(await screen.findByText("iPhone 16 Pro")).toBeInTheDocument();
        expect(screen.getByText("amazon")).toBeInTheDocument();
        expect(screen.getByText("2026-08-17")).toBeInTheDocument();
        expect(screen.getByText("Total clicks")).toBeInTheDocument();
    });

    /**
     * 403 is a distinct outcome from a generic failure, and the difference is
     * visible to the user: a refusal that offers a "try again" button invites a
     * retry that can only fail identically.
     */
    it("reports an administrator-only refusal without offering a retry", async () => {
        mockApi({ [STATS]: { status: 403, body: { code: "FORBIDDEN" } } });

        renderWithProviders(<AffiliateClicks />, { signedInAs: TEST_USER_ID });

        expect(
            await screen.findByRole("heading", { name: /administrator access required/i }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
        expect(screen.queryByText("Total clicks")).toBeNull();
    });

    it("offers a retry for a genuine failure", async () => {
        mockApi({ [STATS]: { status: 500, body: { code: "INTERNAL_ERROR" } } });

        renderWithProviders(<AffiliateClicks />, { signedInAs: TEST_USER_ID });

        expect(
            await screen.findByRole("button", { name: /try again/i }),
        ).toBeInTheDocument();
    });

    it("says so plainly when nothing has been clicked yet", async () => {
        mockApi({
            [STATS]: {
                json: {
                    totalClicks: 0,
                    attributedClicks: 0,
                    anonymousClicks: 0,
                    byProduct: [],
                    byRetailer: [],
                    byDay: [],
                },
            },
        });

        renderWithProviders(<AffiliateClicks />, { signedInAs: TEST_USER_ID });

        expect(await screen.findByText(/no clicks recorded yet/i)).toBeInTheDocument();
    });
});
