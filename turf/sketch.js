// Create a new Mappa instance using Leaflet.
const mappa = new Mappa('Leaflet');

let myMap;

// Lets put all our map options in a single object
const options = {
  lat: 50.371389,
  lng: -4.142222,
  zoom: 14,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

let userMarker;
let targetMarker;
let mapLoaded;

let zone;

function preload() {
  // This parses the JSON text file into a Javascript Object
  zone = loadJSON("data/zone.geo.json");
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas, onMapLoaded);
  
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(gotPosition);
  }
}

function gotPosition(position) {

  // Unlikely but we might get position before map is loaded!
  // That would cause an error if we tried to create the marker
  if (!mapLoaded) return;

  if (!userMarker) {
    // Create the marker
    userMarker = L.circleMarker([position.coords.latitude, position.coords.longitude]).addTo(myMap.map);
  }
  else {
    // Move the marker
    userMarker.setLatLng([position.coords.latitude, position.coords.longitude]);
  }
  
  // TURF SPATIAL ANALYSIS : can do more complex calculations
  let coords = L.GeoJSON.latLngToCoords(userMarker.getLatLng());
  let point = turf.point(coords);
  let inside = turf.pointsWithinPolygon(point, zone.features[0]);
  let numberOfPointsInPolygon = inside.features.length;
  
  print(numberOfPointsInPolygon); // What could we do with this...?
  

  // LEAFLET SPATIAL ANALYSIS : only supports simple calculations
  let dist = myMap.map.distance(userMarker.getLatLng(),
                            targetMarker.getLatLng());
  //print("Distance: "+dist);

  // Are we within 5m of the target?
  if (dist < 5) {
    userMarker.setStyle({
      color: '#ff0000'
    });
  }
  else {
    userMarker.setStyle({
      color: '#3388ff'
    });
  }
  
  // JS ternary operator can neatly implement the same condition...
  //
  // // Are we within 5m of the target?
  // userMarker.setStyle({
  //     color: (dist < 5) ? '#ff0000' : '#3388ff'
  // });
}

function onMapLoaded() {
  mapLoaded = true;
  
  L.geoJSON(zone).addTo(myMap.map);
  
  targetMarker = L.marker([50.37476543718608, -4.139024019241333]).addTo(myMap.map);
}

function draw() {
  //
}