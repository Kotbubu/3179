// Precomputed observations use the same data as the displayed charts.
var insightYears = {map: 2025, bump: 1970};
var chartInsights;

function updateChartInsight(chart, year) {
  insightYears[chart] = year;
  if (chartInsights) {
    var element = document.getElementById(chart + '-insight');
    var text = chartInsights[chart][String(year)];
    var pattern = /\b\d+(?:\.\d+)? times\b|global rank \d+ to \d+|largest rise|leads the countries shown|higher rank|stable rankings/g;
    var lastIndex = 0;
    var match;
    element.textContent = '';
    while ((match = pattern.exec(text)) !== null) {
      element.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      var emphasis = document.createElement('strong');
      emphasis.textContent = match[0];
      element.appendChild(emphasis);
      lastIndex = pattern.lastIndex;
    }
    element.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

fetch('data/ghg_annotations.json').then(function(response) {
  return response.json();
}).then(function(data) {
  chartInsights = data;
  updateChartInsight('map', insightYears.map);
  updateChartInsight('bump', insightYears.bump);
}).catch(console.error);
