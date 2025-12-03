import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const DISTANCE_MATRIX_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';

interface Coordinates {
  lat: number;
  lng: number;
}

interface DistanceMatrixResult {
  distance: number; // in meters
  duration: number; // in seconds
  status: string;
}

interface DirectionsResult {
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string;
  steps: any[];
}

/**
 * Geocode an address to get coordinates
 */
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const response = await axios.get(GEOCODING_API_URL, {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }

    console.error('Geocoding failed:', response.data.status);
    return null;
  } catch (error: any) {
    console.error('Error geocoding address:', error.message);
    return null;
  }
};

/**
 * Reverse geocode coordinates to get address
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const response = await axios.get(GEOCODING_API_URL, {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }

    return null;
  } catch (error: any) {
    console.error('Error reverse geocoding:', error.message);
    return null;
  }
};

/**
 * Get driving distance and duration between two points
 */
export const getDistanceMatrix = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<DistanceMatrixResult | null> => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const response = await axios.get(DISTANCE_MATRIX_API_URL, {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        mode: 'driving',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && 
        response.data.rows.length > 0 && 
        response.data.rows[0].elements.length > 0) {
      
      const element = response.data.rows[0].elements[0];
      
      if (element.status === 'OK') {
        return {
          distance: element.distance.value, // meters
          duration: element.duration.value, // seconds
          status: 'OK'
        };
      }
    }

    return null;
  } catch (error: any) {
    console.error('Error getting distance matrix:', error.message);
    return null;
  }
};

/**
 * Get directions with route information
 */
export const getDirections = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<DirectionsResult | null> => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const response = await axios.get(DIRECTIONS_API_URL, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: 'driving',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.value, // meters
        duration: leg.duration.value, // seconds
        polyline: route.overview_polyline.points,
        steps: leg.steps
      };
    }

    return null;
  } catch (error: any) {
    console.error('Error getting directions:', error.message);
    return null;
  }
};

/**
 * Calculate ETA with traffic consideration
 */
export const calculateETAWithTraffic = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<Date | null> => {
  try {
    const distanceData = await getDistanceMatrix(origin, destination);
    
    if (distanceData && distanceData.status === 'OK') {
      const etaTimestamp = Date.now() + (distanceData.duration * 1000);
      return new Date(etaTimestamp);
    }

    return null;
  } catch (error: any) {
    console.error('Error calculating ETA:', error.message);
    return null;
  }
};
