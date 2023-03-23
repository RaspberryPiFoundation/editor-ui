const $builtinmodule = function(name) {
  var py5 = Sk.importModule('p5', false, false)
  const mod = py5.$d

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
    console.log(fr)
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
  
  return mod
}
