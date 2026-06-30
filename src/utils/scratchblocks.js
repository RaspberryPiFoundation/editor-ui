import * as Sentry from "@sentry/react";
import scratchblocks from "scratchblocks";

import locales from "./scratchblocksLocales";

let languagesLoaded = false;

const localeMap = {
  "am-ET": "am",
  "ar-SA": "ar",
  "az-AZ": "az",
  "be-BY": "be",
  "bg-BG": "bg",
  "bn-BD": "en",
  "ca-ES": "ca",
  "ckb-IR": "ckb",
  "cs-CZ": "cs",
  "cy-GB": "cy",
  "da-DK": "da",
  "de-DE": "de",
  "el-GR": "el",
  "es-ES": "es",
  "es-LA": "es_419",
  "et-EE": "et",
  "eu-ES": "eu",
  "fa-IR": "fa",
  "fi-FI": "fi",
  "fr-CA": "fr",
  "fr-FR": "fr",
  "ga-IE": "ga",
  "gd-GB": "gd",
  "gl-ES": "gl",
  "he-IL": "he",
  "hi-IN": "en",
  "hr-HR": "hr",
  "hu-HU": "hu",
  "id-ID": "id",
  "is-IS": "is",
  "it-IT": "it",
  "ja-JP": "ja",
  ja_Hira: "ja_Hira",
  "ko-KR": "ko",
  "lt-LT": "lt",
  "lv-LV": "lv",
  "me-ME": "en",
  "mi-NZ": "mi",
  "mr-IN": "en",
  "nl-NL": "nl",
  "no-NO": "nb",
  "pl-PL": "pl",
  "pt-BR": "pt_br",
  "pt-PT": "pt",
  "ro-RO": "ro",
  "ru-RU": "ru",
  "sk-SK": "sk",
  "sl-SI": "sl",
  "sr-SP": "sr",
  "sv-SE": "sv",
  "th-TH": "th",
  "tr-TR": "tr",
  "uk-UA": "uk",
  "vi-VN": "vi",
  "vls-BE": "en",
  "xh-ZA": "xh",
  "zh-CN": "zh_cn",
  "zh-TW": "zh_tw",
  "zu-ZA": "zu",
};

export const scratchblocksInit = (currentLocale, container = document) => {
  const selectors = {
    ".language-blocks": "scratch2",
    ".language-blocks3": "scratch3",
  };

  if (!languagesLoaded) {
    scratchblocks.loadLanguages(locales);
    languagesLoaded = true;
  }

  return Object.entries(selectors).forEach((entry) => {
    const [selector, style] = entry;
    const elements = container.querySelectorAll(selector);

    Array.from(elements).forEach((block) =>
      renderScratchblock(block, currentLocale, style),
    );
  });
};

const renderScratchblock = (block, currentLocale, style) => {
  // Remove the ":: +" suffix from the block text, which breaks the block
  // rendering, but occurs as part of some projects.  This `:: +` is the "diff"
  // syntax.  This replacement doesn't work for more complex examples like
  // `:: // #a23aaa +` or whatever.
  const blockText = block.innerHTML.replace(/:: \+/g, ":: ");

  let svg;

  try {
    const parsed = scratchblocks.parse(blockText, {
      style,
    });

    parsed.translate(scratchblocksLocale(currentLocale));

    const translated = scratchblocks.newView(parsed, {
      style,
    });

    // render() builds the SVG element, but its stylesheet is only injected
    // into document.head (via scratchblocks' appendStyles on import). Because
    // the editor renders inside a shadow root, those head styles don't apply.
    // exportSVGString() embeds the stylesheet (and filter defs) inside the SVG
    // itself, so the block is self-contained and styled within the shadow DOM.
    translated.render();
    const svgString = translated.exportSVGString();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = svgString;
    svg = wrapper.querySelector("svg");
  } catch (e) {
    Sentry.captureException(e, {
      extra: {
        blockText,
        currentLocale,
        style,
      },
    });

    return;
  }

  if (!svg) {
    return;
  }

  if (style === "scratch3") {
    svg.style.transform = "scale(1)";
    svg.style.transformOrigin = "0 0";
  }

  block.parentNode.setAttribute("dir", "ltr");
  block.parentNode.insertBefore(svg, block);
  block.parentNode.removeChild(block);
};

export const scratchblocksLocale = (currentLocale) => {
  const languages = scratchblocks.allLanguages;
  const locale = localeMap[currentLocale];

  if (languages[locale]) {
    return languages[locale];
  }

  return languages.en;
};
