/**
 * ContactService.js
 * خدمة إدارة نموذج الاتصال والربط مع قاعدة البيانات
 */

class ContactService {
  constructor() {
    this.graphqlEndpoint = '/graphql/';
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
      const mutation = `
        mutation SendContactForm($input: ContactFormInput!) {
          sendContactForm(input: $input) {
            success
            message
            contactForm {
              id
              name
              email
              phone
              message
              createdAt
            }
            errors
          }
        }
      `;

      const variables = {
        input: this._prepareContactData(contactData)
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.sendContactForm.success) {
        return {
          success: true,
          message: response.sendContactForm.message || 'تم إرسال رسالتك بنجاح!',
          data: response.sendContactForm.contactForm
        };
      } else {
        return {
          success: false,
          message: response.sendContactForm.message || 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
          errors: response.sendContactForm.errors
        };
      }
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
      const query = `
        query {
          contactInfo {
            email
            phone
            address
            whatsapp
            facebook
            instagram
            twitter
            workingHours {
              sunday
              monday
              tuesday
              wednesday
              thursday
              friday
              saturday
            }
            location {
              lat
              lng
              address
            }
          }
        }
      `;

      const response = await this._makeGraphQLRequest(query);
      const contactInfo = this._transformContactInfo(response.contactInfo || {});
      
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
      const mutation = `
        mutation ValidateContactForm($input: ContactFormInput!) {
          validateContactForm(input: $input) {
            valid
            errors
          }
        }
      `;

      const variables = {
        input: this._prepareContactData(contactData)
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      return {
        valid: response.validateContactForm.valid,
        errors: response.validateContactForm.errors || []
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
      workingHours: data.workingHours || {
        sunday: '9:00 - 17:00',
        monday: '9:00 - 17:00',
        tuesday: '9:00 - 17:00',
        wednesday: '9:00 - 17:00',
        thursday: '9:00 - 17:00',
        friday: 'مغلق',
        saturday: '9:00 - 13:00'
      },
      location: data.location || {
        lat: 36.7538,
        lng: 3.0588,
        address: 'الجزائر العاصمة، الجزائر'
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
   * تنفيذ طلب GraphQL
   * @param {string} query - استعلام GraphQL
   * @param {Object} variables - متغيرات الاستعلام
   * @returns {Promise<Object>} - نتيجة الاستعلام
   */
  async _makeGraphQLRequest(query, variables = {}) {
    try {
      const response = await fetch(this.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._getAuthToken()}`
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      return result.data;
    } catch (error) {
      console.error('❌ GraphQL request error:', error);
      throw error;
    }
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
