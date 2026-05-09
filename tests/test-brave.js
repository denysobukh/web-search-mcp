#!/usr/bin/env node

// Test Brave search independently
import { chromium } from 'playwright';

async function testBrave() {
  console.warn('=== TESTING BRAVE SEARCH ===');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
  });
  
  const page = await context.newPage();
  
  try {
    const query = 'javascript tutorial';
    const searchUrl = `https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`;
    console.warn(`Navigating to: ${searchUrl}`);
    
    const startTime = Date.now();
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    await page.waitForTimeout(2000); // Wait for any dynamic content
    
    const html = await page.content();
    console.warn(`✓ Page loaded successfully in ${loadTime}ms`);
    console.warn(`✓ HTML length: ${html.length} characters`);
    
    // Check for bot detection
    const title = await page.title();
    console.warn(`✓ Page title: ${title}`);
    
    if (title.includes('Access Denied') || title.includes('Captcha') || 
        html.includes('unusual traffic') || html.includes('blocked') ||
        html.length < 1000) {
      console.warn('❌ Bot detection detected');
      console.warn('Sample HTML:', html.substring(0, 500));
      return false;
    }
    
    // Try multiple selectors for Brave results
    const resultSelectors = [
      '[data-type="web"]',     // Brave specific
      '.result',               // Generic
      '.fdb',                  // Brave format
      '.snippet',              // Alternative
      'div[data-pos]'          // Position-based
    ];
    
    let resultElements = [];
    let workingSelector = '';
    
    for (const selector of resultSelectors) {
      resultElements = await page.$$(selector);
      console.warn(`✓ Found ${resultElements.length} elements with selector: ${selector}`);
      if (resultElements.length > 0) {
        workingSelector = selector;
        break;
      }
    }
    
    if (resultElements.length > 0) {
      console.warn('\n--- SAMPLE RESULTS ---');
      for (let i = 0; i < Math.min(3, resultElements.length); i++) {
        // Try multiple title selectors for Brave
        const titleSelectors = [
          'h2 a',              // Common format
          '.title a',          // Brave specific
          '.result-title a',   // Alternative
          'a[data-testid]',    // Test ID format
          'h3 a'               // Fallback
        ];
        
        const snippetSelectors = [
          '.snippet-content',   // Brave specific
          '.snippet',          // Generic
          '.description',      // Alternative
          'p'                  // Fallback
        ];
        
        let title = 'No title';
        let url = 'No URL';
        let snippet = 'No snippet';
        
        for (const titleSel of titleSelectors) {
          const titleElement = await resultElements[i].$(titleSel);
          if (titleElement) {
            title = await titleElement.textContent() || 'No title';
            url = await titleElement.getAttribute('href') || 'No URL';
            break;
          }
        }
        
        for (const snippetSel of snippetSelectors) {
          const snippetElement = await resultElements[i].$(snippetSel);
          if (snippetElement) {
            snippet = await snippetElement.textContent() || 'No snippet';
            break;
          }
        }
        
        console.warn(`${i + 1}. ${title.trim()}`);
        console.warn(`   URL: ${url}`);
        console.warn(`   Snippet: ${snippet.trim().substring(0, 100)}...`);
        console.warn('');
      }
      
      console.warn('✅ BRAVE SEARCH: SUCCESS');
      return true;
    } else {
      console.warn('❌ No results found');
      console.warn('Sample HTML:', html.substring(0, 1000));
      return false;
    }

  } catch (error) {
    console.warn(`❌ BRAVE SEARCH FAILED: ${error.message}`);
    return false;
  } finally {
    await browser.close();
  }
}

testBrave().then(success => {
  console.warn(`\nBRAVE RESULT: ${success ? 'WORKING ✅' : 'FAILED ❌'}`);
  process.exit(success ? 0 : 1);
});