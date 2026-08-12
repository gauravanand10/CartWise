/**
 * JPA entities — the schema, expressed as Java.
 *
 * <p>These four classes are the whole database as of Chapter 16. There is no XML mapping and no
 * hand-written DDL: Hibernate generates the schema from the annotations here, so the entity is the
 * single source of truth for what a table looks like.
 *
 * <p>Present: {@link com.cartwise.entity.Product} (the catalogue),
 * {@link com.cartwise.entity.Wishlist} and {@link com.cartwise.entity.Comparison} (the two saved
 * selections the frontend already has, currently living in browser localStorage), and
 * {@link com.cartwise.entity.User} as a deliberate stub that exists only to be pointed at.
 *
 * <p>Deliberately absent: reviews, ratings histograms, specification groups, store offers, AI
 * verdicts, carts, orders and payments. Every one of those is real frontend data today, and each
 * gets modelled when the chapter that uses it arrives — modelling them now would mean inventing a
 * schema with no reader and no way to tell whether it was right.
 */
package com.cartwise.entity;
