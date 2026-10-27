// One parameter links the HTML grid controls to the Vega-Lite map.
Promise.all([
  vegaEmbed('#australia-bin-chart', 'ghg_australia_hotspots.vg.json?v=offshore-city-labels-20261026', {
    renderer: 'svg', actions: false
  }),
  fetch('data/ghg_australia_hotspots_summary.json').then(response => {
    if (!response.ok) throw new Error('Unable to load map summary');
    return response.json();
  })
]).then(([chart, summary]) => {
  const controls = document.querySelectorAll('input[name="australia-grid"]');
  controls.forEach(control => control.addEventListener('change', async event => {
    const kilometres = Number(event.target.value);
    await chart.view.signal('Grid_km', kilometres).runAsync();
    document.getElementById('bin-share-value').textContent =
      Math.round(summary[kilometres].top_tenth_share * 100) + '%';
  }));
}).catch(error => {
  console.error(error);
  document.getElementById('australia-bin-chart').textContent =
    'The map could not load. Please open this page through your local server.';
});
