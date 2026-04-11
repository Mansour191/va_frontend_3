import ERPNextService from './ERPNextService';
import store from '@/store';

class OrderSyncService {
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

  // ========== جلب الطلبات من الموقع ==========
  async getSiteOrders() {
    const orders = store.state.orders?.orders || [];
    if (!Array.isArray(orders) || orders.length === 0) {
      throw new Error('No real orders found in store. Mock fallback disabled for live sync.');
    }
    return orders;
  }

  // ========== تحويل طلب الموقع إلى فاتورة ERPNext ==========
  transformOrderToInvoice(order) {
    const toNumber = (value) => Number(value || 0);
    const calculateArea = (width, height) => (toNumber(width) * toNumber(height)) / 10000;

    return {
      customer: order.customerEmail || order.email || order.customer,
      customer_name: order.customer || order.customerName || '',
      transaction_date: (order.date || order.created_at || new Date().toISOString()).split('T')[0],
      delivery_date: (order.date || order.created_at || new Date().toISOString()).split('T')[0],
      order_number: order.id,
      items: (order.items || []).map((item) => ({
        item_code: item.sku || item.item_code || item.productSku,
        item_name: item.name || item.item_name || '',
        qty: toNumber(item.quantity),
        rate: toNumber(item.price),
        uom: item.uom || 'Unit',
        custom_width_cm: toNumber(item.width),
        custom_height_cm: toNumber(item.height),
        custom_area_m2: calculateArea(item.width, item.height),
        custom_texture: item.texture || item.marbleTexture || '',
        custom_design: item.customDesign || item.designName || '',
      })),
      grand_total: toNumber(order.total),
      total: toNumber(order.total),
      net_total: toNumber(order.subtotal),
      subtotal: toNumber(order.subtotal),
      shipping_cost: toNumber(order.shipping),
      taxes_and_charges_total: toNumber(order.tax),
    };
  }

  // ========== مزامنة الطلبات المكتملة فقط ==========
  async syncOrders(options = { create: true }) {
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
      errors: [],
      stats: {
        total: 0,
        created: 0,
        failed: 0,
        timeMs: 0,
      },
    };

    try {
      // جلب الطلبات من الموقع
      const siteOrders = await this.getSiteOrders();

      // تصفية الطلبات المكتملة فقط وغير المتزامنة
      const pendingOrders = siteOrders.filter(
        (order) =>
          !order.erpnextSynced && (order.status === 'delivered' || order.status === 'shipped')
      );

      results.stats.total = pendingOrders.length;

      // إنشاء فواتير في ERPNext
      if (options.create && pendingOrders.length > 0) {
        console.log(`💰 Creating ${pendingOrders.length} invoices in ERPNext...`);

        for (const order of pendingOrders) {
          try {
            this.updateOrderSyncStatus(order.id, 'in_progress');
            const invoiceData = this.transformOrderToInvoice(order);
            const result = await ERPNextService.createSalesInvoice(invoiceData);

            if (result.success) {
              const invoiceName = result.data?.name || result.invoiceName || null;
              results.created.push({
                orderId: order.id,
                invoiceId: invoiceName,
              });

              // تحديث حالة الطلب في الموقع
              await this.markOrderAsSynced(order.id, invoiceName);
            } else {
              this.updateOrderSyncStatus(order.id, 'failed', result.message);
              results.errors.push({
                order: order.id,
                action: 'create',
                error: result.message,
              });
            }
          } catch (error) {
            this.updateOrderSyncStatus(order.id, 'failed', error.message);
            results.errors.push({
              order: order.id,
              action: 'create',
              error: error.message,
            });
          }

          await this.sleep(300); // تأخير بين الطلبات
        }
      }

      // تحديث الإحصائيات
      results.stats.created = results.created.length;
      results.stats.failed = results.errors.length;
      results.stats.timeMs = Date.now() - startTime;

      this.logSyncToStore(results);
      this.lastSync = new Date().toISOString();

      console.log('✅ Order sync completed:', results.stats);

      return {
        success: true,
        ...results,
      };
    } catch (error) {
      console.error('❌ Order sync failed:', error);

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

  // ========== مزامنة طلب واحد ==========
  async syncSingleOrder(orderOrId) {
    let order;
    if (typeof orderOrId === 'string') {
      const siteOrders = await this.getSiteOrders();
      order = siteOrders.find((o) => o.id === orderOrId);
    } else {
      order = orderOrId;
    }

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      };
    }

    if (order.erpnextSynced) {
      return {
        success: false,
        message: 'Order already synced',
      };
    }

    try {
      console.log('🔄 Syncing order to ERPNext:', order.id);
      const invoiceData = this.transformOrderToInvoice(order);
      const result = await ERPNextService.createSalesInvoice(invoiceData);

      if (result.success) {
        await this.markOrderAsSynced(order.id, result.invoiceName);
        return {
          success: true,
          message: 'Order synced successfully',
          invoiceId: result.invoiceName,
        };
      } else {
        console.error('❌ ERPNext Error:', result.message);
        return {
          success: false,
          message: result.message,
        };
      }
    } catch (error) {
      console.error('❌ Sync Error:', error.message);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ========== دوال مساعدة ==========
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async markOrderAsSynced(orderId, invoiceId) {
    this.updateOrderSyncStatus(orderId, 'success', '', invoiceId);
    return true;
  }

  updateOrderSyncStatus(orderId, status, error = '', invoiceId = null) {
    const storageKey = 'erpnext_order_sync_status';
    const current = JSON.parse(localStorage.getItem(storageKey) || '{}');
    current[orderId] = {
      sync_status: status,
      erpnext_invoice_id: invoiceId,
      last_error: error || '',
      synced_at: status === 'success' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(current));
  }

  logSyncToStore(results) {
    const syncRecord = {
      id: Date.now(),
      type: 'orders',
      timestamp: new Date().toISOString(),
      stats: results.stats,
      errors: results.errors.length,
    };
    console.log('📝 Sync record:', syncRecord);
  }

  getSyncStatus() {
    return {
      inProgress: this.syncInProgress,
      lastSync: this.lastSync,
      stats: this.syncStats,
    };
  }
}

export default new OrderSyncService();
