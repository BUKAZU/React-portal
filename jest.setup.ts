// Polyfills required by ky (and other packages that rely on the Encoding API)
// in the jsdom test environment, which does not expose them as globals.
import { TextDecoder, TextEncoder } from 'util';

Object.assign(globalThis, { TextDecoder, TextEncoder });

// jsdom does not implement HTMLDialogElement.showModal / .close.
// Polyfill them so components that use <dialog> can be unit-tested.
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  }
}
