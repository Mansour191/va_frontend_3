/**
 * Location Service - Handles location and map data management
 * Provides API integration for dynamic location information
 */

class LocationService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  }

  /**
   * Make API request helper
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ Location API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Get location information from API
   * @returns {Promise<Object>} Location data including address, coordinates, contact info
   */
  static async getLocationInfo() {
    try {
      const service = new LocationService();
      const response = await service.apiRequest('/location/');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error fetching location info:', error);
      // Return default location data
      return {
        success: true,
        data: {
          address: {
            street: 'شارع الأمير عبد القادر',
            city: 'الجزائر العاصمة',
            country: 'الجزائر',
            postalCode: '16000'
          },
          coordinates: {
            lat: 36.7538,
            lng: 3.0588
          },
          contact: {
            phone: '+213 66 314 0341',
            email: 'contact@paclos.dz',
            whatsapp: '+213 66 314 0341'
          },
          workingHours: {
            weekdays: '9:00 - 18:00',
            saturday: '9:00 - 14:00',
            sunday: 'مغلق'
          }
        }
      };
    }
  }

  /**
   * Get Google Maps embed URL
   * @param {Object} coordinates - Latitude and longitude
   * @returns {String} Google Maps embed URL
   */
  static getMapsEmbedUrl(coordinates) {
    const { lat, lng } = coordinates || { lat: 36.7538, lng: 3.0588 };
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2634.123456789!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDA3JzI0LjAiTiAzwrA3JzI0LjAiRQ!5e0!3m2!1sar!2sdz!4v1234567890`;
  }

  /**
   * Get directions URL
   * @param {Object} coordinates - Destination coordinates
   * @returns {String} Google Maps directions URL
   */
  static getDirectionsUrl(coordinates) {
    const { lat, lng } = coordinates || { lat: 36.7538, lng: 3.0588 };
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  /**
   * Update location information
   * @param {Object} locationData - Location data to update
   * @returns {Promise<Object>} Updated location data
   */
  static async updateLocationInfo(locationData) {
    try {
      const service = new LocationService();
      const response = await service.apiRequest('/location/', {
        method: 'PUT',
        body: JSON.stringify(locationData)
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error updating location info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get nearby branches/stores
   * @param {Object} coordinates - Center coordinates
   * @param {Number} radius - Search radius in km
   * @returns {Promise<Array>} Array of nearby locations
   */
  static async getNearbyBranches(coordinates, radius = 50) {
    try {
      const service = new LocationService();
      const response = await service.apiRequest(`/location/nearby/?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error fetching nearby branches:', error);
      // Return default branches
      return {
        success: true,
        data: [
          {
            id: 1,
            name: 'المركز الرئيسي',
            address: 'شارع الأمير عبد القادر، الجزائر العاصمة',
            coordinates: { lat: 36.7538, lng: 3.0588 },
            phone: '+213 66 314 0341',
            distance: 0
          }
        ]
      };
    }
  }
}

export default LocationService;
