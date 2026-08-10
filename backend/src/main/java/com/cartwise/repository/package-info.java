/**
 * Data access — the boundary behind which persistence is hidden.
 *
 * <p>Intentionally empty in Chapter 15. The package exists because the layering decision is made
 * here even though the storage decision is not: services will depend on interfaces declared in
 * this package, so swapping the implementation never reaches upward.
 *
 * <p>Spring Data JPA repositories and the PostgreSQL datasource arrive in Chapter 16. Creating
 * them now would mean wiring a database connection that no code in this chapter reads from.
 */
package com.cartwise.repository;
