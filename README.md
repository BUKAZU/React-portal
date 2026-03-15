# bukazu-portal-react

A React component library that embeds the [Bukazu](https://www.bukazu.com) booking portal — calendar, search, and reviews modules — directly into any React application.

---

## What is Bukazu?

[Bukazu](https://www.bukazu.com) is an online booking and property-management platform for holiday rentals. It provides a fully-managed back-end (availability calendars, pricing, booking forms, guest reviews) and exposes that data through a GraphQL API. This library is the official front-end component that lets you surface Bukazu data on your own website without building the UI from scratch.

### Modules included

| Module | Description |
|--------|-------------|
| **Calendar** | Interactive availability calendar with arrival/departure highlighting, pricing, discount indicators, and an embedded booking form |
| **Search** | Filterable property search with grid/list view, pagination, and customisable filter fields |
| **Reviews** | Display guest reviews and aggregate score for a specific property |

---

## Installation

```bash
npm install bukazu-portal-react
```

Then import the bundled stylesheet once in your application entry point:

```js
import 'bukazu-portal-react/index.css';
```

---

## Quick Start

The default export is the `Portal` component. Pass your **portal code** (and optionally an **object code**) to load the correct module.

```tsx
import Portal from 'bukazu-portal-react';
import 'bukazu-portal-react/index.css';

function App() {
  return (
    <Portal
      portalCode="YOUR_PORTAL_CODE"
      objectCode="YOUR_OBJECT_CODE"
      locale="en"
    />
  );
}
```

---

## Usage by Module

### Calendar (availability + booking form)

Render the calendar for a specific property by supplying both `portalCode` and `objectCode`. No `pageType` is needed — the calendar is the default when an `objectCode` is present.

```tsx
<Portal
  portalCode="YOUR_PORTAL_CODE"
  objectCode="YOUR_OBJECT_CODE"
  locale="en"
/>
```

### Search

Render the property search page by omitting `objectCode`. You can pre-populate filter values via the `filters` prop.

```tsx
<Portal
  portalCode="YOUR_PORTAL_CODE"
  locale="en"
  filters={{
    persons_min: '2',
    arrival_date: '2024-07-01',
    departure_date: '2024-07-14'
  }}
/>
```

### Reviews

Render the reviews page for a specific property by passing `objectCode` together with `pageType="reviews"`.

```tsx
<Portal
  portalCode="YOUR_PORTAL_CODE"
  objectCode="YOUR_OBJECT_CODE"
  pageType="reviews"
  locale="en"
/>
```

---

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `portalCode` | `string` | ✅ | — | Your Bukazu portal identifier. Find it in your Bukazu back-office. |
| `objectCode` | `string` | — | — | The property code. Required for the Calendar and Reviews modules. |
| `pageType` | `string` | — | — | Set to `"reviews"` to render the Reviews module. |
| `locale` | `string` | — | `"en"` | Display language. Supported values: `en`, `nl`, `de`, `fr`, `es`, `it`. |
| `filters` | `FiltersType` | — | `{}` | Pre-set filter values for the Search module (see below). |
| `api_url` | `string` | — | `https://api.bukazu.com/graphql` | Override the GraphQL endpoint (useful for staging environments). |

### `filters` object

All filter keys are optional strings/arrays.

| Key | Type | Description |
|-----|------|-------------|
| `arrival_date` | `string` | Pre-selected arrival date (`YYYY-MM-DD`) |
| `departure_date` | `string` | Pre-selected departure date (`YYYY-MM-DD`) |
| `persons_min` | `string` | Minimum number of persons |
| `persons_max` | `string` | Maximum number of persons |
| `bedrooms_min` | `string` | Minimum number of bedrooms |
| `bathrooms_min` | `string` | Minimum number of bathrooms |
| `weekprice_max` | `string` | Maximum weekly price |
| `countries` | `any` | Filter by country |
| `regions` | `any` | Filter by region |
| `cities` | `string` | Filter by city |
| `properties` | `any[]` | Filter by property characteristics |
| `extra_search` | `string` | Free-text search term |

---

## Colour Customisation

Colours are defined in your Bukazu back-office and applied automatically as CSS custom properties on the page root. You can also override them in your own stylesheet:

```css
:root {
  --bukazu-button:      #0055a5;  /* primary action button  */
  --bukazu-button_cta:  #e94e1b;  /* call-to-action button  */
  --bukazu-arrival:     #c8f5c8;  /* arrival day highlight  */
  --bukazu-departure:   #ffd6d6;  /* departure day highlight */
  --bukazu-booked:      #d6d6d6;  /* booked / unavailable   */
  --bukazu-cell:        #f0f8ff;  /* available day cell     */
  --bukazu-discount:    #fff3cd;  /* discounted price cell  */
}
```

---

## Supported Languages

Pass one of the following BCP-47 locale codes to the `locale` prop:

| Code | Language |
|------|----------|
| `en` | English (default) |
| `nl` | Dutch |
| `de` | German |
| `fr` | French |
| `es` | Spanish |
| `it` | Italian |

---

## Integration Troubleshooting

The component performs basic validation on startup and will display an error message in place of the portal if any of the following conditions are detected.

### Common errors

| Symptom | Cause | Solution |
|---------|-------|----------|
| *"No portal code is specified"* | `portalCode` prop is missing or empty | Supply the portal code from your Bukazu back-office |
| *"Invalid locale"* | An unsupported locale string was passed | Use one of: `en`, `nl`, `de`, `fr`, `es`, `it` |
| *"is not a valid page"* | `pageType` has an unrecognised value | Only `"reviews"` is a valid `pageType`; omit the prop for the default modules |
| Blank / nothing rendered | CSS stylesheet not imported | Add `import 'bukazu-portal-react/index.css'` to your entry point |
| API errors in the console | Invalid portal or object code | Double-check the codes in your Bukazu back-office |

### Reporting Issues

If you encounter a bug or have a feature request, please [open an issue](https://github.com/BUKAZU/React-portal/issues) on GitHub and include:

1. The version of `bukazu-portal-react` you are using (`npm list bukazu-portal-react`)
2. Your React version
3. A minimal reproducible example
4. Any console errors or network errors from the browser DevTools

---

## Bundle Analysis

The production build uses [Terser](https://terser.org/) for advanced minification (with console/debugger stripping and Safari 10 mangling compatibility) and reports gzip sizes for all output files.

To generate an interactive visual bundle report, run:

```bash
npm run build:analyze
```

This builds the library with `ANALYZE=true`, which activates [`rollup-plugin-visualizer`](https://github.com/btd/rollup-plugin-visualizer) and writes a `build/stats.html` report. The report opens automatically in your browser and shows the size breakdown of every module in the bundle (including gzip and Brotli sizes), making it easy to identify large dependencies that are candidates for further size reduction.

---

## License

MIT © [Bukazu](https://www.bukazu.com)

