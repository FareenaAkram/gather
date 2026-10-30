import { useEffect, useRef, useState } from 'react';
import StyledMap from '../ui/StyledMap';
import classes from './AddressInput.module.css';

// Photon is a free OpenStreetMap search built for search-as-you-type
// (Nominatim, which we use on the server, doesn't allow that).
// lang=en: English names, otherwise you get local scripts (e.g. Urdu in Pakistan).
// lat/lon: places near that point come first, but others still show up.
function searchUrl(text, near) {
  let url = 'https://photon.komoot.io/api/?limit=8&lang=en&q=' + encodeURIComponent(text);
  if (near) {
    url += `&lat=${near.lat}&lon=${near.lng}&location_bias_scale=0.3`;
  }
  return url;
}

// "Liberty Market, Noor Jahan Road, Gulberg, Lahore, Punjab, Pakistan" from Photon's pieces
function placeLabel(properties) {
  const street = [properties.street, properties.housenumber].filter(Boolean).join(' ');
  const parts = [
    properties.name,
    street,
    properties.district,
    properties.city || properties.county,
    properties.state,
    properties.country,
  ];
  return parts.filter((part, index) => part && parts.indexOf(part) === index).join(', ');
}

// Photon often returns the same place several times (e.g. a market as a street and
// as an area). Keep the first of each label, up to 5.
function uniqueByLabel(places) {
  const seen = new Set();
  return places
    .filter((place) => {
      if (seen.has(place.label)) {
        return false;
      }
      seen.add(place.label);
      return true;
    })
    .slice(0, 5);
}

// Address field with place suggestions and a map preview. Typing freely still works;
// picking a suggestion also gives us exact coordinates for the map.
function AddressInput(props) {
  const [text, setText] = useState(props.defaultValue || '');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState(props.defaultLocation || null);
  const skipNextSearch = useRef(false);
  const isFocused = useRef(false);

  // Search 350ms after the person stops typing, not on every key press, and ignore
  // answers that arrive after they've already typed something newer.
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    let ignore = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(searchUrl(text, props.near));
        const data = await response.json();
        if (!ignore) {
          setSuggestions(
            uniqueByLabel(
              data.features.map((feature) => ({
                label: placeLabel(feature.properties),
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0],
              }))
            )
          );
          setActiveIndex(-1);
          // only pop the list open if they're still in the field
          setIsOpen(isFocused.current);
        }
      } catch (err) {
        // suggestions are a bonus; if the search fails, plain typing still works
      }
    }, 350);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [text, props.near]);

  function changeHandler(event) {
    setText(event.target.value);
    // typed something new, so the old coordinates no longer match
    setLocation(null);
    props.onChange(event.target.value, null);
  }

  function selectHandler(place) {
    skipNextSearch.current = true; // don't search again for the text we just filled in
    setText(place.label);
    setLocation({ lat: place.lat, lng: place.lng });
    setSuggestions([]);
    setIsOpen(false);
    props.onChange(place.label, { lat: place.lat, lng: place.lng });
  }

  function keyDownHandler(event) {
    if (!isOpen || suggestions.length === 0) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault(); // pick the place instead of submitting the form
      selectHandler(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className={classes.wrapper}>
      <input
        type='text'
        required
        id={props.id}
        value={text}
        onChange={changeHandler}
        onKeyDown={keyDownHandler}
        onFocus={() => {
          isFocused.current = true;
          setIsOpen(suggestions.length > 0);
        }}
        onBlur={() => {
          isFocused.current = false;
          setIsOpen(false);
        }}
        placeholder='Search for a place or address'
        autoComplete='off'
        role='combobox'
        aria-expanded={isOpen}
        aria-controls={`${props.id}-suggestions`}
        aria-autocomplete='list'
      />

      {isOpen && suggestions.length > 0 && (
        <ul id={`${props.id}-suggestions`} className={classes.list} role='listbox'>
          {suggestions.map((place, index) => (
            <li
              key={`${place.lat},${place.lng},${index}`}
              role='option'
              aria-selected={index === activeIndex}
              className={index === activeIndex ? classes.active : ''}
              // mousedown instead of click: it fires before the input's blur closes the list
              onMouseDown={(event) => {
                event.preventDefault();
                selectHandler(place);
              }}
            >
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z' />
                <circle cx='12' cy='9.5' r='2.5' />
              </svg>
              {place.label}
            </li>
          ))}
        </ul>
      )}

      {location && (
        <div className={classes.preview}>
          <StyledMap lat={location.lat} lng={location.lng} image={props.image} zoom={15} />
        </div>
      )}
    </div>
  );
}

export default AddressInput;
