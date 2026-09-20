declare global {
  interface Window {
    __INITIAL_STATE__?: unknown;
  }

  class ResizeObserver {
    constructor(callback: ResizeObserverCallback);
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
  }

  type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;

  interface ResizeObserverEntry {
    target: Element;
    contentRect: DOMRectReadOnly;
  }

  interface ImportMeta {
    env: {
      VITE_API_URL?: string;
      MODE?: string;
      [key: string]: string | undefined;
    };
  }
}

export {};
