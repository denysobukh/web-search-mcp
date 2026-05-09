#!/usr/bin/env node

// Test Bing search independently
import { chromium } from 'playwright';

async function testBing() {
  console.warn('=== TESTING BING SEARCH ===');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
  });
  
  const page = await context.newPage();
  
  try {
    const query = 'javascript tutorial';
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=5`;
    console.warn(`Navigating to: ${searchUrl}`);
    
    const startTime = Date.now();
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    const html = await page.content();
    console.warn(`✓ Page loaded successfully in ${loadTime}ms`);
    console.warn(`✓ HTML length: ${html.length} characters`);
    
    // Check for bot detection
    const title = await page.title();
    console.warn(`✓ Page title: ${title}`);
    
    if (title.includes('Access Denied') || title.includes('Captcha') || html.includes('unusual traffic')) {
      console.warn('❌ Bot detection detected');
      return false;
    }
    
    // Parse results
    const resultElements = await page.$$('.b_algo');
    console.warn(`✓ Found ${resultElements.length} .b_algo elements`);
    
    if (resultElements.length > 0) {
      console.warn('\n--- SAMPLE RESULTS ---');
      for (let i = 0; i < Math.min(3, resultElements.length); i++) {
        const titleElement = await resultElements[i].$('h2 a');
        const snippetElement = await resultElements[i].$('.b_caption p');
        
        const title = titleElement ? await titleElement.textContent() : 'No title';
        const url = titleElement ? await titleElement.getAttribute('href') : 'No URL';
        const snippet = snippetElement ? await snippetElement.textContent() : 'No snippet';
        
        console.warn(`${i + 1}. ${title?.trim()}`);
        console.warn(`   URL: ${url}`);
        console.warn(`   Snippet: ${snippet?.trim().substring(0, 100)}...`);
        console.warn('');
      }
      
      console.warn('✅ BING SEARCH: SUCCESS');
      return true;
    } else {
      console.warn('❌ No results found');
      return false;
    }

  } catch (error) {
    console.warn(`❌ BING SEARCH FAILED: ${error.message}`);
    return false;
  } finally {
    await browser.close();
  }
}

testBing().then(success => {
  console.warn(`\nBING RESULT: ${success ? 'WORKING ✅' : 'FAILED ❌'}`);
  process.exit(success ? 0 : 1);
});