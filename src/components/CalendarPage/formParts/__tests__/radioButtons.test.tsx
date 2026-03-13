import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { RadioButton, RadioButtonGroup } from '../radioButtons';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const noop = () => {};

function makeField(name: string, value: string) {
  return {
    name,
    value,
    onChange: noop,
    onBlur: noop
  };
}

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

describe('RadioButton', () => {
  it('renders an input of type radio', () => {
    act(() => {
      root.render(
        <RadioButton field={makeField('is_option', 'false')} id="true" label="Option" />
      );
    });
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect(input?.type).toBe('radio');
  });

  it('sets the input name from the field prop', () => {
    act(() => {
      root.render(
        <RadioButton field={makeField('is_option', 'false')} id="true" label="Option" />
      );
    });
    const input = container.querySelector('input');
    expect(input?.name).toBe('is_option');
  });

  it('sets the input id from the id prop', () => {
    act(() => {
      root.render(
        <RadioButton field={makeField('is_option', 'false')} id="true" label="Option" />
      );
    });
    const input = container.querySelector('input');
    expect(input?.id).toBe('true');
  });

  it('sets the input value to the id prop', () => {
    act(() => {
      root.render(
        <RadioButton field={makeField('is_option', 'false')} id="true" label="Option" />
      );
    });
    const input = container.querySelector('input');
    expect(input?.value).toBe('true');
  });

  it('is checked when the id matches the field value', () => {
    act(() => {
      root.render(
        <RadioButton field={makeField('is_option', 'true')} id="true" label="Option" />
      );
    });
    const input = container.querySelector('input');
    expect(input?.checked).toBe(true);
  });

  it('is not checked when the id does not match the field value', () => {
    act(() => {
      root.render(
        <RadioButton field={makeField('is_option', 'false')} id="true" label="Option" />
      );
    });
    const input = container.querySelector('input');
    expect(input?.checked).toBe(false);
  });

  it('applies the radio-button class to the input', () => {
    act(() => {
      root.render(
        <RadioButton field={makeField('is_option', 'false')} id="true" label="Option" />
      );
    });
    const input = container.querySelector('input');
    expect(input?.className).toBe('radio-button');
  });

  it('renders a label associated with the input id', () => {
    act(() => {
      root.render(
        <RadioButton field={makeField('is_option', 'false')} id="true" label="Option" />
      );
    });
    const label = container.querySelector('label');
    expect(label?.htmlFor).toBe('true');
    expect(label?.textContent).toBe('Option');
  });
});

describe('RadioButtonGroup', () => {
  it('renders its children', () => {
    act(() => {
      root.render(
        <RadioButtonGroup>
          <span data-testid="child">Child</span>
        </RadioButtonGroup>
      );
    });
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
  });

  it('applies the className prop to the root div', () => {
    act(() => {
      root.render(
        <RadioButtonGroup className="booking_option">
          <span />
        </RadioButtonGroup>
      );
    });
    expect(container.querySelector('.booking_option')).not.toBeNull();
  });

  it('renders the label text inside a .legend div', () => {
    act(() => {
      root.render(
        <RadioButtonGroup label="Choose type">
          <span />
        </RadioButtonGroup>
      );
    });
    const legend = container.querySelector('.legend');
    expect(legend).not.toBeNull();
    expect(legend?.textContent).toBe('Choose type');
  });

  it('does not render the feedback div when touched is falsy', () => {
    act(() => {
      root.render(
        <RadioButtonGroup error="Something went wrong">
          <span />
        </RadioButtonGroup>
      );
    });
    expect(container.querySelector('.input-feedback')).toBeNull();
  });

  it('renders the error feedback div when touched is true and an error is provided', () => {
    act(() => {
      root.render(
        <RadioButtonGroup touched={true} error="Something went wrong">
          <span />
        </RadioButtonGroup>
      );
    });
    const feedback = container.querySelector('.input-feedback');
    expect(feedback).not.toBeNull();
    expect(feedback?.textContent).toBe('Something went wrong');
  });

  it('does not render the feedback div when touched is true but no error is provided', () => {
    act(() => {
      root.render(
        <RadioButtonGroup touched={true}>
          <span />
        </RadioButtonGroup>
      );
    });
    expect(container.querySelector('.input-feedback')).toBeNull();
  });
});
