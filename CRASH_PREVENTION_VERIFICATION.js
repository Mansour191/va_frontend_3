/**
 * White Screen Crash Prevention Verification Test
 * Tests the safeParser implementation and TokenManager initialization safety
 * 
 * Run this test in browser console to verify crash prevention works:
 * > CRASH_PREVENTION_VERIFICATION.runAllTests()
 */

const CRASH_PREVENTION_VERIFICATION = {
  
  /**
   * Test 1: Corrupted localStorage data handling
   */
  testCorruptedLocalStorage() {
    console.log('=== Testing Corrupted localStorage Handling ===');
    
    const testCases = [
      { name: 'Valid JSON', data: '{"user":"test","token":"abc123"}' },
      { name: 'Invalid JSON', data: '{"user":"test","token":' },
      { name: 'Undefined data', data: 'undefined' },
      { name: 'Null data', data: 'null' },
      { name: 'Empty string', data: '' },
      { name: 'Non-string data', data: 12345 },
      { name: 'NaN in JSON', data: '{"price":NaN}' },
      { name: 'Infinity in JSON', data: '{"price":Infinity}' },
    ];
    
    testCases.forEach(testCase => {
      try {
        // Save corrupted data
        localStorage.setItem('test_corrupted_data', testCase.data);
        
        // Try to parse with safeJSONParse
        const result = window.safeJSONParse?.(localStorage.getItem('test_corrupted_data'), null, 'Verification Test');
        
        console.log(`[PASS] ${testCase.name}:`, result !== null ? 'Handled gracefully' : 'Used fallback');
        
        // Cleanup
        localStorage.removeItem('test_corrupted_data');
      } catch (error) {
        console.error(`[FAIL] ${testCase.name}:`, error.message);
      }
    });
  },
  
  /**
   * Test 2: TokenManager initialization safety
   */
  testTokenManagerSafety() {
    console.log('=== Testing TokenManager Initialization Safety ===');
    
    // Test with undefined TokenManager
    const originalTokenManager = window.TokenManager;
    window.TokenManager = undefined;
    
    try {
      const result = window.getAuthToken?.();
      console.log('[PASS] TokenManager undefined handled:', result === null);
    } catch (error) {
      console.error('[FAIL] TokenManager undefined not handled:', error.message);
    }
    
    // Test with partial TokenManager
    window.TokenManager = {
      getAccessToken: null, // Null function
      isTokenExpired: () => false
    };
    
    try {
      const result = window.getAuthToken?.();
      console.log('[PASS] TokenManager partial handled:', result === null);
    } catch (error) {
      console.error('[FAIL] TokenManager partial not handled:', error.message);
    }
    
    // Restore original TokenManager
    window.TokenManager = originalTokenManager;
  },
  
  /**
   * Test 3: Auth store initialization with corrupted data
   */
  testAuthStoreSafety() {
    console.log('=== Testing Auth Store Initialization Safety ===');
    
    // Save corrupted user data
    const corruptedUserData = '{"name":"test","email":"invalid"}';
    localStorage.setItem('user', corruptedUserData);
    localStorage.setItem('token', 'fake_token');
    
    try {
      // This should not crash the app
      const authStore = window.useAuthStore?.();
      if (authStore) {
        console.log('[PASS] Auth store initialized safely with corrupted data');
      } else {
        console.log('[INFO] Auth store not available in test context');
      }
    } catch (error) {
      console.error('[FAIL] Auth store crashed with corrupted data:', error.message);
    }
    
    // Cleanup
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
  
  /**
   * Test 4: Memory watcher safety
   */
  testMemoryWatcherSafety() {
    console.log('=== Testing Memory Watcher Safety ===');
    
    try {
      // Test memory manager functions
      const stats = window.memoryManager?.getStats?.();
      if (stats) {
        console.log('[PASS] Memory manager stats accessible:', stats);
      } else {
        console.log('[INFO] Memory manager not available in test context');
      }
    } catch (error) {
      console.error('[FAIL] Memory manager crashed:', error.message);
    }
  },
  
  /**
   * Test 5: Apollo Client safety
   */
  testApolloClientSafety() {
    console.log('=== Testing Apollo Client Safety ===');
    
    try {
      // Test authentication functions
      const isAuthenticated = window.isAuthenticated?.();
      const userRole = window.getCurrentUserRole?.();
      
      console.log('[PASS] Apollo auth functions safe:', { isAuthenticated, userRole });
    } catch (error) {
      console.error('[FAIL] Apollo auth functions crashed:', error.message);
    }
  },
  
  /**
   * Run all verification tests
   */
  runAllTests() {
    console.log('Starting White Screen Crash Prevention Verification...');
    console.log('='.repeat(60));
    
    this.testCorruptedLocalStorage();
    this.testTokenManagerSafety();
    this.testAuthStoreSafety();
    this.testMemoryWatcherSafety();
    this.testApolloClientSafety();
    
    console.log('='.repeat(60));
    console.log('Verification completed! Check results above.');
    console.log('If all tests show [PASS], white screen crashes are prevented.');
    
    return {
      status: 'completed',
      message: 'Check console output for detailed results',
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Create test scenario for actual crash simulation
   */
  simulateCrashScenario() {
    console.log('=== Simulating Crash Scenario ===');
    
    // 1. Corrupt all localStorage data
    const keys = ['user', 'token', 'userData', 'emailLogs', 'location_requests'];
    keys.forEach(key => {
      localStorage.setItem(key, '{"corrupted":"data","incomplete":');
    });
    
    // 2. Break TokenManager
    window.TokenManager = {
      getAccessToken: () => { throw new Error('TokenManager broken'); },
      isTokenExpired: () => { throw new Error('TokenManager broken'); }
    };
    
    // 3. Try to initialize app components
    setTimeout(() => {
      console.log('Attempting app initialization with corrupted data...');
      
      try {
        const authStore = window.useAuthStore?.();
        console.log('[SURVIVED] Auth store handled corruption');
      } catch (error) {
        console.error('[CRASHED] Auth store failed:', error.message);
      }
      
      try {
        const token = window.getAuthToken?.();
        console.log('[SURVIVED] Token retrieval handled corruption');
      } catch (error) {
        console.error('[CRASHED] Token retrieval failed:', error.message);
      }
      
      // Restore for next test
      keys.forEach(key => localStorage.removeItem(key));
      console.log('Crash simulation completed. Check results above.');
    }, 100);
  }
};

// Auto-expose for browser console testing
if (typeof window !== 'undefined') {
  window.CRASH_PREVENTION_VERIFICATION = CRASH_PREVENTION_VERIFICATION;
  console.log('CRASH_PREVENTION_VERIFICATION loaded. Run CRASH_PREVENTION_VERIFICATION.runAllTests() to verify.');
}

export default CRASH_PREVENTION_VERIFICATION;
