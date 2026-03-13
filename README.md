# WebComponent

This is a web component that can be used to embed the Bukazu portal in a website or application.

## Installation

```bash
    npm install bukazu-portal-react
```

## Usage

```jsx
    import { Portal } from 'bukazu-portal-react';

    function App() {
        return (
            <Portal pageType="calendar" />
        );
    }
```

## Bundle Analysis

The production build uses [Terser](https://terser.org/) for advanced minification (with console/debugger stripping and Safari 10 mangling compatibility) and reports gzip sizes for all output files.

To generate an interactive visual bundle report, run:

```bash
npm run build:analyze
```

This builds the library with `ANALYZE=true`, which activates [`rollup-plugin-visualizer`](https://github.com/btd/rollup-plugin-visualizer) and writes a `build/stats.html` report. The report opens automatically in your browser and shows the size breakdown of every module in the bundle (including gzip and Brotli sizes), making it easy to identify large dependencies that are candidates for further size reduction.

