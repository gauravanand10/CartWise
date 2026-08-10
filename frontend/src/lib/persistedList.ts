/**
 * A de-duplicated list of strings, persisted to localStorage.
 *
 * Wishlist and Compare had grown their own byte-for-byte copies of the same
 * guarded read/write pair, and Search's recent-searches list a third; the next
 * feature that needs to remember a list of identifiers would have made four.
 * This owns the *mechanics* only — guarded access, parsing, validation,
 * de-duplication, schema versioning and cross-tab notification.
 *
 * It deliberately knows nothing about the features that use it. Wishlist's
 * prepend-for-recency ordering and Compare's four-item cap stay in their own
 * providers, because those are the rules of those features, not of storage.
 */

/**
 * Stored shape version.
 *
 * Introduced now rather than later on purpose. A version marker only helps if
 * it is already in storage *before* the shape changes — adding `v` at the same
 * time as the change would still leave the old value unlabelled, so the reader
 * would have to sniff structurally anyway. Writing it today is what buys a
 * clean migration tomorrow.
 */
const SCHEMA_VERSION = 1;

interface Envelope {
    v: number;
    items: string[];
}

function isEnvelope(value: unknown): value is Envelope {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof (value as Envelope).v === "number" &&
        Array.isArray((value as Envelope).items)
    );
}

/** Keeps only strings, and only the first occurrence of each. */
function normalise(values: unknown[]): string[] {
    return [
        ...new Set(values.filter((value): value is string => typeof value === "string")),
    ];
}

/** Same members in the same order — used to skip no-op state updates. */
export function isSameList(a: readonly string[], b: readonly string[]): boolean {
    return a.length === b.length && a.every((item, index) => item === b[index]);
}

export interface PersistedList {
    /** Current value, or `[]` if absent, unreadable or malformed. */
    read: () => string[];
    write: (items: string[]) => void;
    /**
     * Calls back with the new value whenever *another tab* changes this key.
     * Returns the unsubscribe function.
     */
    subscribe: (onExternalChange: (items: string[]) => void) => () => void;
}

export function createPersistedList(key: string): PersistedList {
    /**
     * Every access is guarded: `localStorage` throws outright in private-mode
     * Safari and is absent during server rendering, and a list failing to load
     * must never take the page down with it.
     */
    function read(): string[] {
        try {
            const raw = window.localStorage.getItem(key);
            if (!raw) return [];

            const parsed: unknown = JSON.parse(raw);

            // Current shape.
            if (isEnvelope(parsed)) return normalise(parsed.items);

            // Legacy bare array written before versioning existed. Read and
            // migrated in memory rather than rewritten here, so that reading
            // stays a pure operation safe to call from a `useState`
            // initialiser; the next write persists the new shape.
            if (Array.isArray(parsed)) return normalise(parsed);

            return [];
        } catch {
            return [];
        }
    }

    function write(items: string[]): void {
        try {
            const envelope: Envelope = { v: SCHEMA_VERSION, items };
            window.localStorage.setItem(key, JSON.stringify(envelope));
        } catch {
            // Storage full or blocked. The list still works for this session;
            // it just will not survive a reload, which is not worth failing
            // the page over.
        }
    }

    function subscribe(onExternalChange: (items: string[]) => void): () => void {
        const handler = (event: StorageEvent) => {
            try {
                // `key === null` is `localStorage.clear()`, which reports no
                // individual key but may well have removed ours.
                if (event.key !== null && event.key !== key) return;

                // sessionStorage raises the same event type and could hold an
                // identically-named key.
                if (
                    event.storageArea &&
                    event.storageArea !== window.localStorage
                ) {
                    return;
                }

                onExternalChange(read());
            } catch {
                // A storage area that cannot be inspected simply means no
                // cross-tab sync — never a thrown error inside an event
                // handler.
            }
        };

        // Note there is no write in this path, which is what makes cross-tab
        // sync loop-free: the browser does not deliver `storage` to the tab
        // that wrote the change, so a tab that only ever *reads* in response
        // can never bounce the event back.
        window.addEventListener("storage", handler);

        return () => window.removeEventListener("storage", handler);
    }

    return { read, write, subscribe };
}
