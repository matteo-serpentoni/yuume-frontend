/**
 * Why Did You Render — Development-only React re-render tracker.
 * This file MUST be imported BEFORE React in main.jsx.
 *
 * Uses dynamic import so the library is NOT bundled in production.
 *
 * Docs: https://github.com/welldone-software/why-did-you-render
 */
if (import.meta.env.DEV) {
  const React = await import('react');
  const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render');

  whyDidYouRender(React.default, {
    trackAllPureComponents: true,
    logOnDifferentValues: true,
    collapseGroups: true,
  });

  console.log('[WDYR] Why Did You Render is active');
}
