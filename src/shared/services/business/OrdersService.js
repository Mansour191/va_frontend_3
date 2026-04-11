// Orders Service - API Integration for Orders Management
import BaseService from '@/shared/services/base/BaseService';

class OrdersService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/orders';
  }

  // Get all orders with pagination and filters
  async getOrders(params = {}) {
    try {
      const response = await this.apiRequest(this.endpoint, {
        method: 'GET',
        params
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Orders fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch orders'
      };
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${orderId}`, {
        method: 'GET'
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Order fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch order'
      };
    }
  }

  // Create new order
  async createOrder(orderData) {
    try {
      const response = await this.apiRequest(this.endpoint, {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Order created successfully'
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create order'
      };
    }
  }

  // Update order
  async updateOrder(orderId, orderData) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(orderData)
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Order updated successfully'
      };
    } catch (error) {
      console.error('Error updating order:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update order'
      };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Order status updated successfully'
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update order status'
      };
    }
  }

  // Delete order
  async deleteOrder(orderId) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${orderId}`, {
        method: 'DELETE'
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Order deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting order:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete order'
      };
    }
  }

  // Get order statistics
  async getOrderStats() {
    try {
      const response = await this.apiRequest(`${this.endpoint}/stats`, {
        method: 'GET'
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Order statistics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch order statistics'
      };
    }
  }

  // Export orders
  async exportOrders(params = {}) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/export`, {
        method: 'GET',
        params
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Orders exported successfully'
      };
    } catch (error) {
      console.error('Error exporting orders:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to export orders'
      };
    }
  }

  // Send invoice
  async sendInvoice(orderId, emailData = {}) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${orderId}/invoice`, {
        method: 'POST',
        body: JSON.stringify(emailData)
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Invoice sent successfully'
      };
    } catch (error) {
      console.error('Error sending invoice:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send invoice'
      };
    }
  }

  // Print order
  async printOrder(orderId) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${orderId}/print`, {
        method: 'GET'
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Order print data fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching print data:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch print data'
      };
    }
  }

  // Bulk operations
  async bulkUpdateStatus(orderIds, status) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/bulk-status`, {
        method: 'PATCH',
        body: JSON.stringify({ orderIds, status })
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Bulk status update successful'
      };
    } catch (error) {
      console.error('Error updating bulk status:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update bulk status'
      };
    }
  }

  async bulkDelete(orderIds) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/bulk-delete`, {
        method: 'DELETE',
        body: JSON.stringify({ orderIds })
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Bulk delete successful'
      };
    } catch (error) {
      console.error('Error bulk deleting:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to bulk delete orders'
      };
    }
  }
}

// Export singleton instance
const ordersServiceInstance = new OrdersService();
export default ordersServiceInstance;
export { OrdersService };
