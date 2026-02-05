// initial setup
const svg = d3.select("#map"),
  width = svg.attr("width"),
  height = svg.attr("height"),
  path = d3.geoPath(),
  data = d3.map();

//url to the geojson
const data_url =
  "https://raw.githubusercontent.com/meiliuwu1-ai/meiliuwu1-ai.github.io/main/lab4/glasgow.geojson";

// style of geographic projection
var projection = d3
  .geoMercator()
  .center([-4.25, 55.86])
  .scale(120000)
  .translate([width / 2, height / 2]);

//define colors
const colors = [
  "#67001f",
  "#b2182b",
  "#d6604d",
  "#f4a582",
  "#fddbc7",
  "#d1e5f0",
  "#92c5de",
  "#4393c3",
  "#2166ac",
  "#053061"
];

// Load external data and boot
d3.queue().defer(d3.json, data_url).await(ready);

function ready(error, data) {
  // Draw the map
  glasgow = svg.append("g").attr("class", "map");
  glasgow
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", function (d) {
      return colors[d.properties.Decilev2 - 1];
    });
}

// Legend
var SVG = d3.select("#legend");
var keys = [1,2,3,4,5,6,7,8,9,10];
var size = 20;

SVG.selectAll("mydots")
  .data(keys)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", function (d, i) {
    return i * (size + 5);
  })
  .attr("width", size)
  .attr("height", size)
  .style("fill", function (d) {
    return colors[d - 1];
  });

SVG.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
  .attr("x", size * 1.2)
  .attr("y", function (d, i) {
    return i * (size + 5) + size / 2;
  })
  .text(function (d) {
    return d.toString();
  })
  .attr("text-anchor", "left")
  .style("alignment-baseline", "middle");