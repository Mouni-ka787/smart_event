// Test script for AI integration
// This script tests the connection to various AI services

import { 
  getPersonalizedRecommendations,
  getRecommendationsBasedOnHistory,
  getTrendingServices,
  getPriceOptimizationSuggestions,
  getTopPerformingVendors,
  getVendorMatchmakingSuggestions,
  getServicePerformanceSummary,
  getBundleSuggestions,
  getWeakServiceAlerts
} from './aiRecommendations';

async function testAIIntegration() {
  console.log('Testing AI Integration...\n');
  
  try {
    // Test personalized recommendations
    console.log('1. Testing personalized recommendations...');
    const personalized = await getPersonalizedRecommendations('test-user-123', {
      categories: ['Food & Beverage', 'Photography'],
      budgetRange: { min: 100, max: 1000 }
    });
    console.log('Personalized recommendations:', personalized.map(s => s.name));
    
    // Test history-based recommendations
    console.log('\n2. Testing history-based recommendations...');
    const historyBased = await getRecommendationsBasedOnHistory('test-user-123', ['Photography']);
    console.log('History-based recommendations:', historyBased.map(s => s.name));
    
    // Test trending services
    console.log('\n3. Testing trending services...');
    const trending = await getTrendingServices();
    console.log('Trending services:', trending.map(s => s.name));
    
    // Test price optimization
    console.log('\n4. Testing price optimization...');
    const priceSuggestion = await getPriceOptimizationSuggestions('vendor1', 'Food & Beverage');
    console.log('Price suggestion:', priceSuggestion);
    
    // Test top performing vendors
    console.log('\n5. Testing top performing vendors...');
    const topVendors = await getTopPerformingVendors();
    console.log('Top vendors:', topVendors.map(v => v.vendorId));
    
    // Test vendor matchmaking
    console.log('\n6. Testing vendor matchmaking...');
    const matchmaking = await getVendorMatchmakingSuggestions('vendor1', { lat: 40.7128, lng: -74.0060 });
    console.log('Matchmaking suggestions:', matchmaking.map(m => m.name));
    
    // Test service performance summary
    console.log('\n7. Testing service performance summary...');
    const performance = await getServicePerformanceSummary('vendor1');
    console.log('Performance summary:', performance?.insights);
    
    // Test bundle suggestions
    console.log('\n8. Testing bundle suggestions...');
    const bundles = await getBundleSuggestions([]);
    console.log('Bundle suggestions:', bundles.map(b => b.name));
    
    // Test weak service alerts
    console.log('\n9. Testing weak service alerts...');
    const alerts = await getWeakServiceAlerts();
    console.log('Weak service alerts:', alerts.map(a => a.serviceName));
    
    console.log('\n✅ All AI integration tests completed successfully!');
  } catch (error) {
    console.error('❌ AI integration test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAIIntegration();
}

export default testAIIntegration;