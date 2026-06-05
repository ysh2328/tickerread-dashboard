class CloudRenderer {
  constructor(primitive) {
    this._primitive = primitive;
  }

  draw(target) {
    target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr }) => {
      const { _chart: chart, _series: series, _senkouA: senkouA, _senkouB: senkouB } = this._primitive;
      if (!chart || !series) return;
      const timeScale = chart.timeScale();
      const mapA = new Map(senkouA.map(d => [d.time, d.value]));
      const mapB = new Map(senkouB.map(d => [d.time, d.value]));
      const times = [...new Set([...mapA.keys(), ...mapB.keys()])]
        .filter(t => mapA.has(t) && mapB.has(t))
        .sort((a, b) => a - b);
      if (times.length < 2) return;

      for (let i = 0; i < times.length - 1; i++) {
        const t1 = times[i];
        const t2 = times[i + 1];
        const aV1 = mapA.get(t1);
        const bV1 = mapB.get(t1);
        const aV2 = mapA.get(t2);
        const bV2 = mapB.get(t2);
        const x1 = timeScale.timeToCoordinate(t1);
        const x2 = timeScale.timeToCoordinate(t2);
        const yA1 = series.priceToCoordinate(aV1);
        const yB1 = series.priceToCoordinate(bV1);
        const yA2 = series.priceToCoordinate(aV2);
        const yB2 = series.priceToCoordinate(bV2);
        if ([x1, x2, yA1, yB1, yA2, yB2].some(value => value == null)) continue;

        const aboveStart = aV1 >= bV1;
        const aboveEnd = aV2 >= bV2;
        const color = (aboveStart && aboveEnd) ? 'rgba(220,38,38,0.2)'
          : (!aboveStart && !aboveEnd) ? 'rgba(37,99,235,0.2)'
            : null;
        if (!color) continue;

        ctx.beginPath();
        ctx.moveTo(x1 * hpr, yA1 * vpr);
        ctx.lineTo(x2 * hpr, yA2 * vpr);
        ctx.lineTo(x2 * hpr, yB2 * vpr);
        ctx.lineTo(x1 * hpr, yB1 * vpr);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
    });
  }
}

class CloudPaneView {
  constructor(primitive) {
    this._renderer = new CloudRenderer(primitive);
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return 'bottom';
  }
}

export class CloudPrimitive {
  constructor(senkouA, senkouB) {
    this._senkouA = senkouA;
    this._senkouB = senkouB;
    this._chart = null;
    this._series = null;
    this._paneViews = [new CloudPaneView(this)];
  }

  attached({ chart, series }) {
    this._chart = chart;
    this._series = series;
  }

  detached() {
    this._chart = null;
    this._series = null;
  }

  updateAllViews() {}

  paneViews() {
    return this._paneViews;
  }
}
