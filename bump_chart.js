// Week 7: load a standalone Vega-Lite JSON with vegaEmbed.
// Week 9: legend highlighting and tooltips are defined in the JSON.
// Week 9/10: params.bind range + transform.filter controls the time window.
var vg_3 = 'ghg_bump_chart.vg.json';
var bumpView;

function updateWindowLabel(name, start) {
  document.getElementById('bump-window-label').innerText = start + '–' + (start + 10);
  updateChartInsight('bump', start);
}

function resizeBumpChart() {
  bumpView.resize().runAsync().catch(console.error);
}

vegaEmbed('#bump3', vg_3, {renderer: 'svg'}).then(function(result) {
  bumpView = result.view;
  // JavaScript only updates the HTML label and responsive chart size.
  bumpView.addSignalListener('window_start', updateWindowLabel);
  updateWindowLabel('window_start', bumpView.signal('window_start'));
  window.addEventListener('resize', resizeBumpChart);
  var slider = document.querySelector('#bump3 input[type="range"]');
  slider.setAttribute('aria-label', 'Start year of the ten-year ranking window');
}).catch(console.error);
