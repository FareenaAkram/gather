import { useEffect, useRef } from 'react';
import classes from './StyledMap.module.css';

// A Leaflet map in gather's style: warm tiles and a custom pin showing the meetup's
// photo in the same blob shape as the home page hero.
//
// Leaflet needs `window`, which doesn't exist while Next.js renders on the server,
// so we only load it inside useEffect, which runs in the browser.
function StyledMap(props) {
  const containerRef = useRef();
  const { lat, lng, image, zoom = 15 } = props;

  useEffect(() => {
    let map;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled) {
        return;
      }

      map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom,
        zoomControl: false,
        scrollWheelZoom: false, // don't hijack the page scroll
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Build the pin as real DOM elements rather than an HTML string, so a meetup
      // title or image URL can never inject markup into the page.
      const pin = document.createElement('div');
      pin.className = classes.pin;
      const pulse = document.createElement('span');
      pulse.className = classes.pulse;
      const photo = document.createElement('div');
      photo.className = classes.photo;
      if (image) {
        const img = document.createElement('img');
        img.src = image;
        img.alt = '';
        photo.appendChild(img);
      }
      pin.append(pulse, photo);

      L.marker([lat, lng], {
        icon: L.divIcon({
          html: pin,
          className: classes.marker,
          iconSize: [64, 72],
          iconAnchor: [32, 72], // the tip of the pin sits on the exact spot
        }),
        keyboard: false,
      }).addTo(map);
    });

    // remove the old map when the location changes or the component goes away
    return () => {
      cancelled = true;
      if (map) {
        map.remove();
      }
    };
  }, [lat, lng, image, zoom]);

  return <div ref={containerRef} className={`${classes.map} ${props.className || ''}`} />;
}

export default StyledMap;
