const $builtinmodule = function(name) {
  var py5 = Sk.importModule('py5', false, false)
  const mod = py5.$d
  Sk.builtins.height = new Sk.builtin.int_(0);
  Sk.builtins.width = new Sk.builtin.int_(0);

  mod.size = new Sk.builtin.func(function (w, h, mode) {
    if (typeof(mode) === "undefined") {
      mode = mod.P2D;
    }
    mod.pInst.createCanvas(w.v, h.v, mode.v);
    mod.width = new Sk.builtin.int_(mod.pInst.width);
    mod.height = new Sk.builtin.int_(mod.pInst.height);
    Sk.builtins.width = mod.width
    Sk.builtins.height = mod.height
    console.log(Sk.builtins)
    mod.renderMode = mode;
  });

  Sk.builtins.mouse_x = mod.mouse_x
  Sk.builtins.mouse_y = mod.mouse_y
  Sk.builtins.frame_count = mod.frame_count
  return mod
}
