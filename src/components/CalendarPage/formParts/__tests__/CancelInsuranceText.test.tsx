import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import CancelInsuranceText from '../CancelInsuranceText';
import { AppContext } from '../../../AppContext';
import { LocaleType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
});

afterEach(() => {
  delete (window as any).__localeId__;
  act(() => {
    root.unmount();
  });
  container.remove();
});

function renderCancelInsuranceText(locale: LocaleType = 'en') {
  act(() => {
    root.render(
      <AppContext.Provider
        value={{ locale, portalCode: 'TEST', objectCode: '', apiUrl: '' }}
      >
        <CancelInsuranceText />
      </AppContext.Provider>
    );
  });
}

describe('CancelInsuranceText – content sections', () => {
  it('renders the main insurance heading', () => {
    renderCancelInsuranceText();
    const headings = container.querySelectorAll('h2');
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0].textContent?.trim()).toBe('Short-term Cancellation Insurance');
  });

  it('renders the "More are insured than you think." sub-heading', () => {
    renderCancelInsuranceText();
    const h3s = Array.from(container.querySelectorAll('h3'));
    const found = h3s.find((h) =>
      h.textContent?.includes('More are insured than you think')
    );
    expect(found).not.toBeUndefined();
  });

  it('renders the "Important" sub-heading', () => {
    renderCancelInsuranceText();
    const h3s = Array.from(container.querySelectorAll('h3'));
    const found = h3s.find((h) => h.textContent === 'Important');
    expect(found).not.toBeUndefined();
  });

  it('renders the "For whom?" sub-heading', () => {
    renderCancelInsuranceText();
    const h3s = Array.from(container.querySelectorAll('h3'));
    const found = h3s.find((h) => h.textContent === 'For whom?');
    expect(found).not.toBeUndefined();
  });

  it('renders the FAQ sub-heading', () => {
    renderCancelInsuranceText();
    const h3s = Array.from(container.querySelectorAll('h3'));
    const found = h3s.find((h) =>
      h.textContent?.includes('Frequently Asked Questions')
    );
    expect(found).not.toBeUndefined();
  });

  it('renders the terms heading', () => {
    renderCancelInsuranceText();
    const h3s = Array.from(container.querySelectorAll('h3'));
    const found = h3s.find((h) => h.textContent === 'Terms');
    expect(found).not.toBeUndefined();
  });
});

describe('CancelInsuranceText – locale-specific FAQ links', () => {
  it('uses the English FAQ URL for locale "en"', () => {
    renderCancelInsuranceText('en');
    const links = container.querySelectorAll('a[target="_blank"]');
    const faqLink = Array.from(links).find((a) =>
      (a as HTMLAnchorElement).href.includes('frequently-asked-questions')
    );
    expect(faqLink).not.toBeUndefined();
    expect((faqLink as HTMLAnchorElement).href).toContain(
      '/en/frequently-asked-questions'
    );
  });

  it('uses the Dutch FAQ URL for locale "nl"', () => {
    renderCancelInsuranceText('nl');
    const links = container.querySelectorAll('a[target="_blank"]');
    const faqLink = Array.from(links).find((a) =>
      (a as HTMLAnchorElement).href.includes('recreatieverzekeringen.nl')
    );
    expect(faqLink).not.toBeUndefined();
    expect((faqLink as HTMLAnchorElement).href).toContain(
      'recreatieverzekeringen.nl/veelgestelde-vragen'
    );
  });

  it('uses the German FAQ URL for locale "de"', () => {
    renderCancelInsuranceText('de');
    const links = container.querySelectorAll('a[target="_blank"]');
    const faqLink = Array.from(links).find((a) =>
      (a as HTMLAnchorElement).href.includes('recreatieverzekeringen.nl')
    );
    expect(faqLink).not.toBeUndefined();
    expect((faqLink as HTMLAnchorElement).href).toContain(
      '/de/haufig-gestellte-fragen'
    );
  });

  it('falls back to English FAQ URL for locales "fr", "es", "it"', () => {
    for (const locale of ['fr', 'es', 'it'] as LocaleType[]) {
      act(() => {
        root.render(
          <AppContext.Provider
            value={{
              locale,
              portalCode: 'TEST',
              objectCode: '',
              apiUrl: ''
            }}
          >
            <CancelInsuranceText />
          </AppContext.Provider>
        );
      });
      const links = container.querySelectorAll('a[target="_blank"]');
      const faqLink = Array.from(links).find((a) =>
        (a as HTMLAnchorElement).href.includes('frequently-asked-questions')
      );
      expect(faqLink).not.toBeUndefined();
    }
  });
});

describe('CancelInsuranceText – terms PDF link', () => {
  it('renders a link to the locale-specific insurance PDF', () => {
    renderCancelInsuranceText('en');
    const links = Array.from(container.querySelectorAll('a'));
    const pdfLink = links.find((a) => a.href.includes('insurance.pdf'));
    expect(pdfLink).not.toBeUndefined();
    expect(pdfLink?.href).toContain('/en/insurance.pdf');
  });

  it('renders the "Show conditions" text for the PDF link', () => {
    renderCancelInsuranceText('en');
    const links = Array.from(container.querySelectorAll('a'));
    const pdfLink = links.find((a) => a.href.includes('insurance.pdf'));
    expect(pdfLink?.textContent).toBe('Show conditions');
  });

  it('sets rel="noopener noreferrer" on the PDF link', () => {
    renderCancelInsuranceText('en');
    const links = Array.from(container.querySelectorAll('a'));
    const pdfLink = links.find((a) => a.href.includes('insurance.pdf'));
    expect(pdfLink?.rel).toContain('noopener');
    expect(pdfLink?.rel).toContain('noreferrer');
  });
});
