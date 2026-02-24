// -----------------------------
// MAPBOX ACCESS TOKEN
// -----------------------------
mapboxgl.accessToken =
  "pk.eyJ1IjoiMjU2NzI0NHkiLCJhIjoiY21raWRtaGtyMDgxOTNkczd0cWJ0cjFycSJ9.Ij3kV6328AH_pI1GnFiwDg";

// -----------------------------
// MAP INITIALISATION
// -----------------------------
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/2567244y/cmljldjzu000y01se26vd0gfc",
  center: [-2.8, 57.2],
  zoom: 8
});

// -----------------------------
// SPECIES + COLOURS
// -----------------------------
const speciesColours = {
  "Adder": "#a6611a",
  "Common Lizard": "#dfc27d",
  "Slow-worm": "#018571",
  "River Cooter": "#7fbc41",
  "Pond Terrapin": "#003c30"
};

// -----------------------------
// FILTER STATE
// -----------------------------
let currentSpeciesFilter = [
  "in",
  ["get", "Common name"],
  ["literal", Object.keys(speciesColours)]
];

let currentYearFilter = ["!=", ["get", "Year"], "___no_year_filter___"];

// -----------------------------
// SPECIES DENSITY SUMMARY
// -----------------------------
let densityTimeout;

function updateSpeciesDensitySummary() {
  document.getElementById("density-widget").style.display = "block";

  clearTimeout(densityTimeout);

  densityTimeout = setTimeout(() => {
    const features = map.queryRenderedFeatures({ layers: ["reptile"] });
    const counts = {};

    features.forEach(f => {
      const s = f.properties["Common name"];
      counts[s] = (counts[s] || 0) + 1;
    });

    const box = document.getElementById("density-content");

    box.innerHTML = Object.entries(counts)
      .map(([species, count]) => `<p>${species}: ${count}</p>`)
      .join("");
  }, 100);
}

// -----------------------------
// APPLY COMBINED FILTER
// -----------------------------
function applyCombinedFilter() {
  const combined = ["all", currentSpeciesFilter, currentYearFilter];

  map.setFilter("reptile", combined);
  map.setFilter("reptile-heatmap", combined);

  updateSpeciesDensitySummary();
}

// -----------------------------
// SPECIES FILTER LOGIC
// -----------------------------
function updateSpeciesFilter() {
  const checkboxes = document.querySelectorAll("#filters input[type=checkbox]");
  const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.value);

  currentSpeciesFilter =
    selected.length === 0
      ? ["==", ["get", "Common name"], "___no_match___"]
      : ["in", ["get", "Common name"], ["literal", selected]];

  applyCombinedFilter();
}

// -----------------------------
// HOVER PANEL WITH iNaturalist IMAGE
// -----------------------------
map.on("mousemove", async (event) => {
  const reptile = map.queryRenderedFeatures(event.point, { layers: ["reptile"] });
  const panel = document.getElementById("pd");

  if (!reptile.length) {
    panel.innerHTML = `<button id="pd-close" class="panel-close">🦎</button>
      <p>Hover over a reptile record and click to find out more!</p>`;
    attachHoverClose();
    return;
  }

  const props = reptile[0].properties;
  const commonName = props["Common name"];
  const scientificName = props["Scientific name"];

  let imageUrl = null;

  try {
    const response = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}`
    );
    const data = await response.json();

    if (data.results?.length && data.results[0].default_photo) {
      imageUrl = data.results[0].default_photo.medium_url;
    }
  } catch (err) {
    console.error("iNaturalist API error:", err);
  }

  panel.innerHTML = `
    <button id="pd-close" class="panel-close">🦎</button>
    <h3>${scientificName}</h3>
    <p><em>${commonName}</em></p>
    <p>Year recorded: <strong>${props.Year}</strong></p>
    ${
      imageUrl
        ? `<img src="${imageUrl}" alt="${scientificName}" style="width:150px; border-radius:6px; margin-top:8px;">`
        : `<p>No image available</p>`
    }
  `;

  attachHoverClose();
});

function attachHoverClose() {
  const btn = document.getElementById("pd-close");
  if (btn) {
    btn.addEventListener("click", () => {
      document.getElementById("pd").classList.add("hidden");
    });
  }
}

// -----------------------------
// GEOCODER + NAVIGATION
// -----------------------------
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl,
  marker: false,
  flyTo: false,
  placeholder: "Search for places in North East Scotland",
  proximity: { longitude: -2.8, latitude: 57.2 }
});

map.addControl(geocoder, "top-right");
map.addControl(new mapboxgl.NavigationControl(), "top-right");

// -----------------------------
// MAP LOAD
// -----------------------------
map.on("load", () => {
  const reptileLayerId = "reptile";

  map.addSource("reptile", {
    type: "geojson",
    data: "https://raw.githubusercontent.com/2567244YAY/2567244YAY.github.io/main/reptile.geojson"
  });

  // -----------------------------
  // HEATMAP LAYER (HIGHER OPACITY)
  // -----------------------------
  map.addLayer({
    id: "reptile-heatmap",
    type: "heatmap",
    source: "reptile",
    maxzoom: 12,
    paint: {
      "heatmap-weight": [
        "match",
        ["get", "Common name"],
        "Adder", 1.0,
        "Slow-worm", 0.8,
        "Common Lizard", 0.6,
        "River Cooter", 0.4,
        "Pond Terrapin", 0.4,
        0.5
      ],
      "heatmap-intensity": 1.2,
      "heatmap-radius": [
        "interpolate",
        ["exponential", 1.5],
        ["zoom"],
        5, 15,
        8, 30,
        12, 60
      ],
      "heatmap-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5, 0.5,
        10, 1
      ],
   "heatmap-color": [
  "interpolate",
  ["linear"],
  ["heatmap-density"],
  0, "rgba(0,0,0,0)",
        0.2, "#a1dab4",
        0.4, "#41b6c4",
        0.6, "#2c7fb8",
        0.8, "#253494"
]
    }
  }, reptileLayerId);

  map.setLayoutProperty("reptile-heatmap", "visibility", "none");
  
    // -----------------------------
  // CHANGE CURSOR ON REPTILE POINTS
  // -----------------------------
  map.on("mouseenter", "reptile", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "reptile", () => {
    map.getCanvas().style.cursor = "";
  });


  // -----------------------------
  // SELECT ALL / DESELECT ALL
  // -----------------------------
  document.getElementById("select-all").addEventListener("click", () => {
    document.querySelectorAll("#filters input[type=checkbox]").forEach(cb => cb.checked = true);
    updateSpeciesFilter();
  });

  document.getElementById("deselect-all").addEventListener("click", () => {
    document.querySelectorAll("#filters input[type=checkbox]").forEach(cb => cb.checked = false);
    updateSpeciesFilter();
  });

  // -----------------------------
  // HEATMAP TOGGLE
  // -----------------------------
  const heatmapButton = document.getElementById("toggle-heatmap");

  heatmapButton.addEventListener("click", () => {
    const visibility = map.getLayoutProperty("reptile-heatmap", "visibility");

    if (visibility === "none" || !visibility) {
      map.setLayoutProperty("reptile-heatmap", "visibility", "visible");
      heatmapButton.textContent = "Hide Heatmap";
    } else {
      map.setLayoutProperty("reptile-heatmap", "visibility", "none");
      heatmapButton.textContent = "Show Heatmap";
    }

    updateSpeciesDensitySummary();
  });

  // -----------------------------
  // POINT LAYER STYLING
  // -----------------------------
  map.setPaintProperty(reptileLayerId, "circle-color", [
    "match",
    ["get", "Common name"],
    ...Object.entries(speciesColours).flat(),
    "#cccccc"
  ]);

  map.setPaintProperty(reptileLayerId, "circle-radius", 5);

  // -----------------------------
  // BUILD SPECIES FILTER UI
  // -----------------------------
  const filterContainer = document.getElementById("filters");

  for (const [species, colour] of Object.entries(speciesColours)) {
    const wrapper = document.createElement("div");
    wrapper.className = "filter-item";

    const dot = document.createElement("span");
    dot.className = "filter-color";
    dot.style.backgroundColor = colour;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.value = species;
    checkbox.addEventListener("change", updateSpeciesFilter);

    const label = document.createElement("span");
    label.textContent = species;
    label.style.marginLeft = "6px";

    wrapper.append(dot, checkbox, label);
    filterContainer.appendChild(wrapper);
  }

  geocoder.on("result", (e) => {
    map.flyTo({ center: e.result.center, zoom: 12 });
  });

  applyCombinedFilter();
});

// -----------------------------
// YEAR SLIDER
// -----------------------------
const slider = document.getElementById("slider");
const activeYear = document.getElementById("active-year");

slider.addEventListener("input", (e) => {
  const value = parseInt(e.target.value);

  if (value === 2004) {
    activeYear.textContent = "All years";
    currentYearFilter = ["!=", ["get", "Year"], "___no_filter___"];
  } else {
    activeYear.textContent = value;
    currentYearFilter = ["==", ["get", "Year"], value];
  }

  applyCombinedFilter();
});

// -----------------------------
// CLICK POPUP
// -----------------------------
map.on("click", (event) => {
  const features = map.queryRenderedFeatures(event.point, { layers: ["reptile"] });
  if (!features.length) return;

  const f = features[0].properties;

  const popupHTML = `
    <h3>${f["Scientific name"]}</h3>
    <p><strong>Date:</strong> ${f.Day}/${f.Month}/${f.Year}</p>
    <p><strong>Locality:</strong> ${f.Locality}</p>
    <p><strong>Family:</strong> ${f.Family}</p>
    <p><strong>Genus:</strong> ${f.Genus}</p>
    <p><strong>Rights holder:</strong> ${f.rightsHolder}</p>
  `;

  new mapboxgl.Popup({ offset: [0, -15] })
    .setLngLat(features[0].geometry.coordinates)
    .setHTML(popupHTML)
    .addTo(map);
});

// -----------------------------
// PANEL LOGIC
// -----------------------------
const consoleBox = document.getElementById("console");
const consoleClose = document.getElementById("console-close");

const legendToggle = document.getElementById("legend-toggle");
const legendContent = document.getElementById("legend-content");
const legendClose = document.getElementById("legend-close");

const filtersToggle = document.getElementById("filters-toggle");
const filtersPanel = document.getElementById("filters-panel");
const filtersClose = document.getElementById("filters-close");

const wrapper = document.getElementById("legend-filters-wrapper");
const panelsButton = document.getElementById("panels-button");
const overlay = document.getElementById("overlay");

function hideHoverPanel() {
 document.getElementById("pd").classList.add("hidden");
}

consoleClose.addEventListener("click", () => {
  consoleBox.classList.add("closed");
  hideHoverPanel();
  updatePanelsButtonVisibility();
});

legendClose.addEventListener("click", () => {
  legendContent.classList.add("closed");
  legendToggle.classList.remove("open");
  hideHoverPanel();

  if (filtersPanel.classList.contains("closed")) wrapper.classList.add("closed");
  updatePanelsButtonVisibility();
});

filtersClose.addEventListener("click", () => {
  filtersPanel.classList.add("closed");
  filtersToggle.classList.remove("open");
  hideHoverPanel();

  if (legendContent.classList.contains("closed")) wrapper.classList.add("closed");
  updatePanelsButtonVisibility();
});

legendToggle.addEventListener("click", () => {
  legendContent.classList.toggle("closed");
  legendToggle.classList.toggle("open");

  if (!legendContent.classList.contains("closed") || !filtersPanel.classList.contains("closed")) {
    wrapper.classList.remove("closed");
  }

  updatePanelsButtonVisibility();
});

filtersToggle.addEventListener("click", () => {
  filtersPanel.classList.toggle("closed");
  filtersToggle.classList.toggle("open");

  if (!legendContent.classList.contains("closed") || !filtersPanel.classList.contains("closed")) {
    wrapper.classList.remove("closed");
  }

  updatePanelsButtonVisibility();
});

panelsButton.addEventListener("click", () => {
  consoleBox.classList.remove("closed");
  legendContent.classList.remove("closed");
  filtersPanel.classList.remove("closed");
  wrapper.classList.remove("closed");

  legendToggle.classList.add("open");
  filtersToggle.classList.add("open");

  // Restore density widget
  document.getElementById("density-widget").style.display = "block";

  // Restore hover panel
  document.getElementById("pd").classList.remove("hidden");

  updatePanelsButtonVisibility();
});

// -----------------------------
// SPECIES DENSITY WIDGET CLOSE BUTTON
// -----------------------------
document.getElementById("density-close")?.addEventListener("click", () => {
  document.getElementById("density-widget").style.display = "none";
});

// -----------------------------
// HELP BUTTON
// -----------------------------
document.getElementById("help-button").addEventListener("click", () => {
  document.getElementById("welcome-modal").style.display = "flex";
});

// -----------------------------
// WELCOME MODAL CLOSE
// -----------------------------
document.getElementById("welcome-close").addEventListener("click", () => {
  document.getElementById("welcome-modal").style.display = "none";
});