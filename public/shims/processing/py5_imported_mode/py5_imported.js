const $builtinmodule = function(name) {
  var py5 = Sk.importModule('p5', false, false)
  const mod = py5.$d
  mod.__name__ = new Sk.builtin.str("py5_imported")

  const processArgs = function processArgumentValues(arguments_) {
    const argVals = [];
    for (a of arguments_) {
      if (typeof(a) !== 'undefined') {
        argVals.push(a.v);
      }
    }

    return argVals;
  };

  mod.frame_rate = new Sk.builtin.func(function (fr) {
    mod.pInst.frameRate(fr.v);
  });
  
  mod.color = mod.Color
  delete mod.Color
  mod.get = new Sk.builtin.func(function () {
    const argVals = processArgs(arguments);
    const colorArgs = mod.pInst.get(...argVals)
    const colorArgsArray = [
      new Sk.builtin.float_(colorArgs[0]),
      new Sk.builtin.float_(colorArgs[1]),
      new Sk.builtin.float_(colorArgs[2])
    ]
    return new Sk.misceval.callsimArray(mod.color, colorArgsArray)
  });

  runFunction = mod.run
  mod.run_sketch = new Sk.builtin.func(function () {
    Sk.misceval.callsim(runFunction)
  })
  delete mod.run

  mod.remap = mod.map
  delete mod.map

  delete mod.DEGREES
  delete mod.RADIANS
  delete mod.lightness
  delete mod.erase
  delete mod.no_erase
  delete mod.text_style
  
  return mod
}
