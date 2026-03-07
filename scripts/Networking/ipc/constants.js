// actual max is 2048, but we need to allow one character for the ipc type flag
/**
 * Max serialized message length.
 */
export const MAX_MESSAGE_LENGTH = 2047;
/**
 * Max router UID length.
 * @see {@link Router.uid}
 */
export const MAX_ROUTER_UID_LENGTH = 48;
/**
 * @internal
 */
export const STREAM_MESSAGE_PADDING = MAX_ROUTER_UID_LENGTH + 15; // {MAX_ROUTER_UID_LENGTH}XXXXXXXXXXXX {t|f} {msg}