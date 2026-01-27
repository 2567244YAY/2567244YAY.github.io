// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken = "pk.eyJ1IjoiMjU2NzI0NHkiLCJhIjoiY21raWRtaGtyMDgxOTNkczd0cWJ0cjFycSJ9.Ij3kV6328AH_pI1GnFiwDg";

const map = new mapboxgl.Map({
 container: 'map', // container element id
 style: 'mapbox://styles/mapbox/light-v10',
 center: [-6.977086, 54.554936],
 zoom: 14
});

const data_url =
"https://api.mapbox.com/datasets/v1/2567244y/cmkwtyyj90f3e1vmo652nqtzv/features?access_token=pk.eyJ1IjoiMjU2NzI0NHkiLCJhIjoiY21raWRtaGtyMDgxOTNkczd0cWJ0cjFycSJ9.Ij3kV6328AH_pI1GnFiwDg";

map.on('load', () => {
 map.addLayer({
  id: 'crimes',
  type: 'circle',
  source: {
  type: 'geojson',
  data: data_url
  },
 paint: {
  'circle-radius': 10,
  'circle-color': '#eb4d4b',
  'circle-opacity': 0.9
 }
 });

  // Initialise the map filter    
 filterMonth = ['==', ['get', 'Month'], '2024-12']
 filterType = ['!=', ['get', 'Crime type'], 'placeholder'] 
  
   map.setFilter('crimes', ['all', filterMonth, filterType])
  
//Slider interaction code goes below
document.getElementById('slider').addEventListener('input', (event) => {

  //Get the month value from the slider
 const month = parseInt(event.target.value);
 
  // get the correct format for the data
 formatted_month = '2025-' + ("0" + month).slice(-2)
 
  //Create a filter
 filterMonth = ['==', ['get', 'Month'], formatted_month]
 
  //set the map filter
   // map.setFilter('crimes', ['all', filterMonth]);
 map.setFilter('crimes', ['all', filterMonth, filterType]);
 
  // update text in the UI
 document.getElementById('active-month').innerText = month;
});
 
 //Radio button interaction code goes below
 document.getElementById('filters').addEventListener('change', (event) => {
   const type = event.target.value;
    console.log(type);
    // update the map filter
   if (type == 'all') {
   filterType = ['!=', ['get', 'Crime type'], 'placeholder'];
   } else if (type == 'Bicycle theft') {
   filterType = ['==', ['get', 'Crime type'], 'Bicycle theft'];
   } else if (type == 'Public order') {
   filterType = ['==', ['get', 'Crime type'], 'Public order'];
   } else if (type == 'Robbery') {
   filterType = ['==', ['get', 'Crime type'], 'Robbery'];
   } else if (type == 'Theft from the person') {
   filterType = ['==', ['get', 'Crime type'], 'Theft from the person'];
   } else {
   }
   // map.setFilter('crimes', ['all', filterMonth, filterType]);
 map.setFilter('crimes', ['all', filterMonth, filterType]);
});
  
 });