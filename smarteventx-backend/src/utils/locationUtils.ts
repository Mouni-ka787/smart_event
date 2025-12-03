import { getDistanceMatrix, calculateETAWithTraffic } from '../services/googleMapsService';

// Utility functions for location calculations

// Calculate distance between two points using Haversine formula (fallback)
export const calculateDistanceHaversine = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Calculate distance - uses Google Maps API if available, otherwise Haversine
export const calculateDistance = async (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): Promise<number> => {
  try {
    // Try Google Maps Distance Matrix API first
    const distanceData = await getDistanceMatrix(point1, point2);
    if (distanceData && distanceData.status === 'OK') {
      return distanceData.distance;
    }
  } catch (error) {
    console.warn('Google Maps API unavailable, using Haversine formula');
  }
  
  // Fallback to Haversine formula
  return calculateDistanceHaversine(point1, point2);
};

// Synchronous distance calculation using only Haversine
export const calculateDistanceSync = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  return calculateDistanceHaversine(point1, point2);
};

// Calculate ETA based on distance and speed (fallback)
export const calculateETASimple = (distance: number, speed: number): number => {
  // distance in meters, speed in m/s
  // Return ETA in seconds
  if (speed <= 0) return 0;
  return distance / speed;
};

// Calculate ETA - uses Google Maps API if available
export const calculateETA = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  currentSpeed?: number
): Promise<number> => {
  try {
    // Try Google Maps Distance Matrix API first (includes traffic)
    const distanceData = await getDistanceMatrix(origin, destination);
    if (distanceData && distanceData.status === 'OK') {
      return distanceData.duration; // Already in seconds
    }
  } catch (error) {
    console.warn('Google Maps API unavailable, using simple calculation');
  }
  
  // Fallback to simple calculation
  const distance = calculateDistanceHaversine(origin, destination);
  return calculateETASimple(distance, currentSpeed || 10); // Default 10 m/s (~36 km/h)
};

// Synchronous ETA calculation
export const calculateETASync = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  currentSpeed?: number
): number => {
  const distance = calculateDistanceHaversine(origin, destination);
  return calculateETASimple(distance, currentSpeed || 10);
};

// Check if vendor is within geofence radius of venue
export const isWithinGeofence = (
  vendorLocation: { lat: number; lng: number },
  venueLocation: { lat: number; lng: number },
  radius: number = 50 // meters
): boolean => {
  const distance = calculateDistanceHaversine(vendorLocation, venueLocation);
  return distance <= radius;
};

// Convert degrees to radians
const toRadians = (degrees: number): number => {
  return degrees * Math.PI / 180;
};

// Calculate bearing between two points
export const calculateBearing = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const φ1 = toRadians(point1.lat);
  const φ2 = toRadians(point2.lat);
  const Δλ = toRadians(point2.lng - point1.lng);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const bearing = (θ * 180 / Math.PI + 360) % 360;

  return bearing;
};