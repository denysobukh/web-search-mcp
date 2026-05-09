#!/usr/bin/env node

// Simple test script to verify search functionality
import { SearchEngine } from '../dist/search-engine.js';

const searchEngine = new SearchEngine();

async function testSearch() {
  console.warn('Testing search functionality...');
  
  try {
    const result = await searchEngine.search({
      query: 'test search',
      numResults: 3,
      timeout: 15000  // 15 second timeout for testing
    });
    
    console.warn(`Search completed with engine: ${result.engine}`);
    console.warn(`Found ${result.results.length} results:`);
    
    result.results.forEach((r, i) => {
      console.warn(`${i + 1}. ${r.title}`);
      console.warn(`   URL: ${r.url}`);
      console.warn(`   Description: ${r.description.substring(0, 100)}...`);
      console.warn('');
    });
    
    // Clean up
    await searchEngine.closeAll();
    
  } catch (error) {
    console.error('Search test failed:', error);
    await searchEngine.closeAll();
    process.exit(1);
  }
}

testSearch().then(() => {
  console.warn('Test completed successfully');
  process.exit(0);
});