/*This is inspired by: https://pitchinteractiveinc.github.io/tilegrams/*/

var w = 1800;
var h = 1000;

var svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

//URL to the json file
var tpjson_us =
  "https://raw.githubusercontent.com/meiliuwu1-ai/meiliuwu1-ai.github.io/main/lab4/us_tilegram.json";

//Eveything goes into this json function.
d3.json(tpjson_us, function showData(error, tilegram) {
  var tiles = topojson.feature(tilegram, tilegram.objects.tiles);

  //some transformation for the map
  var transform = d3.geoTransform({
    point: function (x, y) {
      this.stream.point(x, -y);
    }
  });

  var path = d3.geoPath().projection(transform);

  //center the map
  var g = svg.append("g").attr("transform", "translate(0," + 600 + ")");

  //Just to use a categorical color for the map
  var color = d3.schemeCategory20;

  // Build list of state codes
  var stateCodes = [];
  tilegram.objects.tiles.geometries.forEach(function (geometry) {
    if (stateCodes.indexOf(geometry.properties.name) === -1) {
      stateCodes.push(geometry.properties.name);
    }
  });

  // Build merged geometry for each state
  var stateBorders = stateCodes.map(function (code) {
    return topojson.merge(
      tilegram,
      tilegram.objects.tiles.geometries.filter(function (geometry) {
        return geometry.properties.name === code;
      })
    );
  });

  // Draw state borders
  // Styles for the state borders
  g.selectAll("path.border")
    .data(stateBorders)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "border")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5);

  //mouse over function
  let mouseOver = function (d, i) {
    console.log(i);
    //Style and transition when hovering, change the duration parameter to see what will happen.
    d3.selectAll(".State").transition().duration(200).style("opacity", 0.3);
    d3.select(this).transition().duration(200).style("opacity", 1);

    //Set the html to the state_name div as the name of the state
    d3.select("#state_name").html(stateCodes[i]);
  };

  //mouse out function
  let mouseOut = function (d) {
    d3.selectAll(".State").transition().duration(200).style("opacity", 1);
    d3.select("#state_name").html("HOVER ON A STATE");
  };

  //Tile files
  //Each tile is the little hexagon
  g.selectAll(".tiles")
    .data(tiles.features) //define the data sources for the hexagons
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "white") //hex borders
    .attr("stroke-width", 0.2) //hex width
    .attr("class", function (d) {
      return "State";
    }) // the state name is used to group the hexagons
    .style("fill", () => color[Math.floor(20 * Math.random())]) //Choose a random color for the states
    .on("mouseover", mouseOver) //add the mouse over interaction
    .on("mouseout", mouseOut); //add the mouse out interaction
});