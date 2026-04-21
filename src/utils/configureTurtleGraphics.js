import Sk from "skulpt";

/**
 * Wires Skulpt turtle to a DOM container and project image URLs for stamps.
 * Asset keys follow `${name}.${extension}` → url (Skulpt turtle convention).
 */
export function configureTurtleGraphics({ targetEl, projectImages = [] }) {
  if (!targetEl) {
    return;
  }
  (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = targetEl;
  Sk.TurtleGraphics.assets = Object.assign(
    {},
    ...projectImages.map((image) => ({
      [`${image.name}.${image.extension}`]: image.url,
    })),
  );
}
