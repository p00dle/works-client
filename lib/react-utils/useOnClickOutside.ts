import { useEffect } from 'react';

interface DocumentLike {
  addEventListener: (eventName: 'mousedown' | 'touchstart', listener: (event: MouseEvent | TouchEvent) => any) => void;
  removeEventListener: (eventName: 'mousedown' | 'touchstart', listener: (event: MouseEvent | TouchEvent) => any) => void;
  body: { 
    contains: (el: Element) => boolean;
  };
}

interface Ref {
  current: Element | null;
}

/** @internal */
export class ClickOutside {
  private elemHandlerMap = new Map<Element, () => any>();
  private elemClickedMap = new Map<Element, boolean>();
  private listening = false;
  private boundListener = this.eventListener.bind(this);
  constructor(private document: DocumentLike ) {}
  public subscribe(elem: Element | null, handler: () => any): void {
    if (elem === null) return;
    this.elemHandlerMap.set(elem, handler);
    if (!this.elemClickedMap.has(elem)) this.elemClickedMap.set(elem, false); 
    this.addRemoveListener();
  }
  public unsubscribe(elem: Element | null): void {
    if (elem === null) return;
    this.elemHandlerMap.delete(elem);
    this.addRemoveListener();
  }
  private addRemoveListener(): void {
    const handlerCount = this.elemHandlerMap.size;
    if (!this.listening && handlerCount > 0) {
      this.listening = true;
      this.document.addEventListener('mousedown', this.boundListener);
      this.document.addEventListener('touchstart', this.boundListener);
    } else if (this.listening && handlerCount === 0) {
      this.listening = false;
      this.document.removeEventListener('mousedown', this.boundListener);
      this.document.removeEventListener('touchstart', this.boundListener);      
    }
    for (const elem of this.elemClickedMap.keys()) {
      if (!this.document.body.contains(elem)){
        this.elemClickedMap.delete(elem);
      } 
    }
  }
  private eventListener(event: MouseEvent | TouchEvent) {
    for (const [elem, handler] of this.elemHandlerMap) {
      const alreadyClickedOutside = this.elemClickedMap.get(elem);
      const clickedInside = elem.contains(event.target as unknown as Node);
      if (clickedInside) {
        this.elemClickedMap.set(elem, false);
      } else if (!alreadyClickedOutside) {
        this.elemClickedMap.set(elem, true);
        handler();
      }
    }
  }
}

const clickOutsideInstance = new ClickOutside(document);

export function useOnClickOutside(ref: Ref, handler: () => void): void {
  useEffect(() => {
    const refElem = ref.current;
    clickOutsideInstance.subscribe(ref.current, handler);
    return () => {
      clickOutsideInstance.unsubscribe(refElem);
    }
  }, [ref, handler]);

}