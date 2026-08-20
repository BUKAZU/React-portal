import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for the self-contained website build.
 *
 * Unlike the library build (vite.config.ts), React and all other dependencies
 * are bundled into the output so that the resulting file can be dropped into
 * any HTML page without any additional tooling or package manager. The
 * stylesheet is injected by the bundle itself, so a single `<script>` tag is
 * all an embedder needs.
 *
 * Output: build/portal.website.js  (IIFE, all dependencies and styles inlined)
 *         build/portal.website.css (the same styles as a separate file, for
 *                                   embedders whose CSP forbids inline styles)
 */

const CSS_FILE_NAME = 'portal.website.css';
const STYLE_ELEMENT_ID = 'bukazu-portal-styles';

const { version } = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf8')
) as { version: string };

/**
 * Renders a string as a JavaScript literal that is safe to embed in a
 * `<script>` block. `JSON.stringify` handles quotes, backslashes, newlines and
 * control characters; escaping `<` additionally neutralises `</script` and
 * `<!--` sequences, both of which are legal inside CSS `content` values.
 */
function toJsLiteral(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * The stylesheet injector that gets prepended to the bundle.
 *
 * It runs before the portal mounts, so styles are in place ahead of the first
 * paint. The element id makes the injection idempotent: a page that loads the
 * bundle twice still ends up with exactly one `<style>` element.
 */
function styleInjector(css: string): string {
  return `(function(){try{
if(typeof document==="undefined")return;
if(document.getElementById(${toJsLiteral(STYLE_ELEMENT_ID)}))return;
var s=document.createElement("style");
s.id=${toJsLiteral(STYLE_ELEMENT_ID)};
s.setAttribute("data-bukazu-version",${toJsLiteral(version)});
var c=document.currentScript;if(c&&c.nonce)s.nonce=c.nonce;
s.textContent=${toJsLiteral(css)};
(document.head||document.documentElement).appendChild(s);
}catch(e){}})();
`;
}

/**
 * Prepends the extracted stylesheet to the bundle as a self-injecting
 * `<style>` element, so `portal.website.js` needs no companion `<link>`.
 *
 * Vite emits the library stylesheet from `vite:css-post`'s own `generateBundle`
 * hook, and `cssPostPlugin` is ordered ahead of the post plugins, so an
 * `enforce: 'post'` plugin with a `post`-ordered hook sees the finished CSS
 * asset. The asset is deliberately left in the bundle: it is still published
 * for embedders who load styles through a `<link>` tag.
 */
function inlineCss(): Plugin {
  return {
    name: 'bukazu:inline-css',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const asset = bundle[CSS_FILE_NAME];
        if (!asset || asset.type !== 'asset') {
          this.error(
            `[bukazu:inline-css] ${CSS_FILE_NAME} is not in the bundle. ` +
              `Present: ${Object.keys(bundle).join(', ')}`
          );
          return;
        }

        const css =
          typeof asset.source === 'string'
            ? asset.source
            : Buffer.from(asset.source).toString('utf8');

        const entry = Object.values(bundle).find(
          (output) => output.type === 'chunk' && output.isEntry
        );
        if (!entry || entry.type !== 'chunk') {
          this.error('[bukazu:inline-css] no entry chunk found');
          return;
        }

        entry.code = styleInjector(css) + entry.code;
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), inlineCss()],
  define: {
    // Vite does not substitute `process.env.NODE_ENV` in library mode, and this
    // bundle is loaded straight from a `<script>` tag with no bundler behind it
    // to do the substitution. Without this, React's own `process.env.NODE_ENV`
    // reads throw "process is not defined" and nothing renders.
    'process.env.NODE_ENV': JSON.stringify('production'),
    __SENTRY_DSN__: JSON.stringify(process.env.BUKAZU_SENTRY_DSN ?? ''),
    __PORTAL_VERSION__: JSON.stringify(version)
  },
  build: {
    outDir: 'build',
    emptyOutDir: false,
    reportCompressedSize: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },
    lib: {
      entry: resolve(__dirname, 'src/website.tsx'),
      name: 'BukazuPortal',
      formats: ['iife'],
      fileName: () => 'portal.website.js',
      cssFileName: 'portal.website'
    }
    // No `inlineDynamicImports`: the IIFE library format already disables code
    // splitting, so rolldown ignores the option and warns about it. The locale
    // and country payloads end up inlined either way.
  }
});
