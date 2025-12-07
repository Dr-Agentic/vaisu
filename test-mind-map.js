#!/usr/bin/env node

/**
 * Test script to verify mind map visualization works end-to-end
 */

import fs from 'fs';

const API_BASE = 'http://localhost:3001/api';

async function testMindMap() {
  console.log('🧪 Testing Mind Map Visualization E2E\n');

  try {
    // Step 1: Read sample document
    console.log('📄 Step 1: Reading sample document...');
    const sampleText = fs.readFileSync('./sample-document.txt', 'utf-8');
    console.log(`✅ Loaded ${sampleText.length} characters\n`);

    // Step 2: Upload document
    console.log('📤 Step 2: Uploading document...');
    const uploadResponse = await fetch(`${API_BASE}/documents/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sampleText })
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const uploadData = await uploadResponse.json();
    const documentId = uploadData.document.id;
    console.log(`✅ Document uploaded with ID: ${documentId}\n`);

    // Step 3: Generate mind map visualization
    console.log('🎨 Step 3: Generating mind map visualization...');
    const vizResponse = await fetch(
      `${API_BASE}/documents/${documentId}/visualizations/mind-map`,
      { method: 'POST' }
    );

    if (!vizResponse.ok) {
      throw new Error(`Visualization failed: ${vizResponse.statusText}`);
    }

    const vizData = await vizResponse.json();
    console.log('✅ Mind map generated successfully!\n');

    // Step 4: Verify structure
    console.log('🔍 Step 4: Verifying mind map structure...');
    const mindMapData = vizData.data;
    
    console.log(`Root node: ${mindMapData.root.label}`);
    console.log(`Root children: ${mindMapData.root.children.length}`);
    console.log(`Layout: ${mindMapData.layout}`);
    console.log(`Theme: ${mindMapData.theme.primary}\n`);

    // Count total nodes
    function countNodes(node) {
      let count = 1;
      if (node.children) {
        node.children.forEach(child => {
          count += countNodes(child);
        });
      }
      return count;
    }

    const totalNodes = countNodes(mindMapData.root);
    console.log(`Total nodes in mind map: ${totalNodes}`);

    // Display tree structure
    console.log('\n📊 Mind Map Structure:');
    function printTree(node, indent = '') {
      console.log(`${indent}├─ ${node.label} (Level ${node.level})`);
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, index) => {
          const isLast = index === node.children.length - 1;
          printTree(child, indent + (isLast ? '   ' : '│  '));
        });
      }
    }
    printTree(mindMapData.root);

    console.log('\n✅ All tests passed! Mind map visualization is working correctly.');
    console.log('\n🌐 Open http://localhost:5173 in your browser to see the visualization.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testMindMap();
