export const config = {
  renderChart: (chart) => { throw new Error("The config.renderChart function has not been set for pygal."); },
  availableWidth: 400,
  availableHeight: 300,
};

const COLORS = [
  [255, 89, 149],  [182, 227, 84],  [254, 237, 108], [140, 237, 255],
  [158, 111, 254], [137, 156, 161], [248, 248, 242], [191, 70, 70],
  [81, 96, 131],   [249, 38, 114],  [130, 180, 20],  [253, 151, 31],
  [86, 194, 214],  [128, 131, 132], [140, 84, 254],  [70, 84, 87]
];

const some = (val) => typeof val !== "undefined";
const toJs = (val) => val?.toJs ? val.toJs() : val;

class Chart {
  constructor({ title, width, height, range, include_x_axis, x_title, y_title, title_font_size, fill, stroke, x_labels } = {}) {
    const options = {};
    if (some(title)) options.title = toJs(title);
    if (some(width)) options.width = toJs(width);
    if (some(height)) options.height = toJs(height);
    if (some(range)) options.range = {
      min: toJs(range)[0],
      max: toJs(range)[1],
    };
    if (some(include_x_axis)) options.include_x_axis = toJs(include_x_axis);
    if (some(x_title)) options.x_title = toJs(x_title);
    if (some(y_title)) options.y_title = toJs(y_title);
    if (some(title_font_size)) options.title_font_size = toJs(title_font_size);
    if (some(fill)) options.fill = toJs(fill);
    if (some(stroke)) options.stroke = toJs(stroke);
    if (some(x_labels)) options.x_labels = toJs(x_labels);

    this._options = options;
    this._data = [];
  }

  add(label, values) {
    const data = [...toJs(values)].map(v => v || 0);

    this._data.unshift({
      name: toJs(label),
      color: this.#rgba(COLORS[this._data.length % COLORS.length], 0.75),
      data: data,
      marker: {
        symbol: 'circle'
      },
      stack: 1
    });

    return '';
  }

  render() {
    const options = this._options;
    const title_style = {
      color: '#FFFFFF'
    };
    if (options.title_font_size) {
      title_style['font-size'] = options.title_font_size + 'px';
    }
    const xPlotLines = [];
    const yPlotLines = [];

    if (options.range) {
      yPlotLines.push({
        value: options.range.min,
        width: 1,
        color: '#FFFFFF'
      });
    }

    const defaultWidth  = config.availableWidth;
    const defaultHeight = Math.min(defaultWidth, config.availableHeight);

    let chart = {
      chart: {
        width : options.width  || defaultWidth,
        height: options.height || defaultHeight,
        backgroundColor: '#000'
      },
      credits: {
        enabled: false
      },
      title: {
          text: options.title,
          style : title_style
      },
      xAxis: {
          title: {
              text: options.x_title || null,
              style : title_style,
              margin: 20
          },
          categories: options.x_labels,
          labels : {
            enabled: options.x_labels ? true : false
          },
          tickLength: 0
      },
      yAxis: {
          startOnTick: false,
          title: {
              text: options.y_title || null,
              style : title_style,
              margin: 20
          },
          plotLines: yPlotLines,
          min : options.include_x_axis
            ? 0
            : options.range
              ? options.range.min
              : null,
          max : options.range ? options.range.max : null,
          gridLineDashStyle : 'ShortDash',
          gridLineColor: '#DDD',
          tickLength: 0
      },
      legend: {
          itemStyle : {
            color : '#FFFFFF'
          },
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          y: 50,
          borderWidth: 0
      },
      labels : {
        style : {
          color: '#FFFFFF'
        }
      },
      series: this._data
    };

    for(let i = 0; i < chart.series.length; i++) {
      chart.series[i].legendIndex = chart.series.length - i;
      chart.series[i].index = chart.series.length - i;
    }

    if (this.renderer) {
      chart = this.renderer(options, chart);
    }

    config.renderChart(chart);

    return '';
  }

  get title()              { return this._options.title; }
  get width()              { return this._options.width; }
  get height()             { return this._options.height; }
  get range()              { return this._options.range; }
  get include_x_axis()     { return this._options.include_x_axis; }
  get x_title()            { return this._options.x_title; }
  get y_title()            { return this._options.y_title; }
  get title_font_size()    { return this._options.title_font_size; }
  get fill()               { return this._options.fill; }
  get stroke()             { return this._options.stroke; }
  get x_labels()           { return this._options.x_labels; }

  set title(val)           { this._options.title = toJs(val); }
  set width(val)           { this._options.width = toJs(val); }
  set height(val)          { this._options.height = toJs(val); }
  set range(val)           { this._options.range = toJs(val); }
  set include_x_axis(val)  { this._options.include_x_axis = toJs(val); }
  set x_title(val)         { this._options.x_title = toJs(val); }
  set y_title(val)         { this._options.y_title = toJs(val); }
  set title_font_size(val) { this._options.title_font_size = toJs(val); }
  set fill(val)            { this._options.fill = toJs(val); }
  set stroke(val)          { this._options.stroke = toJs(val); }
  set x_labels(val)        { this._options.x_labels = toJs(val); }

  #rgba(rgb, a) {
    return 'rgba(' + rgb.join(',') + ',' + a + ')';
  }
}

class _Line extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = toJs(options.fill) ? 'area' : 'line';
      return chart;
    };
  }
}
export const Line = (...args) => new _Line(...args);

class _StackedLine extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = toJs(options.fill) ? 'area' : 'line';
      chart.plotOptions = {
        area : {
          stacking : 'percent'
        },
        series : {
          stacking : 'percent'
        }
      };
      return chart;
    };
  }
}
export const StackedLine = (...args) => new _StackedLine(...args);

class _Bar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'column';
      return chart;
    };
  }
}
export const Bar = (...args) => new _Bar(...args);

class _StackedBar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'column';
      chart.plotOptions = {
        column : {
          stacking: 'percent'
        }
      };
      return chart;
    };
  }
}
export const StackedBar = (...args) => new _StackedBar(...args);

class _HorizontalBar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'bar';
      return chart;
    };
  }
}
export const HorizontalBar = (...args) => new _HorizontalBar(...args);

class _StackedHorizontalBar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'bar';
      chart.plotOptions = {
        bar : {
          stacking: 'percent'
        }
      };
      return chart;
    };
  }
}
export const StackedHorizontalBar = (...args) => new _StackedHorizontalBar(...args);

class _XY extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      if (toJs(options.stroke) === false) {
        chart.chart.type = 'scatter'
      }
      else {
        chart.chart.type = toJs(options.fill) ? 'area' : 'line';
      }
      chart.xAxis.labels.enabled = true;

      return chart;
    };
  }
}
export const XY = (...args) => new _XY(...args);

class _Radar extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.polar = true;
      chart.chart.type  = 'line';
      chart.xAxis = {
        categories: toJs(options.x_labels),
        tickmarkPlacement: 'on',
        lineWidth: 0
      }
      chart.yAxis = {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        gridLineDashStyle : 'ShortDash',
        gridLineColor: '#DDD'
      }
      for(let i = 0; i < chart.series.length; i++) {
        chart.series[i].pointPlacement = 'on';
      }

      return chart;
    };
  }
}
export const Radar = (...args) => new _Radar(...args);

class _Pie extends Chart {
  constructor(...args) {
    super(...args);
    this.renderer = (options, chart) => {
      chart.chart.type = 'pie';
      const slices       = [];
      const breakdown    = [];
      const useBreakdown = false;
      for(let i = 0; i < chart.series.length; i++) {
        const slice = chart.series[i];
        if (slice.data.length === 1) {
          slices.unshift({
            name        : slice.name,
            color       : slice.color,
            borderColor : slice.color,
            legendIndex : slice.legendIndex,
            y           : slice.data[0]
          });
          breakdown.unshift({
            name  : slice.name,
            color : slice.color,
            borderColor : slice.color,
            y     : slice.data[0]
          });
        }
        else {
          useBreakdown = true;
          const sum = 0;
          const maxDecimal = 0;
          for(let j = 0; j < slice.data.length; j++) {
            const parts = slice.data[j].toString().split('.');
            maxDecimal = Math.max(maxDecimal, parts[1] ? parts[1].length : 0);
            sum += slice.data[j];
            breakdown.unshift({
              name: slice.name,
              color: 'rgba(0,0,0,0)',
              borderColor : slice.color,
              y: slice.data[j]
            });
          }
          slices.unshift({
            name        : slice.name,
            color       : slice.color,
            borderColor : slice.color,
            legendIndex : slice.legendIndex,
            y           : parseFloat(sum.toFixed(maxDecimal))
          });
        }
      }
      chart.tooltip = {
        formatter: function() {
            return this.key + ': ' + this.y;
          }
      };
      chart.plotOptions = {
        pie: {
          allowPointSelect: !useBreakdown,
          cursor: useBreakdown ? null : 'pointer',
          shadow: false,
          center: ['50%', '50%'],
          dataLabels: {
            enabled: false
          }
        }
      };
      chart.series = [{
        name: ' ',
        data: slices,
        showInLegend: true
      }];
      if (useBreakdown) {
        chart.series.push({
          name: ' ',
          data: breakdown,
          innerSize: '90%',
          showInLegend: false
        });
      }
      return chart;
    };
  }
}
export const Pie = (...args) => new _Pie(...args);
