import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Input, List, Card } from 'antd';
import { setInputValue, setUserLocation, setSuggestions, clearInputValue, addSearchResult } from '../redux/searchSlice'; // Adjust path as needed

const { Search } = Input;

const mapContainerStyle = {
  height: "100vh",
  width: "100%",
  position: "relative"
};

const defaultCenter = {
  lat: -3.745,
  lng: -38.523
};

// Mock data for fallback option
const mockData = [
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
  { name: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 }
];

const GoogleMapComponent = () => {
  const dispatch = useDispatch();
  const inputValue = useSelector((state) => state.search.inputValue);
  const userLocation = useSelector((state) => state.search.userLocation);
  const suggestions = useSelector((state) => state.search.suggestions);
  const searchResults = useSelector((state) => state.search.searchResults);
  const [loaded, setLoaded] = useState(false);
  const autocompleteRef = useRef(null);
  const isPlacesApiAvailable = useRef(true);

  // Load and store search results
  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem('searchResults')) || [];
    const uniqueResults = Array.from(new Map(savedResults.map(item => [item.name, item])).values());
    uniqueResults.forEach(result => dispatch(addSearchResult(result)));
  }, [dispatch]);

  useEffect(() => {
    const uniqueResults = Array.from(new Map(searchResults.map(item => [item.name, item])).values());
    localStorage.setItem('searchResults', JSON.stringify(uniqueResults));
  }, [searchResults]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch(setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
          setLoaded(true);
        },
        (error) => {
          console.error(error);
          dispatch(setUserLocation(defaultCenter));
          setLoaded(true);
        }
      );
    } else {
      dispatch(setUserLocation(defaultCenter));
      setLoaded(true);
    }
  }, [dispatch]);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        name: place.name
      };
      const existingResult = searchResults.find(result => result.name === location.name);
      if (!existingResult) {
        dispatch(setUserLocation(location));
        dispatch(setInputValue(place.name));
        dispatch(addSearchResult(location));
      }
    }
  };

  const handleInputChange = (value) => {
    dispatch(setInputValue(value));
    if (!isPlacesApiAvailable.current) {
      const filteredSuggestions = mockData.filter(location =>
        location.name.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setSuggestions(filteredSuggestions));
    }
  };

  const handleSuggestionClick = (location) => {
    dispatch(setUserLocation({
      lat: location.lat,
      lng: location.lng
    }));
    dispatch(setInputValue(location.name));
    dispatch(setSuggestions([]));
    const existingResult = searchResults.find(result => result.name === location.name);
    if (!existingResult) {
      dispatch(addSearchResult(location));
    }
  };

  const handleClearInput = () => {
    dispatch(clearInputValue());
    autocompleteRef.current.set('place', null);
  };

  useEffect(() => {
    if (window.google && window.google.maps && loaded) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById('autocomplete-input')
      );

      autocompleteRef.current = autocomplete;
      autocomplete.addListener('place_changed', handlePlaceSelect);
    } else {
      isPlacesApiAvailable.current = false;
    }
  }, [loaded]);

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Card
        title="Search Location"
        style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          maxWidth: '600px',
          zIndex: 10
        }}
      >
        <Search
          id="autocomplete-input"
          placeholder="Enter a location"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          allowClear
          onSearch={handlePlaceSelect}
          style={{ marginBottom: '10px' }}
          onClear={handleClearInput}
        />
        {suggestions.length > 0 && (
          <List
            bordered
            dataSource={suggestions}
            renderItem={item => (
              <List.Item onClick={() => handleSuggestionClick(item)}>
                {item.name}
              </List.Item>
            )}
            style={{ maxHeight: '200px', overflowY: 'scroll' }}
          />
        )}
      </Card>
      <LoadScript 
        googleMapsApiKey="YOUR_API_KEY"
        libraries={['places']}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation}
          zoom={10}
        >
          {loaded && (
            <>
              <Marker position={userLocation} />
              {searchResults.map((result, index) => (
                <Marker
                  key={index}
                  position={{ lat: result.lat, lng: result.lng }}
                  label={result.name}
                />
              ))}
            </>
          )}
        </GoogleMap>
      </LoadScript>
      <Card
        title="Saved Locations"
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          maxWidth: '600px',
          zIndex: 10
        }}
      >
        <List
          bordered
          dataSource={searchResults}
          renderItem={item => (
            <List.Item>
              <div>
                <strong>{item.name}</strong><br />
                Latitude: {item.lat}<br />
                Longitude: {item.lng}
              </div>
            </List.Item>
          )}
          style={{ maxHeight: '200px', overflowY: 'scroll' }}
        />
      </Card>
    </div>
  );
};

export default GoogleMapComponent;
