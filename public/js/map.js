  const apiKey = mapToken;

  
  const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
    center: listing.geometry.coordinates,
    zoom: 9,
  });


  const marker = new maplibregl.Marker({ color: 'red' })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new maplibregl.Popup({ offset: 25 })
      .setHTML(`
        <div class="popup-card">
          <h6 class="popup-title">${listing.location}</h6>
          <p class="popup-text">Exact location will be provided after booking.</p>
        </div>
      `)
  )
  .addTo(map);

// Zoom/rotation controls
map.addControl(new maplibregl.NavigationControl(), 'top-right');