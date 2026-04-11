// Test script to verify service fixes
import PricingServiceClass from '@/shared/services/ai/PricingService';
import AIMonitorService from '@/shared/services/ai/AIMonitorService';

console.log('🧪 Testing Service Fixes...');

// Test 1: PricingService singleton
console.log('\n📋 Test 1: PricingService Singleton');
try {
  const pricingService1 = PricingServiceClass.getInstance();
  const pricingService2 = PricingServiceClass.getInstance();
  
  if (pricingService1 === pricingService2) {
    console.log('✅ PricingService singleton pattern working correctly');
  } else {
    console.log('❌ PricingService singleton pattern failed');
  }
} catch (error) {
  console.log('❌ PricingService singleton error:', error.message);
}

// Test 2: AIMonitorService initialization
console.log('\n📋 Test 2: AIMonitorService Initialization');
try {
  const aiMonitor = new AIMonitorService();
  console.log('✅ AIMonitorService initialized successfully');
  
  // Test service status
  setTimeout(() => {
    console.log('📊 Service Status:', aiMonitor.getServiceStatus());
  }, 5000);
} catch (error) {
  console.log('❌ AIMonitorService initialization error:', error.message);
}

console.log('\n🎯 Tests completed. Check console for any remaining errors.');
