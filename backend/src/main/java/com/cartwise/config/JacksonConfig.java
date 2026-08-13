package com.cartwise.config;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.cfg.CoercionAction;
import tools.jackson.databind.cfg.CoercionInputShape;
import tools.jackson.databind.type.LogicalType;

/**
 * JSON deserialisation rules for incoming request bodies.
 *
 * <p>Exists because of one observed behaviour, not on principle. Jackson's default is to coerce a
 * JSON number into a string when a string is expected, so {@code {"productSlug": 12345}} arrived at
 * the controller as the string {@code "12345"} — a well-formed request for a product that happens
 * not to exist. The API answered 404, which is a true statement about the wrong question: the
 * client sent the wrong type, and telling it "no such product" sends it looking for a catalogue
 * problem instead of a bug in its own payload.
 *
 * <p>Failing the coercion instead makes Jackson raise the same error it raises for any unreadable
 * body, which {@link com.cartwise.common.exception.GlobalExceptionHandler} already reports as 400.
 *
 * <p>Scoped to textual targets only. Numbers, booleans and dates keep Jackson's defaults, because
 * nothing has been observed to go wrong with them and a global strictness switch would be a change
 * whose consequences arrive later, in some other endpoint, as a surprise.
 *
 * <p>Note the packages: Spring Boot 4 ships <strong>Jackson 3</strong>, whose classes live under
 * {@code tools.jackson}, and its builder customiser is {@code JsonMapperBuilderCustomizer} in
 * {@code spring-boot-jackson}. The Jackson 2 spelling of all of this
 * ({@code com.fasterxml.jackson.databind}, {@code Jackson2ObjectMapperBuilderCustomizer}) is what
 * every existing tutorial shows and does not compile here.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public JsonMapperBuilderCustomizer strictStringCoercion() {
        return builder -> builder.withCoercionConfig(LogicalType.Textual, config -> config
                .setCoercion(CoercionInputShape.Integer, CoercionAction.Fail)
                .setCoercion(CoercionInputShape.Float, CoercionAction.Fail)
                .setCoercion(CoercionInputShape.Boolean, CoercionAction.Fail));
    }
}
