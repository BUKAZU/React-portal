declare module '*.svg' {
 import React = require('react');
 export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
 const src: string;
 export default src;
}
declare module '*.json' {
 const content: object;
 export default content;
}

// Vite ?inline import returns a string
declare module '*?inline' {
 const content: string;
 export default content;
}

// React 19 added href + precedence to <style> for document hoisting.
// @types/react 18 doesn't include them yet, so we augment here.
declare namespace React {
 interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
  href?: string;
  precedence?: string;
 }
}