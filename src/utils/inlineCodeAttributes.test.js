import { Marked } from "marked";
import inlineCodeAttributes from "./inlineCodeAttributes";

const render = (markdown) => {
  const marked = new Marked();
  marked.use({ extensions: [inlineCodeAttributes] });
  return marked.parseInline(markdown);
};

describe("inlineCodeAttributes marked extension", () => {
  test("applies a class from a kramdown inline attribute list", () => {
    expect(render('`Looks`{:class="block3looks"}')).toBe(
      '<code class="block3looks">Looks</code>',
    );
  });

  test("applies a block-type attribute from the inline attribute list", () => {
    expect(render('`Looks`{:block-type="looks"}')).toBe(
      '<code block-type="looks">Looks</code>',
    );
  });

  test("supports the .class shorthand", () => {
    expect(render("`Move`{:.block3motion}")).toBe(
      '<code class="block3motion">Move</code>',
    );
  });

  test("supports the #id shorthand", () => {
    expect(render("`Say`{:#say-block}")).toBe(
      '<code id="say-block">Say</code>',
    );
  });

  test("supports arbitrary attributes and multiple classes", () => {
    expect(render('`Wait`{:.block3control .highlight data-step="2"}')).toBe(
      '<code class="block3control highlight" data-step="2">Wait</code>',
    );
  });

  test("leaves plain code spans untouched", () => {
    expect(render("`plain`")).toBe("<code>plain</code>");
  });

  test("does not consume text when there is no attribute list", () => {
    expect(render('`plain` and `Looks`{:class="block3looks"}')).toBe(
      '<code>plain</code> and <code class="block3looks">Looks</code>',
    );
  });

  test("escapes the code text and attribute values", () => {
    expect(render('`<b>`{:title="a\\"b"}')).toContain("&lt;b&gt;");
    expect(render('`x`{:title="a&b"}')).toBe('<code title="a&amp;b">x</code>');
  });
});
