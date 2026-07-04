/** Match charades mobile CSS — portrait phones and landscape phone heights. */
export function isMobileViewport(width = window.innerWidth, height = window.innerHeight): boolean {
  return width <= 932 || (height <= 480 && width > height);
}
