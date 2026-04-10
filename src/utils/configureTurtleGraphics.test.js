import Sk from "skulpt";
import { configureTurtleGraphics } from "./configureTurtleGraphics";

describe("configureTurtleGraphics", () => {
  test("sets Sk.TurtleGraphics target and assets map from project images", () => {
    const el = document.createElement("div");
    configureTurtleGraphics({
      targetEl: el,
      projectImages: [
        { name: "a", extension: "png", url: "https://x.test/a.png" },
        { name: "b", extension: "gif", url: "https://x.test/b.gif" },
      ],
    });
    expect(Sk.TurtleGraphics.target).toBe(el);
    expect(Sk.TurtleGraphics.assets["a.png"]).toBe("https://x.test/a.png");
    expect(Sk.TurtleGraphics.assets["b.gif"]).toBe("https://x.test/b.gif");
  });

  test("no-ops when targetEl is null", () => {
    expect(() =>
      configureTurtleGraphics({ targetEl: null, projectImages: [] }),
    ).not.toThrow();
  });
});
