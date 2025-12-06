import axios from 'axios';

const API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1';

async function testKey() {
  console.log('Testing OpenRouter API key...');
  console.log('Key:', API_KEY.substring(0, 20) + '...');
  
  // First, get available models
  console.log('\nFetching available models...');
  try {
    const modelsResponse = await axios.get(`${BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    const grokModels = modelsResponse.data.data.filter(m => m.id.includes('grok'));
    console.log('\nAvailable Grok models:');
    grokModels.forEach(m => console.log(`  - ${m.id}`));
    
  } catch (error) {
    console.error('Could not fetch models:', error.message);
  }
  
  // Test with a working model
  console.log('\nTesting API call with gpt-3.5-turbo...');
  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say "Hello, the API key works!"' }
        ],
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Vaisu Test'
        }
      }
    );

    console.log('\n✅ SUCCESS! API key is valid.');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('Tokens used:', response.data.usage.total_tokens);
    
  } catch (error) {
    console.error('\n❌ FAILED! API key test failed.');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n🔑 The API key is INVALID or EXPIRED.');
        console.error('Please generate a new key at: https://openrouter.ai/keys');
      } else if (error.response.status === 402) {
        console.error('\n💳 Payment required - check your OpenRouter account balance.');
      } else if (error.response.status === 429) {
        console.error('\n⏱️  Rate limit exceeded - wait a moment and try again.');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

testKey();
