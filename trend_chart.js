// Week 7: embed a standalone Vega-Lite specification.
// Week 9: params + legend binding + conditional opacity handle highlighting.
var vg_2 = 'ghg_trend_line.vg.json';
var trendView;

function resizeTrendChart() {
  trendView.resize().runAsync().catch(console.error);
}

vegaEmbed('#trend2', vg_2, {renderer: 'svg'}).then(function(result) {
  trendView = result.view;
  window.addEventListener('resize', resizeTrendChart);
}).catch(console.error);
