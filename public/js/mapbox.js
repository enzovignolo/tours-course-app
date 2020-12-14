export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZW56b2V2aWdub2xvIiwiYSI6ImNraWhwdGNyYjF4dDQydHBvMWM4aXZ1N3EifQ.a0uPAi0laodlmzEdfMIIqA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/enzoevignolo/ckihq2za16s5v19qrru7pg9gp',
    scrollZoom: false
  });

  var bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    console.log(typeof loc.coordinates[0]);
    // Creates elements that will be assigned to the map as markers
    const el = document.createElement('div');
    el.className = 'marker';
    // Assign the elements to new markers created
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      //Set the locations where to place the markers
      .setLngLat(loc.coordinates)
      // Indicates wich map to assign the markers
      .addTo(map);
    // Extends the limits of the maps to the fit the coordinates
    bounds.extend(loc.coordinates);
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>${loc.day}:${loc.description}</p>`)
      .addTo(map);
  });

  // Apply the limits defined before to the map with some options for padding

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100
    }
  });

  // Add POPUPS signs with information about location
};
