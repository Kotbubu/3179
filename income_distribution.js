// The Vega-Lite select binding updates the highlighted point and label.
Promise.all([
  vegaEmbed('#income-jitter-chart', 'ghg_income_and_inequality.vg.json?v=income-map-notes-20261026', {renderer:'svg', actions:false}),
  fetch('data/ghg_income_distribution_2025.csv').then(response => {
    if (!response.ok) throw new Error('Country data could not load');
    return response.text();
  }).then(text => vega.read(text, {type:'csv', parse:'auto'}))
]).then(([result, rows]) => {
  const bindings = document.querySelector('#income-jitter-chart .vega-bindings');
  if (bindings) document.getElementById('income-country-control').appendChild(bindings);
  const select = document.querySelector('#income-country-control select');
  if (select) select.setAttribute('aria-label', 'Highlight a country in the income distribution');
  function updateSummary(_name, code) {
    const country = rows.find(row => row.iso_code === code);
    if (!country) return;
    const peers = rows.filter(row => row.income_group === country.income_group)
      .map(row => Number(row.ghg_per_capita)).sort((a,b) => a-b);
    const middle = Math.floor(peers.length / 2);
    const median = peers.length % 2 ? peers[middle] : (peers[middle-1] + peers[middle]) / 2;
    document.getElementById('income-selected-summary').textContent =
      country.country;
    document.getElementById('income-country-value').textContent = Number(country.ghg_per_capita).toFixed(1);
    document.getElementById('income-median-value').textContent = median.toFixed(1);
    const relation = Number(country.ghg_per_capita) >= median ? 'above' : 'below';
    document.getElementById('income-selected-comparison').textContent =
      country.income_group;
    document.getElementById('income-relation').textContent = country.country + ' is ' + relation + ' its income-group median.';
  }
  result.view.addSignalListener('selected_country', updateSummary);
  updateSummary(null, result.view.signal('selected_country'));
}).catch(console.error);
