import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = (await fetchJSON('../lib/projects.json')) ?? [];
const projectsContainer = document.querySelector('.projects');

// Step 1.6 (Lab 4): show the project count in the page title
const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
  projectsTitle.textContent = `${projects.length} Projects`;
}

// Filter state. Both filters are kept here and applied together, so a
// search and a selected year combine (the Step 5.4 fix).
let query = '';
let selectedIndex = -1; // index of the selected wedge, -1 = none
let selectedYear = null; // year of the selected wedge, null = none

// Step 1: pie chart helpers
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie().value((d) => d.value);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Step 4.3: case-insensitive search across all project fields
function filterByQuery(projectsGiven) {
  return projectsGiven.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

// Step 5.3: keep only projects from the selected year, if any
function filterByYear(projectsGiven) {
  if (selectedYear === null) {
    return projectsGiven;
  }
  return projectsGiven.filter((project) => project.year === selectedYear);
}

// Step 4.4: draw the pie chart and legend for the given projects
function renderPieChart(projectsGiven) {
  // Step 3.1: count projects per year
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // If the search removed the selected year, drop the selection
  selectedIndex = data.findIndex((d) => d.label === selectedYear);
  if (selectedIndex === -1) {
    selectedYear = null;
  }

  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  // Clear the old wedges and legend items before redrawing
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(data[i].label))
      .attr('class', i === selectedIndex ? 'selected' : null)
      .on('click', () => selectWedge(data, i));
  });

  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(d.label)}`)
      .attr('class', i === selectedIndex ? 'legend-item selected' : 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => selectWedge(data, i));
  });
}

// Step 5.2: clicking a wedge selects it; clicking it again deselects it
function selectWedge(data, i) {
  selectedIndex = selectedIndex === i ? -1 : i;
  selectedYear = selectedIndex === -1 ? null : data[selectedIndex].label;
  update();
}

// Redraw everything from the current filters. The pie shows every year
// that matches the search; the project list also applies the year filter.
function update() {
  let searchedProjects = filterByQuery(projects);
  renderPieChart(searchedProjects);
  renderProjects(filterByYear(searchedProjects), projectsContainer, 'h2');
}

// Step 4.2: re-filter as the user types
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  update();
});

// Initial render on page load
update();
