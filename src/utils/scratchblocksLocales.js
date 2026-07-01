// Trimmed copy of scratchblocks/locales/all.js containing only the locales the
// editor actually supports (i.e. the values referenced in the localeMap in
// scratchblocks.js). We list them explicitly rather than importing the upstream
// all.js to avoid jest module import errors, and to keep the ~1MB of unused
// locale JSON out of the bundle. `en` is built into scratchblocks so is omitted.
import am from "scratchblocks/locales/am.json";
import ar from "scratchblocks/locales/ar.json";
import az from "scratchblocks/locales/az.json";
import be from "scratchblocks/locales/be.json";
import bg from "scratchblocks/locales/bg.json";
import ca from "scratchblocks/locales/ca.json";
import ckb from "scratchblocks/locales/ckb.json";
import cs from "scratchblocks/locales/cs.json";
import cy from "scratchblocks/locales/cy.json";
import da from "scratchblocks/locales/da.json";
import de from "scratchblocks/locales/de.json";
import el from "scratchblocks/locales/el.json";
import es from "scratchblocks/locales/es.json";
import es_419 from "scratchblocks/locales/es-419.json";
import et from "scratchblocks/locales/et.json";
import eu from "scratchblocks/locales/eu.json";
import fa from "scratchblocks/locales/fa.json";
import fi from "scratchblocks/locales/fi.json";
import fr from "scratchblocks/locales/fr.json";
import ga from "scratchblocks/locales/ga.json";
import gd from "scratchblocks/locales/gd.json";
import gl from "scratchblocks/locales/gl.json";
import he from "scratchblocks/locales/he.json";
import hr from "scratchblocks/locales/hr.json";
import hu from "scratchblocks/locales/hu.json";
import id from "scratchblocks/locales/id.json";
import is from "scratchblocks/locales/is.json";
import it from "scratchblocks/locales/it.json";
import ja from "scratchblocks/locales/ja.json";
import ja_Hira from "scratchblocks/locales/ja-Hira.json";
import ko from "scratchblocks/locales/ko.json";
import lt from "scratchblocks/locales/lt.json";
import lv from "scratchblocks/locales/lv.json";
import mi from "scratchblocks/locales/mi.json";
import nb from "scratchblocks/locales/nb.json";
import nl from "scratchblocks/locales/nl.json";
import pl from "scratchblocks/locales/pl.json";
import pt from "scratchblocks/locales/pt.json";
import pt_br from "scratchblocks/locales/pt-br.json";
import ro from "scratchblocks/locales/ro.json";
import ru from "scratchblocks/locales/ru.json";
import sk from "scratchblocks/locales/sk.json";
import sl from "scratchblocks/locales/sl.json";
import sr from "scratchblocks/locales/sr.json";
import sv from "scratchblocks/locales/sv.json";
import th from "scratchblocks/locales/th.json";
import tr from "scratchblocks/locales/tr.json";
import uk from "scratchblocks/locales/uk.json";
import vi from "scratchblocks/locales/vi.json";
import xh from "scratchblocks/locales/xh.json";
import zh_cn from "scratchblocks/locales/zh-cn.json";
import zh_tw from "scratchblocks/locales/zh-tw.json";
import zu from "scratchblocks/locales/zu.json";

const locales = {
  am,
  ar,
  az,
  be,
  bg,
  ca,
  ckb,
  cs,
  cy,
  da,
  de,
  el,
  es,
  es_419,
  et,
  eu,
  fa,
  fi,
  fr,
  ga,
  gd,
  gl,
  he,
  hr,
  hu,
  id,
  is,
  it,
  ja,
  ja_Hira,
  ko,
  lt,
  lv,
  mi,
  nb,
  nl,
  pl,
  pt,
  pt_br,
  ro,
  ru,
  sk,
  sl,
  sr,
  sv,
  th,
  tr,
  uk,
  vi,
  xh,
  zh_cn,
  zh_tw,
  zu,
};

export default locales;
