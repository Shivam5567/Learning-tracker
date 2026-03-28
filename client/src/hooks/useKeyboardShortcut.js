import { useEffect } from 'react';

/**
 * useKeyboardShortcut — fires a callback for a key combination.
 *
 * @param {string|string[]} keys  - key or array of keys (e.g. 'n', ['ctrl+k'])
 * @param {Function}        cb    - callback to fire
 * @param {Object}          opts  - { ctrl, meta, shift, alt, disabled }
 */
export function useKeyboardShortcut(keys, cb, opts = {}) {
  useEffect(() => {
    if (opts.disabled) return;

    const targets = Array.isArray(keys) ? keys : [keys];

    const handler = (e) => {
      // Ignore when typing in inputs/textareas/selects
      const tag = e.target.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.target.isContentEditable) return;

      const key = e.key.toLowerCase();

      for (const combo of targets) {
        const parts = combo.toLowerCase().split('+');
        const mainKey = parts[parts.length - 1];
        const needsCtrl  = parts.includes('ctrl');
        const needsMeta  = parts.includes('meta') || parts.includes('cmd');
        const needsShift = parts.includes('shift');
        const needsAlt   = parts.includes('alt');

        if (
          key === mainKey &&
          (!needsCtrl  || e.ctrlKey)  &&
          (!needsMeta  || e.metaKey)  &&
          (!needsShift || e.shiftKey) &&
          (!needsAlt   || e.altKey)   &&
          // Prevent extra modifier keys from firing plain shortcuts
          (needsCtrl || needsMeta || needsShift || needsAlt || (!e.ctrlKey && !e.metaKey && !e.altKey))
        ) {
          e.preventDefault();
          cb(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keys, cb, opts.disabled]);
}
