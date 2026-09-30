package com.cartiva.backend.util;

import java.security.SecureRandom;
import java.util.function.Predicate;

/**
 * Generates random (not sequential) order/ticket reference numbers.
 *
 * Sequential numbers based on the local auto-increment id break the moment
 * the local database is reset (fresh scratch/dev environment, volume wipe,
 * etc.): the next ticket reuses a number like "TCK-10001" that may already
 * exist as a real, unrelated Case in Salesforce from a previous run, and the
 * unique-field constraint on Case.External_Ticket_Id__c rejects the insert.
 * A random number in a large enough space makes that collision practically
 * impossible regardless of how many times the local store gets wiped.
 */
public final class ReferenceNumberGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MIN = 100_000;
    private static final int BOUND = 900_000; // yields a 6-digit number: 100000–999999

    private ReferenceNumberGenerator() {
    }

    public static String generate(String prefix, Predicate<String> alreadyExists) {
        String candidate;
        do {
            candidate = prefix + (MIN + RANDOM.nextInt(BOUND));
        } while (alreadyExists.test(candidate));
        return candidate;
    }
}
