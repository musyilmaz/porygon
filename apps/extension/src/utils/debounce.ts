export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, ms);
  };
}

export function leadingTrailingDebounce(
  onStart: () => void,
  onEnd: () => void,
  ms: number,
): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let active = false;

  return () => {
    if (!active) {
      active = true;
      onStart();
    }

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      active = false;
      onEnd();
    }, ms);
  };
}
