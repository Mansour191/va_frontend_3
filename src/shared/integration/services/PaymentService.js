/**
 * PaymentService.js
 * خدمة إدارة عمليات الدفع الإلكتروني (SATIM, Edahabia, CIB)
 * تتولى هذه الخدمة الربط مع بوابات الدفع الجزائرية ومحاكاة عملية الدفع
 * بالإضافة إلى إدارة طرق الدفع المحفوظة للمستخدمين
 */

class PaymentService {
  constructor() {
    this.apiEndpoint = import.meta.env.VITE_PAYMENT_API_URL || 'https://api.vinylart.dz/payments';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق
  }

  /**
   * بدء عملية دفع جديدة
   * @param {Object} paymentData - بيانات الدفع (المبلغ، العملة، معلومات الطلب)
   * @returns {Promise} - نتيجة عملية البدء (رابط التحويل أو معرف المعاملة)
   */
  async initiatePayment(paymentData) {
    console.log('💳 البدء في عملية الدفع:', paymentData);
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 2000));

    // في البيئة الحقيقية، هنا يتم إرسال طلب لـ SATIM للحصول على رابط التحويل (Redirect URL)
    // لمحاكاة النظام، سنفترض النجاح دائماً في هذه المرحلة
    return {
      success: true,
      transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      redirectUrl: this.generateMockGatewayUrl(paymentData.method, paymentData.amount),
      message: 'تم تجهيز بوابة الدفع بنجاح'
    };
  }

  /**
   * التحقق من حالة المعاملة بعد عودة المستخدم من البوابة
   * @param {string} transactionId - معرف المعاملة
   * @returns {Promise} - حالة المعاملة (نجاح/فشل)
   */
  async verifyPayment(transactionId) {
    console.log('🔍 التحقق من حالة المعاملة:', transactionId);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // محاكاة التحقق من الخادم
    return {
      success: true,
      status: 'PAID',
      paymentDate: new Date().toISOString(),
      receiptNumber: 'RCP-' + Math.floor(Math.random() * 1000000)
    };
  }

  /**
   * توليد رابط محاكاة لبوابة الدفع
   */
  generateMockGatewayUrl(method, amount) {
    const baseUrl = 'https://gateway.satim.dz/simulator';
    return `${baseUrl}?method=${method}&amount=${amount}&callback=${encodeURIComponent(window.location.origin + '/order-success')}`;
  }

  /**
   * معالجة الدفع بالبطاقة البنكية (CIB / Edahabia)
   */
  async processCardPayment(orderData) {
    try {
      const response = await this.initiatePayment({
        amount: orderData.total,
        currency: 'DZD',
        method: orderData.paymentMethod, // 'edahabia' or 'cib'
        orderId: orderData.id,
        customerEmail: orderData.email
      });

      if (response.success) {
        // Record payment in database via GraphQL mutation
        await this.recordPayment({
          orderId: orderData.id,
          amount: orderData.total,
          method: orderData.paymentMethod,
          status: 'processing',
          transactionId: response.transactionId,
          gatewayResponse: {
            redirectUrl: response.redirectUrl,
            initiatedAt: new Date().toISOString()
          }
        });

        // في التطبيق الحقيقي سنقوم بـ window.location.href = response.redirectUrl;
        // هنا سنحاكي النجاح مباشرة للمستخدم
        console.log('🚀 تحويل المستخدم إلى:', response.redirectUrl);
        return response;
      }
      throw new Error('فشل في بدء عملية الدفع');
    } catch (error) {
      console.error('❌ خطأ في الدفع:', error);
      throw error;
    }
  }

  /**
   * تسجيل الدفع في قاعدة البيانات عبر GraphQL
   * @param {Object} paymentData - بيانات الدفع
   * @returns {Promise<Object>} - نتيجة التسجيل
   */
  async recordPayment(paymentData) {
    try {
      const mutation = `
        mutation CreatePayment($input: PaymentInput!) {
          createPayment(input: $input) {
            success
            message
            payment {
              id
              order {
                id
                orderNumber
              }
              amount
              method
              status
              transactionId
              gatewayResponse
              createdAt
            }
            errors
          }
        }
      `;

      const variables = {
        input: {
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          method: paymentData.method,
          status: paymentData.status || 'pending',
          transactionId: paymentData.transactionId,
          gatewayResponse: paymentData.gatewayResponse || {}
        }
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response?.createPayment?.success) {
        console.log('✅ تم تسجيل الدفع بنجاح:', response.createPayment.payment);
        return response.createPayment;
      } else {
        throw new Error(response?.createPayment?.message || 'فشل تسجيل الدفع');
      }
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدفع:', error);
      throw error;
    }
  }

  /**
   * تحديث حالة الدفع بعد العودة من بوابة الدفع
   * @param {string} paymentId - معرف الدفع
   * @param {string} status - الحالة الجديدة
   * @param {Object} gatewayResponse - استجابة البوابة
   * @returns {Promise<Object>} - نتيجة التحديث
   */
  async updatePaymentStatus(paymentId, status, gatewayResponse = null) {
    try {
      const mutation = `
        mutation UpdatePaymentStatus($paymentId: ID!, $status: String!, $gatewayResponse: JSONString) {
          updatePaymentStatus(
            paymentId: $paymentId
            status: $status
            gatewayResponse: $gatewayResponse
          ) {
            success
            message
            payment {
              id
              order {
                id
                orderNumber
                paymentStatus
              }
              amount
              method
              status
              transactionId
              gatewayResponse
              updatedAt
            }
            errors
          }
        }
      `;

      const variables = {
        paymentId,
        status,
        gatewayResponse
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response?.updatePaymentStatus?.success) {
        console.log('✅ تم تحديث حالة الدفع بنجاح:', response.updatePaymentStatus.payment);
        return response.updatePaymentStatus;
      } else {
        throw new Error(response?.updatePaymentStatus?.message || 'فشل تحديث حالة الدفع');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة الدفع:', error);
      throw error;
    }
  }

  /**
   * التحقق من الدفع وتحديث الحالة تلقائياً
   * @param {string} transactionId - معرف المعاملة
   * @returns {Promise<Object>} - نتيجة التحقق والتحديث
   */
  async verifyAndUpdatePayment(transactionId) {
    try {
      // التحقق من حالة المعاملة مع بوابة الدفع
      const verificationResult = await this.verifyPayment(transactionId);
      
      if (verificationResult.success && verificationResult.status === 'PAID') {
        // تحديث حالة الدفع في قاعدة البيانات
        const updateResult = await this.updatePaymentStatus(
          null, // سيتم البحث عن طريق transactionId
          'completed',
          {
            verifiedAt: new Date().toISOString(),
            receiptNumber: verificationResult.receiptNumber,
            paymentDate: verificationResult.paymentDate
          }
        );
        
        return {
          success: true,
          message: 'تم التحقق من الدفع وتحديث الحالة بنجاح',
          payment: updateResult.payment
        };
      } else {
        // تحديث الحالة إلى فشل إذا لم يكن مدفوع
        await this.updatePaymentStatus(
          null,
          'failed',
          {
            verifiedAt: new Date().toISOString(),
            verificationResult: verificationResult
          }
        );
        
        return {
          success: false,
          message: 'فشل التحقق من الدفع'
        };
      }
    } catch (error) {
      console.error('❌ خطأ في التحقق وتحديث الدفع:', error);
      throw error;
    }
  }

  /**
   * معالجة الدفع عند الاستلام (COD)
   * @param {Object} orderData - بيانات الطلب
   * @returns {Promise<Object>} - نتيجة التسجيل
   */
  async processCashOnDelivery(orderData) {
    try {
      return await this.recordPayment({
        orderId: orderData.id,
        amount: orderData.total,
        method: 'cod',
        status: 'pending',
        gatewayResponse: {
          paymentType: 'cash_on_delivery',
          notes: 'الدفع عند الاستلام'
        }
      });
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدفع عند الاستلام:', error);
      throw error;
    }
  }

  // ========== وظائف إدارة طرق الدفع المحفوظة ==========

  /**
   * جلب طرق الدفع المحفوظة للمستخدم
   * @returns {Promise<Array>} - قائمة طرق الدفع
   */
  async getPaymentMethods() {
    const cacheKey = 'payment_methods';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const query = `
        query {
          myPaymentMethods {
            id
            type
            title
            isDefault
            cardholderName
            last4
            expiryMonth
            expiryYear
            bankName
            accountName
            accountNumber
            iban
            walletProvider
            phoneNumber
            createdAt
          }
        }
      `;

      const response = await this._makeGraphQLRequest(query);
      const methods = this._transformPaymentMethods(response.myPaymentMethods || []);
      
      this._setCache(cacheKey, methods);
      return methods;
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error);
      return this.getFallbackPaymentMethods();
    }
  }

  /**
   * إنشاء طريقة دفع جديدة
   * @param {Object} methodData - بيانات طريقة الدفع
   * @returns {Promise<Object>} - طريقة الدفع المحفوظة
   */
  async createPaymentMethod(methodData) {
    try {
      const mutation = `
        mutation CreatePaymentMethod($input: PaymentMethodInput!) {
          createPaymentMethod(input: $input) {
            success
            message
            paymentMethod {
              id
              type
              title
              isDefault
              cardholderName
              last4
              expiryMonth
              expiryYear
              bankName
              accountName
              accountNumber
              iban
              walletProvider
              phoneNumber
              createdAt
            }
            errors
          }
        }
      `;

      const variables = {
        input: this._preparePaymentMethodData(methodData)
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.createPaymentMethod.success) {
        // Clear cache to force refresh
        this.cache.delete('payment_methods');
        
        return this._transformPaymentMethod(response.createPaymentMethod.paymentMethod);
      } else {
        throw new Error(response.createPaymentMethod.message || 'Failed to create payment method');
      }
    } catch (error) {
      console.error('❌ Error creating payment method:', error);
      throw error;
    }
  }

  /**
   * تحديث طريقة دفع موجودة
   * @param {number} id - معرف طريقة الدفع
   * @param {Object} methodData - بيانات التحديث
   * @returns {Promise<Object>} - طريقة الدفع المحدثة
   */
  async updatePaymentMethod(id, methodData) {
    try {
      const mutation = `
        mutation UpdatePaymentMethod($id: ID!, $input: PaymentMethodInput!) {
          updatePaymentMethod(id: $id, input: $input) {
            success
            message
            paymentMethod {
              id
              type
              title
              isDefault
              cardholderName
              last4
              expiryMonth
              expiryYear
              bankName
              accountName
              accountNumber
              iban
              walletProvider
              phoneNumber
              createdAt
            }
            errors
          }
        }
      `;

      const variables = {
        id,
        input: this._preparePaymentMethodData(methodData)
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.updatePaymentMethod.success) {
        // Clear cache to force refresh
        this.cache.delete('payment_methods');
        
        return this._transformPaymentMethod(response.updatePaymentMethod.paymentMethod);
      } else {
        throw new Error(response.updatePaymentMethod.message || 'Failed to update payment method');
      }
    } catch (error) {
      console.error('❌ Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * حذف طريقة دفع
   * @param {number} id - معرف طريقة الدفع
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async deletePaymentMethod(id) {
    try {
      const mutation = `
        mutation DeletePaymentMethod($id: ID!) {
          deletePaymentMethod(id: $id) {
            success
            message
            errors
          }
        }
      `;

      const variables = { id };
      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.deletePaymentMethod.success) {
        // Clear cache to force refresh
        this.cache.delete('payment_methods');
        
        return true;
      } else {
        throw new Error(response.deletePaymentMethod.message || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('❌ Error deleting payment method:', error);
      throw error;
    }
  }

  /**
   * تعيين طريقة الدفع الافتراضية
   * @param {number} id - معرف طريقة الدفع
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async setDefaultPaymentMethod(id) {
    try {
      const mutation = `
        mutation SetDefaultPaymentMethod($id: ID!) {
          setDefaultPaymentMethod(id: $id) {
            success
            message
            paymentMethod {
              id
              type
              title
              isDefault
            }
            errors
          }
        }
      `;

      const variables = { id };
      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.setDefaultPaymentMethod.success) {
        // Clear cache to force refresh
        this.cache.delete('payment_methods');
        
        return true;
      } else {
        throw new Error(response.setDefaultPaymentMethod.message || 'Failed to set default payment method');
      }
    } catch (error) {
      console.error('❌ Error setting default payment method:', error);
      throw error;
    }
  }

  // ========== دوال مساعدة ==========

  /**
   * تحويل بيانات طرق الدفع من الـ API
   */
  _transformPaymentMethods(data) {
    return data.map(method => this._transformPaymentMethod(method));
  }

  /**
   * تحويل طريقة دفع واحدة
   */
  _transformPaymentMethod(method) {
    return {
      id: method.id,
      type: method.type, // 'card', 'bank', 'wallet'
      title: method.title,
      isDefault: method.is_default,
      // Card fields
      cardholderName: method.cardholder_name,
      last4: method.last4,
      expiryMonth: method.expiry_month,
      expiryYear: method.expiry_year,
      // Bank fields
      bankName: method.bank_name,
      accountName: method.account_name,
      accountNumber: method.account_number,
      iban: method.iban,
      // Wallet fields
      walletProvider: method.wallet_provider,
      phoneNumber: method.phone_number,
      createdAt: method.created_at
    };
  }

  /**
   * تجهيز بيانات طريقة الدفع للإرسال إلى الـ API
   */
  _preparePaymentMethodData(methodData) {
    const data = {
      type: methodData.type,
      title: methodData.title,
      is_default: methodData.isDefault || false
    };

    // Add type-specific fields
    if (methodData.type === 'card') {
      data.cardholder_name = methodData.cardholderName;
      data.card_number = methodData.cardNumber;
      data.expiry_month = methodData.expiryMonth;
      data.expiry_year = methodData.expiryYear;
      data.cvv = methodData.cvv;
    } else if (methodData.type === 'bank') {
      data.bank_name = methodData.bankName;
      data.account_name = methodData.accountName;
      data.account_number = methodData.accountNumber;
      data.iban = methodData.iban;
    } else if (methodData.type === 'wallet') {
      data.wallet_provider = methodData.walletProvider;
      data.phone_number = methodData.phoneNumber;
    }

    return data;
  }

  /**
   * بيانات احتياطية لطرق الدفع
   */
  getFallbackPaymentMethods() {
    return [
      {
        id: 1,
        type: 'card',
        title: 'البطاقة الشخصية',
        cardholderName: 'أحمد محمد',
        last4: '1234',
        expiryMonth: '12',
        expiryYear: '25',
        isDefault: true
      },
      {
        id: 2,
        type: 'bank',
        title: 'حساب البنك الوطني',
        bankName: 'البنك الوطني الجزائري',
        accountName: 'أحمد محمد',
        accountNumber: '00789123456789',
        iban: 'DZ86000010000789123456789',
        isDefault: false
      }
    ];
  }

  /**
   * الحصول على توكن المصادقة
   */
  _getAuthToken() {
    // في التطبيق الحقيقي، يتم جلب التوكن من localStorage أو Vuex store
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

  /**
   * تنفيذ طلب GraphQL
   * @param {string} query - استعلام GraphQL
   * @param {Object} variables - متغيرات الاستعلام
   * @returns {Promise<Object>} - نتيجة الاستعلام
   */
  async _makeGraphQLRequest(query, variables = {}) {
    try {
      const response = await fetch('/graphql/', {
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
}

export default new PaymentService();
