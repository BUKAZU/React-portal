import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Modal from '../index';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function render(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  act(() => {
    root.render(
      <Modal buttonText="Info" {...props}>
        <p data-testid="modal-body">Content</p>
      </Modal>
    );
  });
}

function dialog() {
  return container.querySelector('dialog') as HTMLDialogElement;
}

function triggerButton() {
  return container.querySelector('.info-button') as HTMLButtonElement;
}

function closeButton() {
  return container.querySelector(
    '.bukazu-modal-footer button'
  ) as HTMLButtonElement;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

it('renders the trigger button', () => {
  render();
  expect(triggerButton()).not.toBeNull();
});

it('renders the dialog element (always in the DOM)', () => {
  render();
  expect(dialog()).not.toBeNull();
});

it('dialog starts closed by default', () => {
  render();
  expect(dialog().hasAttribute('open')).toBe(false);
});

it('renders children inside the dialog', () => {
  render();
  expect(dialog().querySelector('[data-testid="modal-body"]')).not.toBeNull();
});

// ---------------------------------------------------------------------------
// Opening
// ---------------------------------------------------------------------------

it('opens the dialog when the trigger button is clicked', () => {
  render();
  act(() => { triggerButton().click(); });
  expect(dialog().hasAttribute('open')).toBe(true);
});

it('opens immediately when show=true is passed', () => {
  render({ show: true });
  expect(dialog().hasAttribute('open')).toBe(true);
});

it('does not render the trigger button when show=true is passed', () => {
  render({ show: true });
  expect(triggerButton()).toBeNull();
});

// ---------------------------------------------------------------------------
// Closing via close button
// ---------------------------------------------------------------------------

it('closes the dialog when the close button is clicked', () => {
  render();
  act(() => { triggerButton().click(); });
  act(() => { closeButton().click(); });
  expect(dialog().hasAttribute('open')).toBe(false);
});

it('calls onClose when the close button is clicked', () => {
  const onClose = jest.fn();
  render({ onClose });
  act(() => { triggerButton().click(); });
  act(() => { closeButton().click(); });
  expect(onClose).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------------------
// Closing via Escape (cancel event)
// ---------------------------------------------------------------------------

it('closes the dialog when the cancel event fires (Escape key)', () => {
  render();
  act(() => { triggerButton().click(); });
  act(() => {
    dialog().dispatchEvent(new Event('cancel', { bubbles: false, cancelable: true }));
  });
  expect(dialog().hasAttribute('open')).toBe(false);
});

it('calls onClose when the cancel event fires', () => {
  const onClose = jest.fn();
  render({ onClose });
  act(() => { triggerButton().click(); });
  act(() => {
    dialog().dispatchEvent(new Event('cancel', { bubbles: false, cancelable: true }));
  });
  expect(onClose).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------------------
// Closing via backdrop click (click on the dialog element itself)
// ---------------------------------------------------------------------------

it('closes the dialog when the backdrop (dialog element) is clicked', () => {
  render();
  act(() => { triggerButton().click(); });
  act(() => { dialog().click(); });
  expect(dialog().hasAttribute('open')).toBe(false);
});

it('does not close the dialog when content inside it is clicked', () => {
  render();
  act(() => { triggerButton().click(); });
  const body = dialog().querySelector('[data-testid="modal-body"]') as HTMLElement;
  act(() => { body.click(); });
  expect(dialog().hasAttribute('open')).toBe(true);
});

// ---------------------------------------------------------------------------
// Re-open after close
// ---------------------------------------------------------------------------

it('can be reopened after being closed', () => {
  render();
  act(() => { triggerButton().click(); });
  act(() => { closeButton().click(); });
  act(() => { triggerButton().click(); });
  expect(dialog().hasAttribute('open')).toBe(true);
});
