import emailjs from 'emailjs-com';
import AlertService from './AlertService';
import { safeJSONParse, safeJSONStringify } from '@/shared/utils/safeParser.js';

class EmailService {
  constructor() {
    this.config = {
      enabled: true,
      serviceId: process.env.VUE_APP_EMAILJS_SERVICE_ID || 'service_default',
      templateId: process.env.VUE_APP_EMAILJS_TEMPLATE_ID || 'template_default',
      userId: process.env.VUE_APP_EMAILJS_USER_ID || 'user_default',
      recipients: {
        admin: 'admin@vinylart.com',
        accountant: 'accountant@vinylart.com',
        manager: 'manager@vinylart.com',
      },
    };
    this.loadConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('emailConfig');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading email config:', e);
    }
  }

  saveConfig() {
    localStorage.setItem('emailConfig', JSON.stringify(this.config));
  }

  // إرسال بريد إلكتروني فعلي باستخدام EmailJS
  async sendEmail(options) {
    if (!this.config.enabled) {
      return { success: false, message: 'Email system disabled' };
    }

    try {
      const templateParams = {
        to_email: options.to,
        subject: options.subject,
        message: options.body,
        from_name: 'Vinyl Art Store',
      };

      // إذا كانت مفاتيح EmailJS متوفرة، أرسل فعلياً
      if (this.config.userId && this.config.userId !== 'user_default') {
        await emailjs.send(
          this.config.serviceId,
          this.config.templateId,
          templateParams,
          this.config.userId
        );
      } else {
        console.log('📝 [EmailJS Demo Mode] Sending email:', templateParams);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await AlertService.sendAlert({
        type: 'email_sent',
        severity: 'low',
        title: '📧 تم إرسال بريد إلكتروني',
        message: `إلى: ${options.to}\nالموضوع: ${options.subject}`,
      });

      this.logEmail(options);
      return { success: true };
    } catch (error) {
      console.error('📧 Error sending email:', error);
      return { success: false, message: error.message };
    }
  }

  logEmail(email) {
    const logs = safeJSONParse(localStorage.getItem('emailLogs'), '[]', 'EmailService.js:logEmail');
    logs.unshift({
      ...email,
      timestamp: new Date().toISOString(),
    });

    // retained 50 emails only
    if (logs.length > 50) logs.pop();

    localStorage.setItem('emailLogs', safeJSONStringify(logs, '[]', 'EmailService.js:logEmail'));
  }

  // إشعارات للمدير
  async notifyAdmin(type, data) {
    const messages = {
      sync_error: {
        subject: '⚠️ خطأ في مزامنة ERPNext',
        template: (data) => `حدث خطأ أثناء مزامنة ${data.entity}: ${data.error}`,
      },
      low_stock: {
        subject: '📦 تنبيه مخزون منخفض',
        template: (data) => `المنتج "${data.product}" مخزنه منخفض: ${data.stock} قطع فقط`,
      },
      new_order: {
        subject: '🛍️ طلب جديد',
        template: (data) => `تم إنشاء طلب جديد رقم ${data.orderId} بقيمة ${data.total} د.ج`,
      },
    };

    const message = messages[type];
    if (message) {
      await this.sendEmail({
        to: this.config.recipients.admin,
        subject: message.subject,
        body: message.template(data),
      });
    }
  }

  // إشعارات للمحاسب
  async notifyAccountant(type, data) {
    const messages = {
      invoice_created: {
        subject: '💰 فاتورة جديدة',
        template: (data) =>
          `تم إنشاء فاتورة رقم ${data.invoiceId} للعميل ${data.customer} بقيمة ${data.amount} د.ج`,
      },
      payment_received: {
        subject: '💳 دفعة مستلمة',
        template: (data) => `تم استلام دفعة بقيمة ${data.amount} د.ج من ${data.customer}`,
      },
    };

    const message = messages[type];
    if (message) {
      await this.sendEmail({
        to: this.config.recipients.accountant,
        subject: message.subject,
        body: message.template(data),
      });
    }
  }

  // إرسال تقارير دورية
  async sendPeriodicReport(type, data) {
    const reports = {
      daily: {
        subject: '📊 التقرير اليومي',
        template: (data) =>
          `📈 ملخص اليوم:\nمبيعات: ${data.sales} د.ج\nطلبات جديدة: ${data.orders}\nعملاء جدد: ${data.customers}`,
      },
      weekly: {
        subject: '📈 التقرير الأسبوعي',
        template: (data) =>
          `📊 ملخص الأسبوع:\nمبيعات: ${data.sales} د.ج\nأفضل منتج: ${data.topProduct}\nنمو: ${data.growth}%`,
      },
      monthly: {
        subject: '📉 التقرير الشهري',
        template: (data) =>
          `📈 ملخص الشهر:\nمبيعات: ${data.sales} د.ج\nإجمالي الأرباح: ${data.profit} د.ج\nنمو سنوي: ${data.yearlyGrowth}%`,
      },
    };

    const report = reports[type];
    if (report) {
      await this.sendEmail({
        to: this.config.recipients.manager,
        subject: report.subject,
        body: report.template(data),
      });
    }
  }

  // الحصول على سجل البريد
  getEmailLogs(limit = 20) {
    const logs = safeJSONParse(localStorage.getItem('emailLogs'), '[]', 'EmailService.js:getEmailLogs');
    return logs.slice(0, limit);
  }

  // تحديث إعدادات البريد
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }
}

export default new EmailService();
