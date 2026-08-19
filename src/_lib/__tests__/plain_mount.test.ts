import { mountPlainNode } from '../plain_mount';

describe('mountPlainNode', () => {
  it('mounts and unmounts a plain DOM node', () => {
    const container = document.createElement('div');

    const unmount = mountPlainNode(container, () => {
      const node = document.createElement('section');
      node.textContent = 'hello';
      return node;
    });

    expect(container.querySelector('section')?.textContent).toBe('hello');

    unmount();

    expect(container.childElementCount).toBe(0);
  });
});
