import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';
import pdfParse from 'pdf-parse';

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const JUDGE_MODEL = 'openai/gpt-oss-120b:free';

if (!OPENROUTER_API_KEY) {
  console.error('FATAL: OPENROUTER_API_KEY is not set in backend/.env');
  process.exit(1);
}

const MODELS_FILE = path.resolve(__dirname, 'models.json');
const MODELS: string[] = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf-8'));

const ENTITY_GRAPH_PROMPT = `
You are a Lead Network Theorist specializing in the topology of arguments and concept drift.
Your task is to analyze the text and build a directed graph where nodes are "Logical Units" and edges are "Causal or Sequential Links".

GOAL: Map the narrative trajectory and the deep structure of the argument.

STEP 1: NODE EXTRACTION (Logical Units)
Extract core concepts or argumentative steps.
- ID: Unique string.
- Sequence: The order they appear in the text (0-indexed).
- Depth (0-10): How abstract/foundational is this concept? (10 = Core Mechanism, 1 = Surface Fact).
- Type: 'concept' (idea), 'mechanism' (process), or 'evidence' (supporting fact).

STEP 2: EDGE DETECTION (Flow)
Identify how these nodes connect.
- leads-to: Sequential flow.
- supports: Logical reinforcement.
- contrasts: Counter-point.
- expands: elaboration.
- relates-to: General thematic link.

STEP 3: SCORING
- Clarity Score: How clearly is this node defined? (0-1).
- Edge Strength: How strong is the connection? (0-1).

OUTPUT FORMAT:
Return a SINGLE valid JSON object matching this schema:
{
  "nodes": [
    {
      "id": "node-1",
      "label": "Short Title",
      "summary": "One sentence description",
      "depth": 8.5,
      "sequenceIndex": 0,
      "type": "mechanism",
      "clarityScore": 0.9
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "leads-to",
      "label": "implies",
      "strength": 0.8
    }
  ],
  "metadata": {
    "trajectory": "Description of the overall arc...",
    "depthScore": 7.2,
    "totalUnits": 15
  }
}
`;

async function callLLM(model: string, systemPrompt: string, userPrompt: string) {
  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:7002',
          'X-Title': 'Vaisu Benchmark',
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error(`Error calling ${model}:`, error.response?.data || error.message);
    return null;
  }
}

function parseJSON(content: string) {
  try {
    let cleanContent = content.trim();
    const codeBlockMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      cleanContent = codeBlockMatch[1];
    } else {
      cleanContent = cleanContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }

    const firstCurly = cleanContent.indexOf('{');
    const lastCurly = cleanContent.lastIndexOf('}');
    
    if (firstCurly !== -1 && lastCurly !== -1) {
      cleanContent = cleanContent.substring(firstCurly, lastCurly + 1);
    }

    return JSON.parse(cleanContent);
  } catch (e) {
    return null;
  }
}

async function judge(modelName: string, inputDoc: string, output: string) {
  const parsed = parseJSON(output);
  const jsonCorrectness = parsed ? 10 : 0;

  const judgePrompt = `
You are an expert evaluator of Knowledge Graphs and LLM outputs.
Assess the following LLM response based on the provided input document.

INPUT DOCUMENT:
"""
${inputDoc.substring(0, 5000)}
"""

LLM RESPONSE (from model ${modelName}):
"""
${output}
"""

Assign scores from 0 to 10 for the following criteria:
1. Exhaustivity: Does it cover all key concepts and relationships?
2. Correctness: Are the extracted concepts and relationships accurate according to the text?
3. Quality: Overall clarity, structure, and depth of the analysis.

Return your assessment as a valid JSON object:
{
  "exhaustivity": score,
  "correctness": score,
  "quality": score,
  "rationale": "short explanation"
}
`;

  const judgeResponse = await callLLM(JUDGE_MODEL, "You are a judge for LLM outputs.", judgePrompt);
  if (!judgeResponse) return null;

  const evaluation = parseJSON(judgeResponse);
  if (!evaluation) return null;

  const scores = {
    json_correctness: jsonCorrectness,
    exhaustivity: evaluation.exhaustivity || 0,
    correctness: evaluation.correctness || 0,
    quality: evaluation.quality || 0,
  };

  const avg = (scores.json_correctness + scores.exhaustivity + scores.correctness + scores.quality) / 4;

  return {
    ...scores,
    avg,
    rationale: evaluation.rationale,
  };
}

async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else {
    return buffer.toString('utf-8');
  }
}

async function run() {
  const folderPath = process.argv[2];
  if (!folderPath || !fs.existsSync(folderPath)) {
    console.error('Usage: tsx benchmark.ts <folder_path>');
    process.exit(1);
  }

  const files = fs.readdirSync(folderPath).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.md', '.pdf', '.txt', '.text'].includes(ext);
  });

  if (files.length === 0) {
    console.error('No valid files found in folder.');
    process.exit(1);
  }

  const results: any[] = [];

  for (const file of files) {
    console.log(`\nProcessing file: ${file}`);
    const filePath = path.join(folderPath, file);
    const text = await extractText(filePath);

    for (const model of MODELS) {
      console.log(`  Running model: ${model}`);
      const output = await callLLM(model, "You are a Lead Network Theorist.", `DOCUMENT CONTENT:\n${text}\n\nPROMPT:\n${ENTITY_GRAPH_PROMPT}`);
      
      if (!output) {
        console.error(`    FAILED to get response from ${model}`);
        continue;
      }

      // Save raw output
      const resultId = `${path.basename(file)}_${model.replace(/[/:]/g, '_')}`;
      fs.writeFileSync(path.join(__dirname, `${resultId}.json`), JSON.stringify({ model, file, output }, null, 2));

      console.log(`    Judging ${model}...`);
      const assessment = await judge(model, text, output);

      results.push({
        file,
        model,
        assessment,
        output_file: `${resultId}.json`
      });
    }
  }

  const summaryFile = path.join(__dirname, 'benchmark_summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
  console.log(`\nBenchmark complete. Summary saved to ${summaryFile}`);
}

run().catch(console.error);
