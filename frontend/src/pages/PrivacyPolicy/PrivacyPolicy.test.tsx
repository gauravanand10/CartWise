import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPolicy from "./PrivacyPolicy";
import { renderWithProviders } from "../../test/renderWithProviders";

/**
 * The privacy policy page. Chapter 30.
 *
 * No API call backs this page — everything on it is static, checked against
 * the code once while writing it rather than read live. The test worth having
 * is therefore narrower than AffiliateDisclosure's: not "does this reflect a
 * live setting" but "does the page still say the specific true things it was
 * written to say", so a future edit that quietly waters one of them down is
 * caught rather than passing silently.
 */
describe("the privacy policy page", () => {
    it("renders without needing the network", () => {
        renderWithProviders(<PrivacyPolicy />);

        expect(
            screen.getByRole("heading", { name: /privacy policy/i }),
        ).toBeInTheDocument();
    });

    it("states the two collected fields and nothing invented beyond them", () => {
        renderWithProviders(<PrivacyPolicy />);

        expect(
            screen.getByText(/needs an email address and a password/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/nothing else is asked for, ever/i),
        ).toBeInTheDocument();
    });

    it("states the password is hashed, not stored", () => {
        renderWithProviders(<PrivacyPolicy />);

        expect(
            screen.getAllByText(/never stored — only a one-way hash/i).length,
        ).toBeGreaterThan(0);
    });

    /**
     * The claim most likely to go stale: if an analytics or ad SDK is ever
     * added to this app, this page becomes false the moment it ships unless
     * whoever adds it also finds and edits this sentence. The test cannot
     * prevent that, but it does mean the sentence itself is pinned rather than
     * quietly rewordable into something vaguer.
     */
    it("states plainly that no analytics or advertising SDK is present", () => {
        renderWithProviders(<PrivacyPolicy />);

        expect(
            screen.getByText(/no advertising or analytics sdk of any kind/i),
        ).toBeInTheDocument();
    });

    it("states that no cookies are set", () => {
        renderWithProviders(<PrivacyPolicy />);

        expect(screen.getByText(/cartwise sets no cookies/i)).toBeInTheDocument();
    });

    it("names the real, working point of contact rather than inventing one", () => {
        renderWithProviders(<PrivacyPolicy />);

        expect(
            screen.getByText(/is not a registered company/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/the project's own GitHub repository/i),
        ).toBeInTheDocument();
    });

    it("links to the affiliate disclosure rather than repeating it", () => {
        renderWithProviders(<PrivacyPolicy />);

        const link = screen.getByRole("link", {
            name: /the affiliate disclosure page/i,
        });
        expect(link).toHaveAttribute("href", "/affiliate-disclosure");
    });
});
