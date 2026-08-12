/**
 * Data access — the boundary behind which persistence is hidden.
 *
 * <p>Chapter 15 created this package empty to fix the layering decision before the storage
 * decision. Chapter 16 fills it in: three Spring Data JPA interfaces over a real PostgreSQL
 * datasource, one per persisted entity.
 *
 * <p>They are interfaces with no implementations by design — Spring Data derives the SQL from each
 * method name and supplies the proxy at startup. That also means a method naming a property that
 * does not exist fails the application context, not a request in production.
 *
 * <p>Only the queries the application actually performs are declared. No pagination, no
 * specifications, no {@code @Query} strings: those arrive with the endpoints that need them in
 * Chapter 17, where there is something real to measure them against.
 */
package com.cartwise.repository;
