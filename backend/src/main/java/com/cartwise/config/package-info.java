/**
 * Spring configuration — beans and settings that wire the application together.
 *
 * <p>Nothing here implements a feature. Collecting {@code @Configuration} classes in one package
 * keeps infrastructure decisions (CORS today; datasource and security filter chain later)
 * findable in one place rather than scattered as annotations across the classes they affect.
 */
package com.cartwise.config;
