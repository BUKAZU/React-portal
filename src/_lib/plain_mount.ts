export function mountPlainNode(
  container: HTMLElement,
  createNode: () => Node
): () => void {
  container.replaceChildren(createNode());

  return () => {
    container.replaceChildren();
  };
}
