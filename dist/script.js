// config map
let config = {
  minZoom: 2,
  maxZoom: 18
};
// magnification with which the map will start
const zoom = 4;
// co-ordinates
const lat = 37.8;
const lng = -96;

// calling map, "map-linked" is your map div's id
const map = L.map("map", config).setView([lat, lng], zoom);

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// If it is an online GeoJSON, we need to fetch it from the source.
const data_url =  "https://raw.githubusercontent.com/meiliuwu1-ai/meiliuwu1-ai.github.io/main/lab4/features.geojson";

fetch(data_url)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
  //All the later code will go into this function
  //Define the classification and color first
    function getColor(d) {
      return d > 1000
        ? "#800026"
        : d > 500
        ? "#BD0026"
        : d > 200
        ? "#E31A1C"
        : d > 100
        ? "#FC4E2A"
        : d > 50
        ? "#FD8D3C"
        : d > 20
        ? "#FEB24C"
        : d > 10
        ? "#FED976"
        : "#FFEDA0";
    }

    //Apply this to the data
    function style(feature) {
      return {
        fillColor: getColor(feature.properties.density), //this is the field to be colored
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7
      };
    }

    //Add this to the map using the style defined above
    L.geoJson(data, { style: style }).addTo(map);

    //Legend code goes below
    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function (map) {
      //using JS to create a div with id "info legend"
      var div = L.DomUtil.create("div", "info legend");
      const classes = [0, 10, 20, 50, 100, 200, 500, 1000];
      var labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < classes.length; i++) {
        //generate the div for the legend key and label using html
        div.innerHTML +=
          '<i style="background:' +
          getColor(classes[i] + 1) +
          '"></i> ' +
          classes[i] +
          (classes[i + 1] ? "&ndash;" + classes[i + 1] + "<br>" : "+");
      }

      return div;
    };

    //Add legend to map
    legend.addTo(map);
  
  });