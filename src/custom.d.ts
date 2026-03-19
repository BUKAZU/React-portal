interface Window {
	__localeId__?: string;
}

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