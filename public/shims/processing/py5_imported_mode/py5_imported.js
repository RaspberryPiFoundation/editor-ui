const $builtinmodule = function (name) {
  var py5 = Sk.importModule("p5", false, false);
  const mod = py5.$d;
  mod.__name__ = new Sk.builtin.str("py5_imported");

  const processArgs = function processArgumentValues(arguments_) {
    const argVals = [];
    for (a of arguments_) {
      if (typeof a !== "undefined") {
        argVals.push(a.v);
      }
    }

    return argVals;
  };

  mod.frame_rate = new Sk.builtin.func(function (fr) {
    mod.pInst.frameRate(fr.v);
  });

  mod.alpha = new Sk.builtin.func(function () {
    const argVals = processArgs(arguments);
    return new Sk.builtin.float_(mod.pInst.alpha(...argVals));
  });

  mod.blue = new Sk.builtin.func(function () {
    const argVals = processArgs(arguments);
    return new Sk.builtin.float_(mod.pInst.blue(...argVals));
  });

  mod.brightness = new Sk.builtin.func(function (r, g, b) {
    const argVals = processArgs(arguments);
    return new Sk.builtin.float_(mod.pInst.brightness(...argVals));
  });

  let colorClass = function ($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function (self) {
      const argVals = processArgs(arguments);
      let data = argVals.filter(function (element) {
        return element !== undefined;
      });
      self.v = mod.pInst.color(...data);
    });
    $loc.__eq__ = new Sk.builtin.func(function (self, other) {
      return new Sk.builtin.bool(
        Sk.misceval.callsimArray(mod.red, [self]).v ===
          Sk.misceval.callsimArray(mod.red, [other]).v &&
          Sk.misceval.callsimArray(mod.green, [self]).v ===
            Sk.misceval.callsimArray(mod.green, [other]).v &&
          Sk.misceval.callsimArray(mod.blue, [self]).v ===
            Sk.misceval.callsimArray(mod.blue, [other]).v,
      );
    });
  };

  mod.color = Sk.misceval.buildClass(mod, colorClass, "Color", []);
  delete mod.Color;

  mod.get = new Sk.builtin.func(function () {
    const argVals = processArgs(arguments);
    const colorArgs = mod.pInst.get(...argVals);
    const colorArgsArray = [
      new Sk.builtin.float_(colorArgs[0]),
      new Sk.builtin.float_(colorArgs[1]),
      new Sk.builtin.float_(colorArgs[2]),
    ];
    return new Sk.misceval.callsimArray(mod.color, colorArgsArray);
  });

  mod.green = new Sk.builtin.func(function () {
    const argVals = processArgs(arguments);
    return new Sk.builtin.float_(mod.pInst.green(...argVals));
  });

  mod.hex_color = new Sk.builtin.func(function () {
    const argVals = processArgs(arguments);
    const hexValue = mod.pInst.color(...argVals).toString("#rrggbb");
    return new Sk.builtin.str(hexValue.toUpperCase());
  });

  mod.hue = new Sk.builtin.func(function () {
    const argVals = processArgs(arguments);
    return new Sk.builtin.float_(mod.pInst.hue(...argVals));
  });

  mod.red = new Sk.builtin.func(function () {
    const argVals = processArgs(arguments);
    return new Sk.builtin.float_(mod.pInst.red(...argVals));
  });

  mod.saturation = new Sk.builtin.func(function () {
    const argVals = processArgs(arguments);
    return new Sk.builtin.float_(mod.pInst.saturation(...argVals));
  });

  runFunction = mod.run;
  mod.run_sketch = new Sk.builtin.func(function () {
    Sk.misceval.callsim(runFunction);
  });
  delete mod.run;

  mod.remap = mod.map;
  delete mod.map;

  delete mod.DEGREES;
  delete mod.RADIANS;
  delete mod.lightness;
  delete mod.erase;
  delete mod.no_erase;
  delete mod.text_style;

  return mod;
};
