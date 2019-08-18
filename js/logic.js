// API for earthquake and tectonic data
var earthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// Makes the API call for earthquakeData
d3.json(earthquakeData, function(data) {

  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    // Creates the earthquake layer for the map with popup 
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><h3>Magnitude: " + feature.properties.mag + "</h3><h3>Date: " + new Date(feature.properties.time) + "</h3>");
    },
    
    /* I referenced this StackOverflow entry: https://stackoverflow.com/questions/24343341/leaflet-js-which-method-to-be-used-for-adding-markers-from-geojson */
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 0.5,
        color: "#E0FEF0",
        stroke: true,
        weight: 1.0
    })}}
    );
  
  // Adding earthquakes layer 
  createMap(earthquakes);
}


function createMap(earthquakes) {
    // Creates the outdoor and satellite layers
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    });
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    });
  
    // baseMaps
    var baseMaps = {
      "Light": light,
      "Satellite": satellite,
    };

    // Tectonic plate layer
    var tectonicPlates = new L.LayerGroup();

    // Overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Creates map and default view + layers
    var myMap = L.map("map", {
      center: [40, 0],
      zoom: 2.0,
      layers: [light, earthquakes, tectonicPlates]
    }); 

    // Add fault lines to tectonic layer
    d3.json(tectonicData, function(plateData) {
      L.geoJson(plateData, {
        color: "RED",
        weight: 1
      })
      .addTo(tectonicPlates);
  });
  
    // Layer control
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


  /* I adopted ideas from TomBerton, Leaflet documentation, and StackOverflow */
  //Legend
  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // loop through our density 
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}
    return div;
  };
  legend.addTo(myMap);
}

  // Defines colors 
  function getColor(d){
    return d > 5 ? "Red":
    d  > 4 ? "Orange":
    d > 3 ? "Yellow":
    d > 2 ? "Green":
    d > 1 ? "Blue":
             "Purple";
  }

  // Multiplies maginutde by a factor of 50,000
  function getRadius(value){
    return value*50000
  }
