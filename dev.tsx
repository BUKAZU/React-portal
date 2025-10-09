import React from 'react';
import { createRoot } from 'react-dom/client';

import Portal from './src/index';

runTheApp();
function runTheApp() {
  const elem = document.getElementById('bukazu-app');
  const elements = document.getElementsByClassName('bukazu-app');
  if (elements.length > 0) {
    for (let element of elements) {
      runApp(element);
    }
  } else if (elem) {
    runApp(elem);
  }
}

function runApp(element) {
  const portalCode = element.getAttribute('portal-code');
  const objectCode = element.getAttribute('object-code');
  const pageType = element.getAttribute('page');
  const locale = element.getAttribute('language');
  let filters = element.getAttribute('filters');

  if (filters) {
    filters = JSON.parse(filters);
  } else {
    filters = {};
  }

  // Store the root on the element to avoid recreating it
  let root = element.__reactRoot;
  if (!root) {
    root = createRoot(element);
    element.__reactRoot = root;
  }
  root.render(
    <Portal
      portalCode={portalCode}
      objectCode={objectCode}
      pageType={pageType}
      locale={locale}
      filters={filters}
      api_url="https://api.bukazu.com/graphql"
    />
  );
}

// registerServiceWorker()
