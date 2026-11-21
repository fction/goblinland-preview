// Use layout units for layout and camera math. Pointer hit testing still uses
// the visual viewport rectangles returned by getBoundingClientRect().
export function layoutRect(element) {
  const rect = element.getBoundingClientRect();
  const zoom = element.currentCSSZoom || 1;
  if (zoom === 1) return rect;
  return new DOMRect(rect.x / zoom, rect.y / zoom, rect.width / zoom, rect.height / zoom);
}
