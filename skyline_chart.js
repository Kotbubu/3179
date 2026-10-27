vegaEmbed('#income-skyline-chart', 'ghg_income_skyline.vg.json?v=manrope-20261025', {renderer:'svg',actions:false}).then(function(result) {
  connectChartLegend('income-skyline-chart', result.view, 'skyline_group', false);
  window.addEventListener('resize', function(){ result.view.resize().runAsync().catch(console.error); });
}).catch(console.error);
