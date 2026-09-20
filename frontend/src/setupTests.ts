import "@testing-library/jest-dom";

jest.mock("./config/env", () => ({
  API_BASE_URL: "http://localhost:8000",
  API_MODE: "test",
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(window, "CSS", {
  value: {
    supports: () => false,
    escape: (str: string) => str,
  },
});

Object.defineProperty(document, "fonts", {
  value: {
    ready: Promise.resolve(),
  },
});
