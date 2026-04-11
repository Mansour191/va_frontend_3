import ERPNextService from './ERPNextService';
import store from '@/store';

class CustomerSyncService {
  constructor() {
    this.syncInProgress = false;
    this.lastSync = null;
    this.syncStats = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
    };
  }

  // ========== جلب العملاء من الموقع ==========
  async getSiteCustomers() {
    // هنا بنجيب العملاء من Vuex store
    // افترض أن العملاء مخزنين في store.state.users.users
    const customers = store.state.users?.users || [];

    // إذا مفيش بيانات حقيقية، نستخدم بيانات وهمية للتجربة
    if (customers.length === 0) {
      return this.getMockSiteCustomers();
    }

    return customers;
  }

  // بيانات وهمية للعملاء
  getMockSiteCustomers() {
    return [
      {
        id: 1,
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '0555123456',
        address: 'الرياض، السعودية',
        totalOrders: 12,
        totalSpent: 3450,
        erpnextSynced: false,
        erpnextCustomerId: null,
      },
      {
        id: 2,
        name: 'سارة أحمد',
        email: 'sara@example.com',
        phone: '0555987654',
        address: 'جدة، السعودية',
        totalOrders: 8,
        totalSpent: 2100,
        erpnextSynced: true,
        erpnextCustomerId: 'CUS-002',
      },
      {
        id: 3,
        name: 'محمد علي',
        email: 'mohammed@example.com',
        phone: '0555777888',
        address: 'الدمام، السعودية',
        totalOrders: 5,
        totalSpent: 980,
        erpnextSynced: false,
        erpnextCustomerId: null,
      },
      {
        id: 4,
        name: 'فاطمة عمر',
        email: 'fatima@example.com',
        phone: '0555666777',
        address: 'مكة، السعودية',
        totalOrders: 3,
        totalSpent: 450,
        erpnextSynced: false,
        erpnextCustomerId: null,
      },
    ];
  }

  // ========== مقارنة العملاء ==========
  compareCustomers(siteCustomers, erpnextCustomers) {
    const result = {
      toCreate: [], // عملاء في الموقع فقط
      toUpdate: [], // عملاء في النظامين (فيها تغييرات)
      alreadySynced: [], // متزامن بالفعل (لا تغييرات)
    };

    // إنشاء Map للبحث السريع في ERPNext
    const erpnextMap = new Map();
    erpnextCustomers.forEach((c) => {
      erpnextMap.set(c.email_id, c);
      erpnextMap.set(c.customer_name, c);
    });

    // فحص كل عميل في الموقع
    siteCustomers.forEach((siteCustomer) => {
      const erpnextCustomer =
        erpnextMap.get(siteCustomer.email) || erpnextMap.get(siteCustomer.name);

      if (!erpnextCustomer) {
        // العميل غير موجود في ERPNext
        result.toCreate.push(siteCustomer);
      } else {
        // العميل موجود، نفحص إذا في تغييرات
        const needsUpdate = this.checkIfNeedsUpdate(siteCustomer, erpnextCustomer);

        if (needsUpdate) {
          result.toUpdate.push({
            site: siteCustomer,
            erpnext: erpnextCustomer,
          });
        } else {
          result.alreadySynced.push(siteCustomer);
        }
      }
    });

    return result;
  }

  // فحص إذا كان العميل يحتاج تحديث
  checkIfNeedsUpdate(siteCustomer, erpnextCustomer) {
    return (
      siteCustomer.phone !== erpnextCustomer.mobile_no ||
      siteCustomer.address !== erpnextCustomer.address
    );
  }

  // ========== تنفيذ المزامنة ==========
  async syncCustomers(options = { create: true, update: true }) {
    if (this.syncInProgress) {
      return {
        success: false,
        message: 'Sync already in progress',
      };
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    const results = {
      created: [],
      updated: [],
      errors: [],
      stats: {
        total: 0,
        created: 0,
        updated: 0,
        failed: 0,
        timeMs: 0,
      },
    };

    try {
      // 1. جلب العملاء من المصدرين
      console.log('📥 Fetching customers from site...');
      const siteCustomers = await this.getSiteCustomers();

      console.log('📥 Fetching customers from ERPNext...');
      const erpnextResponse = await ERPNextService.getCustomers();
      const erpnextCustomers = erpnextResponse.success ? erpnextResponse.data : [];

      // 2. مقارنة العملاء
      console.log('🔄 Comparing customers...');
      const comparison = this.compareCustomers(siteCustomers, erpnextCustomers);

      // 3. إنشاء عملاء جدد
      if (options.create && comparison.toCreate.length > 0) {
        console.log(`➕ Creating ${comparison.toCreate.length} customers in ERPNext...`);

        for (const customer of comparison.toCreate) {
          try {
            const result = await ERPNextService.createCustomer(customer);
            if (result.success) {
              results.created.push({
                customer: customer.name,
                erpnextId: result.data.name,
              });

              // تحديث حالة العميل في الموقع
              await this.markCustomerAsSynced(customer.id, result.data.name);
            } else {
              results.errors.push({
                customer: customer.name,
                action: 'create',
                error: result.message,
              });
            }
          } catch (error) {
            results.errors.push({
              customer: customer.name,
              action: 'create',
              error: error.message,
            });
          }

          // تأخير بسيط بين الطلبات
          await this.sleep(200);
        }
      }

      // 4. تحديث العملاء الموجودين
      if (options.update && comparison.toUpdate.length > 0) {
        console.log(`🔄 Updating ${comparison.toUpdate.length} customers in ERPNext...`);

        for (const item of comparison.toUpdate) {
          try {
            const result = await ERPNextService.updateCustomer(item.erpnext.name, item.site);

            if (result.success) {
              results.updated.push({
                customer: item.site.name,
                erpnextId: item.erpnext.name,
              });
            } else {
              results.errors.push({
                customer: item.site.name,
                action: 'update',
                error: result.message,
              });
            }
          } catch (error) {
            results.errors.push({
              customer: item.site.name,
              action: 'update',
              error: error.message,
            });
          }

          await this.sleep(200);
        }
      }

      // 5. تحديث الإحصائيات
      results.stats = {
        total: siteCustomers.length,
        created: results.created.length,
        updated: results.updated.length,
        failed: results.errors.length,
        timeMs: Date.now() - startTime,
      };

      // 6. تسجيل المزامنة
      this.logSyncToStore(results);
      this.lastSync = new Date().toISOString();

      console.log('✅ Customer sync completed:', results.stats);

      return {
        success: true,
        ...results,
      };
    } catch (error) {
      console.error('❌ Customer sync failed:', error);

      return {
        success: false,
        message: error.message,
        errors: [
          {
            action: 'sync',
            error: error.message,
          },
        ],
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  // ========== دوال مساعدة ==========

  // تأخير
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // تحديث حالة العميل في الموقع
  async markCustomerAsSynced(customerId, erpnextId) {
    // هنا هتعدل store بتاع العملاء
    // مثلاً: store.commit('users/SET_CUSTOMER_SYNCED', { id: customerId, erpnextId })
    console.log(`✅ Customer ${customerId} synced to ERPNext as ${erpnextId}`);
    return true;
  }

  // تسجيل المزامنة في Vuex
  logSyncToStore(results) {
    const syncRecord = {
      id: Date.now(),
      type: 'customers',
      timestamp: new Date().toISOString(),
      stats: results.stats,
      errors: results.errors.length,
    };

    // store.commit('integration/ADD_SYNC_HISTORY', syncRecord);
    console.log('📝 Sync record:', syncRecord);
  }

  // ========== دوال للتحكم في المزامنة ==========

  // مزامنة عميل واحد
  async syncSingleCustomer(customerId) {
    const siteCustomers = await this.getSiteCustomers();
    const customer = siteCustomers.find((c) => c.id === customerId);

    if (!customer) {
      return {
        success: false,
        message: 'Customer not found',
      };
    }

    const erpnextResponse = await ERPNextService.getCustomers();
    const erpnextCustomers = erpnextResponse.data || [];

    const existing = erpnextCustomers.find(
      (c) => c.email_id === customer.email || c.customer_name === customer.name
    );

    if (existing) {
      return await ERPNextService.updateCustomer(existing.name, customer);
    } else {
      return await ERPNextService.createCustomer(customer);
    }
  }

  // جلب حالة المزامنة
  getSyncStatus() {
    return {
      inProgress: this.syncInProgress,
      lastSync: this.lastSync,
      stats: this.syncStats,
    };
  }

  // إعادة تعيين الإحصائيات
  resetStats() {
    this.syncStats = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
    };
  }
}

export default new CustomerSyncService();
