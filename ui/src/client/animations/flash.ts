export function flash(element?: ElementCSSInlineStyle) {
  if (!element) return;

  requestAnimationFrame(() => {
    element.style.transition = "none";
    element.style.opacity = "0";

    setTimeout(() => {
      element.style.transition = "opacity 300ms";
      element.style.opacity = "";
    });
  });
}
