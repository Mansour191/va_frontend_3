import ERPNextService from './ERPNextService';
import store from '@/store';
import { safeJSONParse, safeJSONStringify } from '@/shared/utils/safeParser.js';

class ProductSyncService {
  constructor() {
    this.syncInProgress = false;
    this.lastSync = null;
    this.syncStats = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
    };
  }

  // ========== جلب المنتجات من الموقع ==========
  async getSiteProducts() {
    // هنا بنجيب المنتجات من Vuex store بتاع الموقع
    // افترض أن المنتجات مخزنة في store.state.products
    const products = store.state.products?.products || [];

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('No real products found in store. Mock fallback disabled for live sync.');
    }

    return products;
  }

  // ========== مقارنة المنتجات ==========
  compareProducts(siteProducts, erpnextProducts) {
    const result = {
      toCreate: [], // منتجات موجودة في الموقع بس مش في ERPNext
      toUpdate: [], // منتجات موجودة في الاتنين
      toDelete: [], // منتجات في ERPNext بس مش في الموقع (اختياري)
      alreadySynced: [], // منتجات متزامنة بالفعل
    };

    // إنشاء Map للبحث السريع في ERPNext
    const erpnextMap = new Map();
    erpnextProducts.forEach((p) => {
      erpnextMap.set(p.item_code, p);
      erpnextMap.set(p.item_name, p); // كمان بالاسم
    });

    // فحص كل منتج في الموقع
    siteProducts.forEach((siteProduct) => {
      // ابحث في ERPNext باستخدام SKU أو الاسم
      const erpnextProduct = erpnextMap.get(siteProduct.sku) || erpnextMap.get(siteProduct.name);

      if (!erpnextProduct) {
        // المنتج مش موجود في ERPNext
        result.toCreate.push(siteProduct);
      } else {
        // المنتج موجود، نفحص إذا في تغييرات
        const needsUpdate = this.checkIfNeedsUpdate(siteProduct, erpnextProduct);

        if (needsUpdate) {
          result.toUpdate.push({
            site: siteProduct,
            erpnext: erpnextProduct,
          });
        } else {
          result.alreadySynced.push(siteProduct);
        }
      }
    });

    // اختياري: فحص المنتجات الموجودة في ERPNext ومش في الموقع
    erpnextProducts.forEach((erpProduct) => {
      const exists = siteProducts.some(
        (p) => p.sku === erpProduct.item_code || p.name === erpProduct.item_name
      );
      if (!exists) {
        result.toDelete.push(erpProduct);
      }
    });

    return result;
  }

  // فحص إذا كان المنتج يحتاج تحديث
  checkIfNeedsUpdate(siteProduct, erpnextProduct) {
    const sitePrice = Number(siteProduct.price ?? siteProduct.base_price ?? 0);
    const erpPrice = Number(erpnextProduct.standard_rate ?? 0);
    const siteDesc = siteProduct.description || siteProduct.description_en || '';
    const erpDesc = erpnextProduct.description || '';
    return (
      sitePrice !== erpPrice ||
      siteProduct.name !== erpnextProduct.item_name ||
      siteDesc !== erpDesc
    );
  }

  toERPItemPayload(product) {
    return {
      item_code: product.sku || product.slug || `PROD-${product.id}`,
      item_name: product.name || product.name_en || product.nameEn || '',
      item_group: product.category || product.categorySlug || 'All Item Groups',
      stock_uom: product.uom || 'Unit',
      standard_rate: Number(product.price ?? product.base_price ?? 0),
      actual_qty: Number(product.stock ?? 0),
      description: product.description || product.description_en || product.description_ar || '',
      image: product.image || '',
      custom_texture: product.texture || product.marbleTexture || '',
      custom_design: product.customDesign || '',
    };
  }

  // ========== تنفيذ المزامنة ==========
  async syncProducts(options = { create: true, update: true, delete: false }) {
    const normalizedOptions = typeof options === 'function'
      ? { create: true, update: true, delete: false }
      : options;
    if (this.syncInProgress) {
      console.log('⚠️ Product sync already in progress');
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
      deleted: [],
      errors: [],
      stats: {
        total: 0,
        created: 0,
        updated: 0,
        deleted: 0,
        failed: 0,
        timeMs: 0,
      },
    };

    try {
      // 1. جلب المنتجات من المصدرين
      console.log('📥 Fetching products from site...');
      const siteProducts = await this.getSiteProducts();

      console.log('📥 Fetching products from ERPNext...');
      const erpnextResponse = await ERPNextService.getProducts();
      const erpnextProducts = erpnextResponse.success ? erpnextResponse.data : [];

      // 2. مقارنة المنتجات
      console.log('🔄 Comparing products...');
      const comparison = this.compareProducts(siteProducts, erpnextProducts);

      // 3. إنشاء المنتجات الجديدة
      if (normalizedOptions.create && comparison.toCreate.length > 0) {
        console.log(`➕ Creating ${comparison.toCreate.length} products in ERPNext...`);

        for (const product of comparison.toCreate) {
          try {
            this.updateProductSyncStatus(product.id, 'in_progress');
            const payload = this.toERPItemPayload(product);
            const result = await ERPNextService.createProduct(payload);
            if (result.success) {
              results.created.push({
                product: product.name,
                erpnextCode: result.data?.item_code || payload.item_code,
              });

              // تحديث حالة المنتج في الموقع
              await this.markProductAsSynced(product.id, result.data?.item_code || payload.item_code);
            } else {
              this.updateProductSyncStatus(product.id, 'failed', result.message);
              results.errors.push({
                product: product.name,
                action: 'create',
                error: result.message,
              });
            }
          } catch (error) {
            this.updateProductSyncStatus(product.id, 'failed', error.message);
            results.errors.push({
              product: product.name,
              action: 'create',
              error: error.message,
            });
          }

          // تأخير بسيط بين الطلبات
          await this.sleep(200);
        }
      }

      // 4. تحديث المنتجات الموجودة
      if (normalizedOptions.update && comparison.toUpdate.length > 0) {
        console.log(`🔄 Updating ${comparison.toUpdate.length} products in ERPNext...`);

        for (const item of comparison.toUpdate) {
          try {
            this.updateProductSyncStatus(item.site.id, 'in_progress');
            const payload = this.toERPItemPayload(item.site);
            const result = await ERPNextService.updateProduct(item.erpnext.item_code, payload);

            if (result.success) {
              results.updated.push({
                product: item.site.name,
                erpnextCode: item.erpnext.item_code,
              });
              this.updateProductSyncStatus(item.site.id, 'success', '', item.erpnext.item_code);
            } else {
              this.updateProductSyncStatus(item.site.id, 'failed', result.message);
              results.errors.push({
                product: item.site.name,
                action: 'update',
                error: result.message,
              });
            }
          } catch (error) {
            this.updateProductSyncStatus(item.site.id, 'failed', error.message);
            results.errors.push({
              product: item.site.name,
              action: 'update',
              error: error.message,
            });
          }

          await this.sleep(200);
        }
      }

      // 5. حذف المنتجات (اختياري)
      if (normalizedOptions.delete && comparison.toDelete.length > 0) {
        console.log(`🗑️ Deleting ${comparison.toDelete.length} products from ERPNext...`);
        // تنفيذ الحذف إذا أردت
      }

      // 6. تحديث الإحصائيات
      results.stats = {
        total: siteProducts.length,
        created: results.created.length,
        updated: results.updated.length,
        deleted: results.deleted.length,
        failed: results.errors.length,
        timeMs: Date.now() - startTime,
      };

      // 7. تسجيل المزامنة في Vuex
      this.logSyncToStore(results);

      console.log('✅ Product sync completed:', results.stats);

      return {
        success: true,
        ...results,
      };
    } catch (error) {
      console.error('❌ Product sync failed:', error);

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
      this.lastSync = new Date().toISOString();
    }
  }

  // ========== دوال مساعدة ==========

  // تأخير
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // تحديث حالة المنتج في الموقع
  async markProductAsSynced(productId, erpnextCode) {
    this.updateProductSyncStatus(productId, 'success', '', erpnextCode);
    return true;
  }

  updateProductSyncStatus(productId, status, error = '', erpnextCode = null) {
    const storageKey = 'erpnext_product_sync_status';
    const current = safeJSONParse(localStorage.getItem(storageKey), '{}', 'ProductSyncService.js:updateProductSyncStatus');
    current[productId] = {
      sync_status: status,
      erpnext_item_code: erpnextCode,
      last_error: error || '',
      synced_at: status === 'success' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, safeJSONStringify(current, '{}', 'ProductSyncService.js:updateProductSyncStatus'));
  }

  // تسجيل المزامنة في Vuex
  logSyncToStore(results) {
    const syncRecord = {
      id: Date.now(),
      type: 'products',
      timestamp: new Date().toISOString(),
      stats: results.stats,
      errors: results.errors.length,
    };

    // store.commit('integration/ADD_SYNC_HISTORY', syncRecord);
    console.log('📝 Sync record:', syncRecord);
  }

  // ========== دوال للتحكم في المزامنة ==========

  // مزامنة منتج واحد
  async syncSingleProduct(productId) {
    const siteProducts = await this.getSiteProducts();
    const product = siteProducts.find((p) => p.id === productId);

    if (!product) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    const erpnextResponse = await ERPNextService.getProducts();
    const erpnextProducts = erpnextResponse.data || [];

    const existing = erpnextProducts.find(
      (p) => p.item_code === product.sku || p.item_name === product.name
    );

    if (existing) {
      return await ERPNextService.updateProduct(existing.item_code, product);
    } else {
      return await ERPNextService.createProduct(product);
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
      skipped: 0,
    };
  }
}

export default new ProductSyncService();
