const { Client } = require('@googlemaps/google-maps-services-js');

class MapsService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  // Geocode address to coordinates
  async geocodeAddress(address) {
    try {
      if (!this.apiKey || this.apiKey === 'development-key') {
        // Return mock coordinates for development
        return {
          coordinates: [-74.006, 40.7128], // NYC coordinates
          formattedAddress: address,
          placeId: 'mock_place_id'
        };
      }

      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;

        return {
          coordinates: [location.lng, location.lat],
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          addressComponents: result.address_components
        };
      }

      throw new Error('No results found for the provided address');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    try {
      if (!this.apiKey || this.apiKey === 'development-key') {
        // Return mock address for development
        return {
          formattedAddress: `Mock Address for ${lat}, ${lng}`,
          placeId: 'mock_place_id'
        };
      }

      const response = await this.client.reverseGeocode({
        params: {
          latlng: { lat, lng },
          key: this.apiKey
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];

        return {
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          addressComponents: result.address_components
        };
      }

      throw new Error('No address found for the provided coordinates');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error(`Reverse geocoding failed: ${error.message}`);
    }
  }

  // Find nearby places
  async findNearbyPlaces(lat, lng, radius = 1000, type = null) {
    try {
      if (!this.apiKey || this.apiKey === 'development-key') {
        // Return mock nearby places for development
        return [
          {
            placeId: 'mock_place_1',
            name: 'Mock City Hall',
            address: '123 Main St',
            distance: 500,
            type: 'government'
          },
          {
            placeId: 'mock_place_2',
            name: 'Mock Park',
            address: '456 Park Ave',
            distance: 800,
            type: 'park'
          }
        ];
      }

      const params = {
        location: { lat, lng },
        radius,
        key: this.apiKey
      };

      if (type) {
        params.type = type;
      }

      const response = await this.client.placesNearby({ params });

      if (response.data.results) {
        return response.data.results.map(place => ({
          placeId: place.place_id,
          name: place.name,
          address: place.vicinity,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          rating: place.rating,
          types: place.types,
          isOpen: place.opening_hours?.open_now
        }));
      }

      return [];
    } catch (error) {
      console.error('Nearby places search error:', error);
      throw new Error(`Nearby places search failed: ${error.message}`);
    }
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get directions between two points
  async getDirections(origin, destination, mode = 'driving') {
    try {
      if (!this.apiKey || this.apiKey === 'development-key') {
        // Return mock directions for development
        return {
          distance: '2.5 km',
          duration: '8 mins',
          route: 'Mock route from origin to destination'
        };
      }

      const response = await this.client.directions({
        params: {
          origin,
          destination,
          mode,
          key: this.apiKey
        }
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];

        return {
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            distance: step.distance.text,
            duration: step.duration.text
          })),
          polyline: route.overview_polyline.points
        };
      }

      throw new Error('No route found');
    } catch (error) {
      console.error('Directions error:', error);
      throw new Error(`Directions failed: ${error.message}`);
    }
  }

  // Validate coordinates
  isValidCoordinates(lat, lng) {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  // Find government offices nearby
  async findNearbyGovernmentOffices(lat, lng, radius = 5000) {
    return await this.findNearbyPlaces(lat, lng, radius, 'local_government_office');
  }

  // Find hospitals nearby
  async findNearbyHospitals(lat, lng, radius = 5000) {
    return await this.findNearbyPlaces(lat, lng, radius, 'hospital');
  }

  // Find police stations nearby
  async findNearbyPoliceStations(lat, lng, radius = 5000) {
    return await this.findNearbyPlaces(lat, lng, radius, 'police');
  }

  // Get place details
  async getPlaceDetails(placeId) {
    try {
      if (!this.apiKey || this.apiKey === 'development-key') {
        // Return mock place details for development
        return {
          name: 'Mock Place',
          address: 'Mock Address',
          phone: '+1-555-0123',
          website: 'https://mockplace.com',
          rating: 4.2
        };
      }

      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'rating', 'opening_hours'],
          key: this.apiKey
        }
      });

      if (response.data.result) {
        const place = response.data.result;
        return {
          name: place.name,
          address: place.formatted_address,
          phone: place.formatted_phone_number,
          website: place.website,
          rating: place.rating,
          openingHours: place.opening_hours?.weekday_text
        };
      }

      throw new Error('Place details not found');
    } catch (error) {
      console.error('Place details error:', error);
      throw new Error(`Place details failed: ${error.message}`);
    }
  }

  // Get location details including ward, zone, and administrative information
  async getLocationDetails(lat, lng) {
    try {
      if (!this.apiKey || this.apiKey === 'development-key') {
        // Return mock location details for development
        return {
          ward: 'Ward 12',
          zone: 'Central Zone',
          constituency: 'Central Constituency',
          municipalArea: 'Municipal Corporation',
          landmarks: ['City Hall', 'Central Park', 'Main Market'],
          district: 'Central District',
          state: 'State Name',
          pincode: '123456'
        };
      }

      // Use reverse geocoding to get detailed address components
      const reverseResult = await this.reverseGeocode(lat, lng);
      
      // Extract administrative information from address components
      const addressComponents = reverseResult.addressComponents || [];
      
      let ward = '';
      let zone = '';
      let constituency = '';
      let municipalArea = '';
      let district = '';
      let state = '';
      let pincode = '';

      addressComponents.forEach(component => {
        const types = component.types;
        
        if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
          ward = component.long_name;
        }
        if (types.includes('sublocality_level_2')) {
          zone = component.long_name;
        }
        if (types.includes('administrative_area_level_3')) {
          constituency = component.long_name;
        }
        if (types.includes('locality')) {
          municipalArea = component.long_name;
        }
        if (types.includes('administrative_area_level_2')) {
          district = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (types.includes('postal_code')) {
          pincode = component.long_name;
        }
      });

      // Find nearby landmarks
      const nearbyPlaces = await this.findNearbyPlaces(lat, lng, 1000);
      const landmarks = nearbyPlaces.slice(0, 5).map(place => place.name);

      return {
        ward: ward || 'Unknown Ward',
        zone: zone || 'Unknown Zone',
        constituency: constituency || 'Unknown Constituency',
        municipalArea: municipalArea || 'Unknown Municipal Area',
        landmarks: landmarks,
        district: district || 'Unknown District',
        state: state || 'Unknown State',
        pincode: pincode || 'Unknown'
      };
    } catch (error) {
      console.error('Location details error:', error);
      // Return fallback data instead of throwing error to prevent issue creation failure
      return {
        ward: 'Unknown Ward',
        zone: 'Unknown Zone',
        constituency: 'Unknown Constituency',
        municipalArea: 'Unknown Municipal Area',
        landmarks: [],
        district: 'Unknown District',
        state: 'Unknown State',
        pincode: 'Unknown'
      };
    }
  }
}

module.exports = new MapsService();