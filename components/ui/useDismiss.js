import { useEffect } from 'react';

// Closes a dropdown when you click/tap outside of it or press Escape.
// `ref` points at the element that wraps the button and the dropdown.
// A custom hook is just a function starting with "use" that calls other hooks, so
// the bell and the account menu can share this instead of each copying it.
export default function useDismiss(ref, isOpen, close) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function pointerHandler(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        close();
      }
    }
    function keyHandler(event) {
      if (event.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('mousedown', pointerHandler);
    document.addEventListener('touchstart', pointerHandler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', pointerHandler);
      document.removeEventListener('touchstart', pointerHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [ref, isOpen, close]);
}
