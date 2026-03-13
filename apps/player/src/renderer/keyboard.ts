export interface KeyboardHandlerCallbacks {
  onNext: () => void;
  onPrevious: () => void;
  onEscape: () => void;
}

export class KeyboardHandler {
  private readonly element: HTMLElement;
  private readonly handler: (e: KeyboardEvent) => void;
  private attached = false;

  constructor(element: HTMLElement, callbacks: KeyboardHandlerCallbacks) {
    this.element = element;
    this.handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          callbacks.onNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          callbacks.onPrevious();
          break;
        case "Escape":
          e.preventDefault();
          callbacks.onEscape();
          break;
      }
    };
  }

  attach(): void {
    if (this.attached) return;
    this.element.addEventListener("keydown", this.handler);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    this.element.removeEventListener("keydown", this.handler);
    this.attached = false;
  }
}
