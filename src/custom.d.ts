interface Window {
  __localeId__?: string;
}

/**
 * Sentry DSN baked into the website build (`vite.website.config.ts`).
 * An empty string means the bundle reports nothing unless an embedder supplies
 * a `sentry-dsn` attribute.
 */
declare const __SENTRY_DSN__: string;

/** Package version baked into the website build. */
declare const __PORTAL_VERSION__: string;

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}
declare module '*.json' {
  const content: object;
  export default content;
}

declare module '*.msgpack?url' {
  const content: string;
  export default content;
}
