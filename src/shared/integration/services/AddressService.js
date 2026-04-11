/**
 * AddressService.js
 * خدمة إدارة عناوين المستخدمين في الجزائر
 * تتولى هذه الخدمة الربط مع API لإدارة عناوين الشحن والتوصيل
 */

class AddressService {
  constructor() {
    this.apiEndpoint = import.meta.env.VITE_API_URL || 'https://api.vinylart.dz';
    this.cache = new Map();
    this.cacheTTL = 15 * 60 * 1000; // 15 دقيقة
  }

  /**
   * جلب جميع عناوين المستخدم
   * @returns {Promise<Array>} - قائمة العناوين
   */
  async getAddresses() {
    const cacheKey = 'user_addresses';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiEndpoint}/user/addresses/`;
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
      const addresses = this._transformAddresses(data);
      
      this._setCache(cacheKey, addresses);
      return addresses;
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      return this.getFallbackAddresses();
    }
  }

  /**
   * إنشاء عنوان جديد
   * @param {Object} addressData - بيانات العنوان
   * @returns {Promise<Object>} - العنوان المنشأ
   */
  async createAddress(addressData) {
    try {
      const url = `${this.apiEndpoint}/user/addresses/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._prepareAddressData(addressData))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const address = this._transformAddress(data);
      
      // Clear cache to force refresh
      this.cache.delete('user_addresses');
      
      return address;
    } catch (error) {
      console.error('❌ Error creating address:', error);
      throw error;
    }
  }

  /**
   * تحديث عنوان موجود
   * @param {number} id - معرف العنوان
   * @param {Object} addressData - بيانات التحديث
   * @returns {Promise<Object>} - العنوان المحدث
   */
  async updateAddress(id, addressData) {
    try {
      const url = `${this.apiEndpoint}/user/addresses/${id}/`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._prepareAddressData(addressData))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const address = this._transformAddress(data);
      
      // Clear cache to force refresh
      this.cache.delete('user_addresses');
      
      return address;
    } catch (error) {
      console.error('❌ Error updating address:', error);
      throw error;
    }
  }

  /**
   * حذف عنوان
   * @param {number} id - معرف العنوان
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async deleteAddress(id) {
    try {
      const url = `${this.apiEndpoint}/user/addresses/${id}/`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Clear cache to force refresh
      this.cache.delete('user_addresses');
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      throw error;
    }
  }

  /**
   * تعيين العنوان الافتراضي
   * @param {number} id - معرف العنوان
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async setDefaultAddress(id) {
    try {
      const url = `${this.apiEndpoint}/user/addresses/${id}/set-default/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Clear cache to force refresh
      this.cache.delete('user_addresses');
      
      return true;
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      throw error;
    }
  }

  /**
   * جلب قائمة الولايات الجزائرية
   * @returns {Promise<Array>} - قائمة الولايات
   */
  async getWilayas() {
    const cacheKey = 'wilayas_list';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiEndpoint}/locations/wilayas/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const wilayas = this._transformWilayas(data);
      
      this._setCache(cacheKey, wilayas);
      return wilayas;
    } catch (error) {
      console.error('❌ Error fetching wilayas:', error);
      return this.getFallbackWilayas();
    }
  }

  /**
   * جلب البلديات بناءً على الولاية
   * @param {string} wilayaCode - رمز الولاية
   * @returns {Promise<Array>} - قائمة البلديات
   */
  async getCommunes(wilayaCode) {
    const cacheKey = `communes_${wilayaCode}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiEndpoint}/locations/wilayas/${wilayaCode}/communes/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const communes = this._transformCommunes(data);
      
      this._setCache(cacheKey, communes);
      return communes;
    } catch (error) {
      console.error('❌ Error fetching communes:', error);
      return [];
    }
  }

  // ========== دوال مساعدة ==========

  /**
   * تحويل العناوين من الـ API
   */
  _transformAddresses(data) {
    return data.map(address => this._transformAddress(address));
  }

  /**
   * تحويل عنوان واحد
   */
  _transformAddress(address) {
    return {
      id: address.id,
      title: address.title,
      name: address.recipient_name,
      phone: address.phone,
      wilaya: address.wilaya_name,
      wilayaCode: address.wilaya_code,
      commune: address.commune_name,
      communeCode: address.commune_code,
      address: address.street_address,
      instructions: address.delivery_instructions,
      isDefault: address.is_default,
      createdAt: address.created_at,
      updatedAt: address.updated_at
    };
  }

  /**
   * تحويل الولايات من الـ API
   */
  _transformWilayas(data) {
    return data.map(wilaya => ({
      code: wilaya.code,
      name: wilaya.name,
      nameAr: wilaya.name_ar,
      nameFr: wilaya.name_fr
    })).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }

  /**
   * تحويل البلديات من الـ API
   */
  _transformCommunes(data) {
    return data.map(commune => ({
      code: commune.code,
      name: commune.name,
      nameAr: commune.name_ar,
      nameFr: commune.name_fr,
      wilayaCode: commune.wilaya_code
    })).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }

  /**
   * تجهيز بيانات العنوان للإرسال إلى الـ API
   */
  _prepareAddressData(addressData) {
    return {
      title: addressData.title,
      recipient_name: addressData.name,
      phone: addressData.phone,
      wilaya_code: addressData.wilayaCode,
      wilaya_name: addressData.wilaya,
      commune_code: addressData.communeCode,
      commune_name: addressData.commune,
      street_address: addressData.address,
      delivery_instructions: addressData.instructions || '',
      is_default: addressData.isDefault || false
    };
  }

  // ========== بيانات احتياطية ==========

  /**
   * بيانات احتياطية للعناوين
   */
  getFallbackAddresses() {
    return [
      {
        id: 1,
        title: 'المنزل',
        name: 'أحمد محمد',
        phone: '+213 66 123 4567',
        wilaya: 'الجزائر',
        wilayaCode: '16',
        commune: 'الجزائر الوسطى',
        communeCode: '1601',
        address: 'شارع العربي بن مهدي، رقم 45، الدائرة 1',
        instructions: 'بجانب البنك، الطابق الثاني',
        isDefault: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        title: 'العمل',
        name: 'أحمد محمد',
        phone: '+213 66 123 4567',
        wilaya: 'الجزائر',
        wilayaCode: '16',
        commune: 'الجزائر الوسطى',
        communeCode: '1601',
        address: 'مركز الأعمال، شارع ديدوش مراد، رقم 12',
        instructions: 'استقبال في الطابق الأول',
        isDefault: false,
        createdAt: '2024-01-20T14:15:00Z',
        updatedAt: '2024-01-20T14:15:00Z'
      }
    ];
  }

  /**
   * بيانات احتياطية للولايات الجزائرية
   */
  getFallbackWilayas() {
    return [
      { code: '01', name: 'أدرار', nameAr: 'أدرار', nameFr: 'Adrar' },
      { code: '02', name: 'الشلف', nameAr: 'الشلف', nameFr: 'Chlef' },
      { code: '03', name: 'أولاد بلعباس', nameAr: 'أولاد بلعباس', nameFr: 'Ouled Djellal' },
      { code: '04', name: 'باتنة', nameAr: 'باتنة', nameFr: 'Batna' },
      { code: '05', name: 'بجاية', nameAr: 'بجاية', nameFr: 'Béjaïa' },
      { code: '06', name: 'بسكرة', nameAr: 'بسكرة', nameFr: 'Biskra' },
      { code: '07', name: 'بشار', nameAr: 'بشار', nameFr: 'Béchar' },
      { code: '08', name: 'البليدة', nameAr: 'البليدة', nameFr: 'Blida' },
      { code: '09', name: 'البويرة', nameAr: 'البويرة', nameFr: 'Bouira' },
      { code: '10', name: 'تamanrasset', nameAr: 'تمنراست', nameFr: 'Tamanrasset' },
      { code: '11', name: 'تبسة', nameAr: 'تبسة', nameFr: 'Tébessa' },
      { code: '12', name: 'تلمسان', nameAr: 'تلمسان', nameFr: 'Tlemcen' },
      { code: '13', name: 'تيارت', nameAr: 'تيارت', nameFr: 'Tiaret' },
      { code: '14', name: 'تيزي وزو', nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou' },
      { code: '15', name: 'الجزائر', nameAr: 'الجزائر', nameFr: 'Alger' },
      { code: '16', name: 'الجلفة', nameAr: 'الجلفة', nameFr: 'Djelfa' },
      { code: '17', name: 'جيجل', nameAr: 'جيجل', nameFr: 'Jijel' },
      { code: '18', name: 'سطيف', nameAr: 'سطيف', nameFr: 'Sétif' },
      { code: '19', name: 'سعيدة', nameAr: 'سعيدة', nameFr: 'Saïda' },
      { code: '20', name: 'سكيكدة', nameAr: 'سكيكدة', nameFr: 'Skikda' },
      { code: '21', name: 'سيدي بلعباس', nameAr: 'سيدي بلعباس', nameFr: 'Sidi Bel Abbès' },
      { code: '22', name: 'عنابة', nameAr: 'عنابة', nameFr: 'Annaba' },
      { code: '23', name: 'قالمة', nameAr: 'قالمة', nameFr: 'Guelma' },
      { code: '24', name: 'قسنطينة', nameAr: 'قسنطينة', nameFr: 'Constantine' },
      { code: '25', name: 'مدية', nameAr: 'مدية', nameFr: 'Médéa' },
      { code: '26', name: 'مستغانم', nameAr: 'مستغانم', nameFr: 'Mostaganem' },
      { code: '27', name: 'المسيلة', nameAr: 'المسيلة', nameFr: 'M\'Sila' },
      { code: '28', name: 'معسكر', nameAr: 'معسكر', nameFr: 'Mascara' },
      { code: '29', name: 'ورقلة', nameAr: 'ورقلة', nameFr: 'Ouargla' },
      { code: '30', name: 'وهران', nameAr: 'وهران', nameFr: 'Oran' },
      { code: '31', name: 'البيض', nameAr: 'البيض', nameFr: 'El Bayadh' },
      { code: '32', name: 'إليزي', nameAr: 'إليزي', nameFr: 'Illizi' },
      { code: '33', name: 'برج بوعريريج', nameAr: 'برج بوعريريج', nameFr: 'Bordj Bou Arréridj' },
      { code: '34', name: 'بومرداس', nameAr: 'بومرداس', nameFr: 'Boumerdès' },
      { code: '35', name: 'الطارف', nameAr: 'الطارف', nameFr: 'El Tarf' },
      { code: '36', name: 'تندوف', nameAr: 'تندوف', nameFr: 'Tindouf' },
      { code: '37', name: 'تيسمسيلت', nameAr: 'تيسمسيلت', nameFr: 'Tissemsilt' },
      { code: '38', name: 'الوادي', nameAr: 'الوادي', nameFr: 'El Oued' },
      { code: '39', name: 'خنشلة', nameAr: 'خنشلة', nameFr: 'Khenchela' },
      { code: '40', name: 'سوق أهراس', nameAr: 'سوق أهراس', nameFr: 'Souk Ahras' },
      { code: '41', name: 'تيبازة', nameAr: 'تيبازة', nameFr: 'Tipaza' },
      { code: '42', name: 'ميلة', nameAr: 'ميلة', nameFr: 'Mila' },
      { code: '43', name: 'عين الدفلة', nameAr: 'عين الدفلة', nameFr: 'Aïn Defla' },
      { code: '44', name: 'النعامة', nameAr: 'النعامة', nameFr: 'Naâma' },
      { code: '45', name: 'عين تموشنت', nameAr: 'عين تموشنت', nameFr: 'Aïn Témouchent' },
      { code: '46', name: 'غرداية', nameAr: 'غرداية', nameFr: 'Ghardaïa' },
      { code: '47', name: 'غليزان', nameAr: 'غليزان', nameFr: 'Relizane' },
      { code: '48', name: 'تيميمون', nameAr: 'تيميمون', nameFr: 'Timimoun' },
      { code: '49', name: 'برج باجي مختار', nameAr: 'برج باجي مختار', nameFr: 'Bordj Badji Mokhtar' },
      { code: '50', name: 'أولاد جلال', nameAr: 'أولاد جلال', nameFr: 'Ouled Djellal' },
      { code: '51', name: 'بني عباس', nameAr: 'بني عباس', nameFr: 'Béni Abbès' },
      { code: '52', name: 'تبسبع', nameAr: 'تبسبع', nameFr: 'Timimoun' },
      { code: '53', name: 'تقرت', nameAr: 'تقرت', nameFr: 'Touggourt' },
      { code: '54', name: 'جانت', nameAr: 'جانت', nameFr: 'Djanet' },
      { code: '55', name: 'المغير', nameAr: 'المغير', nameFr: 'El M\'Ghair' },
      { code: '56', name: 'أم البواقي', nameAr: 'أم البواقي', nameFr: 'Oum El Bouaghi' },
      { code: '57', name: 'عين صالح', nameAr: 'عين صالح', nameFr: 'Aïn Séfa' },
      { code: '58', name: 'عين قزام', nameAr: 'عين قزام', nameFr: 'Aïn Kerma' }
    ].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
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

export default new AddressService();
