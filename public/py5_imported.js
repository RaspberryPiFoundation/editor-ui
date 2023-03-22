const $builtinmodule = function(name) {
  var py5 = Sk.importModule('py5', false, false)
  var mod = py5.$d
  Sk.builtins.height = mod.height
  Sk.builtins.width = mod.width
  Sk.builtins.mouse_x = mod.mouse_x
  Sk.builtins.mouse_y = mod.mouse_y
  Sk.builtins.frame_count = mod.frame_count
  return mod
}
