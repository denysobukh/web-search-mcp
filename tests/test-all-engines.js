#!/usr/bin/env node

/**
 * Comprehensive test script for all search engines
 * Tests Bing, Brave, and DuckDuckGo search functionality
 */

import { SearchEngine } from '../dist/search-engine.js';

async function testSearchEngine(query = 'javascript programming', numResults = 3) {
  console.warn('🔍 Testing Web Search MCP Server - All Engines');
  console.warn('===============================================');
  console.warn(`Query: "${query}"`);
  console.warn(`Expected results: ${numResults}`);
  console.warn('');

  const searchEngine = new SearchEngine();

  try {
    const startTime = Date.now();
    const result = await searchEngine.search({
      query,
      numResults,
      timeout: 15000 // 15 second timeout
    });
    const endTime = Date.now();

    console.warn(`⚡ Search completed in ${endTime - startTime}ms`);
    console.warn(`🎯 Engine used: ${result.engine}`);
    console.warn(`📊 Results found: ${result.results.length}`);
    console.warn('');

    if (result.results.length === 0) {
      console.warn('❌ No results found!');
      return false;
    }

    console.warn('📋 Results:');
    console.warn('===========');
    
    result.results.forEach((item, index) => {
      console.warn(`${index + 1}. ${item.title}`);
      console.warn(`   🔗 ${item.url}`);
      console.warn(`   📝 ${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}`);
      console.warn('');
    });

    // Validate results
    const validResults = result.results.filter(r => 
      r.title && 
      r.title !== 'No title' && 
      r.url && 
      r.url.startsWith('http') &&
      r.description &&
      r.description !== 'No description available'
    );

    console.warn(`✅ Valid results: ${validResults.length}/${result.results.length}`);
    
    if (validResults.length === 0) {
      console.warn('❌ No valid results found!');
      return false;
    }

    return true;

  } catch (error) {
    console.error('❌ Search failed:', error.message);
    return false;
  } finally {
    await searchEngine.closeAll();
  }
}

async function runTests() {
  console.warn('🧪 Running comprehensive search engine tests...');
  console.warn('================================================');

  const testQueries = [
    'javascript programming',
    'climate change effects',
    'machine learning basics'
  ];

  let passedTests = 0;
  const totalTests = testQueries.length;

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.warn(`\n🔍 Test ${i + 1}/${totalTests}: "${query}"`);
    console.warn('─'.repeat(50));
    
    const success = await testSearchEngine(query, 5);
    if (success) {
      passedTests++;
      console.warn('✅ Test PASSED');
    } else {
      console.warn('❌ Test FAILED');
    }
    
    if (i < testQueries.length - 1) {
      console.warn('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.warn('\n🏁 Test Summary');
  console.warn('===============');
  console.warn(`Tests passed: ${passedTests}/${totalTests}`);
  console.warn(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.warn('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.warn('⚠️  Some tests failed');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testSearchEngine, runTests };