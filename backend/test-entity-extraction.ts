import { TextAnalyzer } from './src/services/analysis/textAnalyzer.js';
import { getOpenRouterClient } from './src/services/llm/openRouterClient.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleText = `### Pulse of the Crypto Community (Past 48 Hours)
Based on an analysis of discussions across reputable forums like Reddit's r/CryptoMarkets, r/ethereum, and r/Cryptocurrency, as well as real-time sentiment on X (formerly Twitter), the crypto community shows strong bullish momentum toward established Layer-1 protocols and utility-driven altcoins. Sentiment data from aggregated posts (e.g., AI-driven rankings and user threads) highlights a rotation from Bitcoin toward alts amid expectations of a broader bull run in 2025, fueled by regulatory optimism and ecosystem developments. The top recurring themes include AI integration, scalability upgrades, and cross-chain interoperability.

Key bullish cryptos surfacing in the past 48 hours (Dec 6-8, 2025): NEAR Protocol (NEAR), Solana (SOL), Ethereum (ETH), Kaspa (KAS), and Internet Computer (ICP). These were ranked highest in multiple sentiment scans (e.g., NEAR at 93.9% bullish score), with frequent mentions in threads debating "top alts for December breakout" and "bullish picks post-shakeout."

#### 1. NEAR Protocol (NEAR)
**Top Reasons for Bullishness:**
- **Unmatched Scalability and Developer Tools:** Community highlights NEAR's sharding tech and low-cost transactions as ideal for mass adoption, with recent integrations like Sweatcoin drawing in non-crypto users.
- **Growing Ecosystem Momentum:** Partnerships with projects like Orderly Network and AI-focused dApps are seen as under-the-radar catalysts, positioning NEAR as a "quiet giant" in DeFi and Web3 gaming.`;

async function testEntityExtraction() {
  console.log('🧪 Testing Entity Extraction\n');
  console.log('📝 Sample text length:', sampleText.length, 'characters\n');
  
  try {
    const llmClient = getOpenRouterClient();
    const analyzer = new TextAnalyzer(llmClient);
    
    console.log('🔍 Extracting entities...\n');
    const startTime = Date.now();
    
    const entities = await analyzer.extractEntities(sampleText);
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Extraction completed in ${duration}ms\n`);
    console.log(`📊 Total entities extracted: ${entities.length}\n`);
    
    if (entities.length > 0) {
      console.log('📋 First 10 entities:\n');
      entities.slice(0, 10).forEach((entity, index) => {
        console.log(`${index + 1}. ${entity.id}: "${entity.text}" (${entity.type})`);
        console.log(`   Importance: ${entity.importance}`);
        console.log(`   Context: ${entity.context}`);
        console.log(`   Mentions: ${entity.mentions.length}`);
        console.log('');
      });
      
      console.log('\n🔗 Testing relationship detection...\n');
      const relationships = await analyzer.detectRelationships(sampleText, entities);
      
      console.log(`✅ Total relationships detected: ${relationships.length}\n`);
      
      if (relationships.length > 0) {
        console.log('📋 First 5 relationships:\n');
        relationships.slice(0, 5).forEach((rel, index) => {
          const sourceEntity = entities.find(e => e.id === rel.source);
          const targetEntity = entities.find(e => e.id === rel.target);
          
          console.log(`${index + 1}. ${rel.id}: ${sourceEntity?.text || rel.source} --[${rel.type}]--> ${targetEntity?.text || rel.target}`);
          console.log(`   Strength: ${rel.strength}`);
          console.log(`   Evidence: ${rel.evidence?.[0]?.text?.substring(0, 80)}...`);
          console.log('');
        });
        
        // Check for ID mismatches
        const entityIds = new Set(entities.map(e => e.id));
        const invalidRels = relationships.filter(r => !entityIds.has(r.source) || !entityIds.has(r.target));
        
        if (invalidRels.length > 0) {
          console.log(`\n⚠️  Found ${invalidRels.length} relationships with invalid IDs:`);
          invalidRels.slice(0, 3).forEach(rel => {
            console.log(`   - ${rel.source} -> ${rel.target}`);
          });
        } else {
          console.log('\n✅ All relationships use valid entity IDs!');
        }
      } else {
        console.log('❌ No relationships detected');
      }
      
    } else {
      console.log('❌ No entities extracted - this is the problem!');
    }
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEntityExtraction();
