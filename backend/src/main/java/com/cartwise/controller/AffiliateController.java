package com.cartwise.controller;

import com.cartwise.common.dto.AffiliateClickRequest;
import com.cartwise.common.dto.AffiliateClickResponse;
import com.cartwise.common.dto.AffiliateRetailerDto;
import com.cartwise.security.AuthenticatedUser;
import com.cartwise.service.AffiliateLinkService;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The outbound path: where a "Visit store" button actually goes. Chapter 26.
 *
 * <p>Public — every route here is {@code permitAll} in {@code SecurityConfig}. That is not an
 * oversight to be tightened later; a comparison site whose outbound links required an account would
 * have no outbound traffic. A signed-in caller is recognised when the request happens to carry a
 * token, and an anonymous one is served identically.
 *
 * <h2>Two routes for one click, and why that is not duplication</h2>
 *
 * <p>{@link #redirect} is the canonical one: a {@code GET} that records the click and answers 302 to
 * the retailer. It is what an {@code <a href>} points at, so the feature works with JavaScript
 * disabled, survives a middle-click into a new tab, and can be verified with curl.
 *
 * <p>{@link #recordClick} exists because of a browser fact that the redirect alone cannot work
 * around: <strong>a top-level navigation carries no {@code Authorization} header.</strong> CartWise's
 * token lives in {@code localStorage} and is attached by {@code fetch}, so a signed-in user who
 * simply followed the link would be recorded as anonymous — the attribution Part B of this chapter
 * asks for would be permanently unavailable from the actual UI. The frontend therefore asks for the
 * URL over {@code fetch} (header attached, user attributed) and navigates itself, keeping the
 * {@code href} as the no-JS fallback.
 *
 * <p>Reading the 302's {@code Location} from {@code fetch} is not an alternative worth trying:
 * {@code redirect: "manual"} yields an opaque response with no readable header, and the default
 * follows the redirect into a cross-origin request the browser then refuses. Hence a route that
 * returns the URL in a body.
 *
 * <p>Both call the same service method, so the two cannot record different things, and a click is
 * recorded exactly once either way — {@code onClick} fires only for the primary button, and a
 * middle-click follows the {@code href} instead.
 */
@RestController
@RequestMapping("/api/affiliate")
public class AffiliateController {

    private final AffiliateLinkService affiliateLinkService;

    public AffiliateController(AffiliateLinkService affiliateLinkService) {
        this.affiliateLinkService = affiliateLinkService;
    }

    /**
     * {@code GET /api/affiliate/retailers} — who CartWise links to, and which links are paid.
     *
     * <p>Public, and carries no credential: each entry says <em>whether</em> a retailer's links are
     * affiliate-tagged, never what the tag is. The disclosure page reads this rather than hardcoding
     * a list, so the page cannot claim a commercial relationship this deployment does not have — the
     * exact failure mode a legally-required disclosure must not have.
     */
    @GetMapping("/retailers")
    public ResponseEntity<List<AffiliateRetailerDto>> retailers() {
        return ResponseEntity.ok(affiliateLinkService.retailers());
    }

    /**
     * {@code GET /api/affiliate/click/{retailer}/{slug}} — record the click, then send the browser on.
     *
     * <p>302 with a {@code Location} of the constructed retailer URL. 302 rather than 301: a
     * permanent redirect is cacheable by the browser forever, which would mean the second click on
     * the same product never reaches this endpoint at all and is never counted. A tracking redirect
     * that can be cached is a tracking redirect that stops tracking.
     *
     * <p>{@code Cache-Control: no-store} for the same reason, stated to the intermediaries a status
     * code alone does not bind.
     *
     * <p>404 for an unknown retailer id or an unknown product slug, via
     * {@code GlobalExceptionHandler}. Deliberately not a redirect to somewhere plausible: sending a
     * shopper to a retailer's homepage because the product could not be resolved is a worse answer
     * than telling them the link was broken.
     *
     * <p>Rate limited per client IP — see {@code RateLimitInterceptor}. This is the endpoint whose
     * abuse case is obvious: click counts are the number a commercial arrangement is judged on, and
     * anyone can reach this without an account.
     */
    @GetMapping("/click/{retailer}/{slug}")
    public ResponseEntity<Void> redirect(
            @PathVariable String retailer,
            @PathVariable String slug,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        AffiliateClickResponse click = affiliateLinkService.click(
                retailer, slug, principal == null ? null : principal.id());

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(click.url()))
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .build();
    }

    /**
     * {@code POST /api/affiliate/clicks} — record the click and hand back the URL.
     *
     * <p>200 with an {@link AffiliateClickResponse}. Same recording, same URL, same 404s as
     * {@link #redirect}; the only difference is that the caller navigates rather than the server.
     *
     * <p>{@code POST} rather than {@code GET}, even though it returns data, because it is not safe:
     * it writes a row, and a {@code GET} that writes is one a browser or a proxy may repeat at will.
     * The redirect above is the exception that proves it — it is a {@code GET} that writes because a
     * link has to be, which is precisely why it carries {@code no-store}.
     *
     * <p>400 for a body missing either field. Checked here rather than with Bean Validation to match
     * {@code AdminController.changeRole}, which does the same for the same reason: one null check is
     * less machinery than a validation dependency for a two-field body.
     */
    @PostMapping("/clicks")
    public ResponseEntity<AffiliateClickResponse> recordClick(
            @RequestBody AffiliateClickRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        if (request.retailer() == null || request.retailer().isBlank()) {
            throw new IllegalArgumentException("retailer is required");
        }
        if (request.productSlug() == null || request.productSlug().isBlank()) {
            throw new IllegalArgumentException("productSlug is required");
        }

        return ResponseEntity.ok(affiliateLinkService.click(
                request.retailer(),
                request.productSlug(),
                principal == null ? null : principal.id()));
    }
}
