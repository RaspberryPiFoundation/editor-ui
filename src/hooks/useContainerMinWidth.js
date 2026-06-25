import { useCallback, useLayoutEffect, useState } from "react";

const getObservedWidth = (entry) => {
  const contentBoxSize = Array.isArray(entry.contentBoxSize)
    ? entry.contentBoxSize[0]
    : entry.contentBoxSize;

  return contentBoxSize?.inlineSize ?? entry.contentRect?.width;
};

export const useContainerMinWidth = (minWidth) => {
  const [container, setContainer] = useState(null);
  const [matches, setMatches] = useState(false);
  const containerRef = useCallback((node) => setContainer(node), []);

  useLayoutEffect(() => {
    if (!container) return undefined;

    const update = (width) => {
      if (typeof width === "number") {
        setMatches(width >= minWidth);
      }
    };

    update(container.getBoundingClientRect().width);

    if (!window.ResizeObserver) return undefined;

    const observer = new window.ResizeObserver((entries) => {
      if (entries[0]) update(getObservedWidth(entries[0]));
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [container, minWidth]);

  return [matches, containerRef];
};
