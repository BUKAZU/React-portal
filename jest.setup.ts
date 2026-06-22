// Polyfills required by ky (and other packages that rely on the Encoding API)
// in the jsdom test environment, which does not expose them as globals.
import { TextDecoder, TextEncoder } from 'util';

Object.assign(globalThis, { TextDecoder, TextEncoder });
