/**
 * ContactService.js
 * خدمة إدارة نموذج الاتصال والربط مع قاعدة البيانات
 */

class ContactService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    this.cache = new Map();
    this.cacheTTL = 10 * 60 * 1000; // 10 دقائق
  }

  /**
   * إرسال نموذج الاتصال
   * @param {Object} contactData - بيانات النموذج
   * @returns {Promise<Object>} - نتيجة الإرسال
   */
  async sendContactForm(contactData) {
    try {
      const url = `${this.apiBaseUrl}/contact/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._prepareContactData(contactData))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'تم إرسال رسالتك بنجاح!',
        data: data
      };
    } catch (error) {
      console.error('❌ Error sending contact form:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
        error: error.message
      };
    }
  }

  /**
   * الحصول على معلومات الاتصال
   * @returns {Promise<Object>} - معلومات الاتصال
   */
  async getContactInfo() {
    const cacheKey = 'contact_info';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiBaseUrl}/contact/info/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const contactInfo = this._transformContactInfo(data);
      
      this._setCache(cacheKey, contactInfo);
      return contactInfo;
    } catch (error) {
      console.error('❌ Error fetching contact info:', error);
      return this.getFallbackContactInfo();
    }
  }

  /**
   * التحقق من صحة بيانات النموذج
   * @param {Object} contactData - بيانات النموذج
   * @returns {Promise<Object>} - نتيجة التحقق
   */
  async validateContactForm(contactData) {
    try {
      const url = `${this.apiBaseUrl}/contact/validate/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._prepareContactData(contactData))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        valid: data.valid,
        errors: data.errors || []
      };
    } catch (error) {
      console.error('❌ Error validating contact form:', error);
      return {
        valid: false,
        errors: ['فشل في التحقق من البيانات']
      };
    }
  }

  // ========== Helper Methods ==========

  /**
   * تجهيز بيانات النموذج للإرسال
   */
  _prepareContactData(contactData) {
    return {
      name: contactData.name.trim(),
      email: contactData.email.trim().toLowerCase(),
      phone: contactData.phone.trim(),
      message: contactData.message.trim(),
      created_at: new Date().toISOString(),
      source: 'website'
    };
  }

  /**
   * تحويل بيانات معلومات الاتصال
   */
  _transformContactInfo(data) {
    return {
      email: data.email,
      phone: data.phone,
      address: data.address,
      whatsapp: data.whatsapp,
      facebook: data.facebook,
      instagram: data.instagram,
      twitter: data.twitter,
      workingHours: data.working_hours,
      location: {
        lat: data.latitude,
        lng: data.longitude,
        address: data.full_address
      }
    };
  }

  /**
   * بيانات احتياطية لمعلومات الاتصال
   */
  getFallbackContactInfo() {
    return {
      email: 'info@vynilart.com',
      phone: '+213 555 123 456',
      address: 'الجزائر، الجزائر العاصمة',
      whatsapp: '+213 555 123 456',
      facebook: 'https://facebook.com/vynilart',
      instagram: 'https://instagram.com/vynilart',
      twitter: 'https://twitter.com/vynilart',
      workingHours: {
        sunday: '9:00 - 17:00',
        monday: '9:00 - 17:00',
        tuesday: '9:00 - 17:00',
        wednesday: '9:00 - 17:00',
        thursday: '9:00 - 17:00',
        friday: 'مغلق',
        saturday: '9:00 - 13:00'
      },
      location: {
        lat: 36.7538,
        lng: 3.0588,
        address: 'الجزائر العاصمة، الجزائر'
      }
    };
  }

  /**
   * الحصول على توكن المصادقة
   */
  _getAuthToken() {
    return localStorage.getItem('authToken') || 'mock-token';
  }

  /**
   * التحقق من صلاحية الكاش
   */
  _isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp < this.cacheTTL);
  }

  /**
   * حفظ البيانات في الكاش
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * مسح الكاش
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new ContactService();
