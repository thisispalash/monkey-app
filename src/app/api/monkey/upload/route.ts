import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const monkeyStates = {

}


// Ensure tmp directory exists
const TMP_DIR = path.join(process.cwd(), 'tmp');
fs.mkdir(TMP_DIR, { recursive: true }).catch(console.error);

async function processImage(buffer: Buffer, filename: string): Promise<string> {
  // Save original file
  const originalPath = path.join(TMP_DIR, filename);
  await fs.writeFile(originalPath, buffer);

  // Process with OpenAI Vision
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "system",
        content: "You are an ocr engine specific to receipts. Your job is to extract all information from the receipt and return it in a structured format."
      },
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Please analyze this image and provide a detailed description of its contents. Include any text you can read, and describe any visual elements you see." 
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${buffer.toString('base64')}`,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const result = response.choices[0]?.message?.content || 'No content extracted';
  
  // Save OCR result
  const resultPath = path.join(TMP_DIR, `${path.parse(filename).name}_ocr.txt`);
  await fs.writeFile(resultPath, result);

  return result;
}

async function processPDF(buffer: Buffer, filename: string): Promise<string> {
  // Save original file
  const originalPath = path.join(TMP_DIR, filename);
  await fs.writeFile(originalPath, buffer);

  // Use OpenAI's PDF processing capability
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Please analyze this PDF and provide a detailed summary of its contents: ${buffer.toString('base64')}`,
      },
    ],
    max_tokens: 1000,
  });

  const result = response.choices[0]?.message?.content || 'No content extracted';
  
  // Save analysis result
  const resultPath = path.join(TMP_DIR, `${path.parse(filename).name}_analysis.txt`);
  await fs.writeFile(resultPath, result);

  return result;
}

async function promptEngineer(content: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert at categorizing the transactions and items on a receipt. Please categorize the transactions and items on the receipt into a structured format."
      },
      {
        role: "system",
        content: `Also mark any of the following states as true if they make sense. The states and triggers are as follows: ${JSON.stringify(monkeyStates)}`
      },
      {
        role: "user",
        content: `Given this content:\n\n${content}`
      }
    ],
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'No response generated';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    const results = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = file.name;
      const fileType = file.type;

      let extractedContent = '';

      // Process based on file type
      if (fileType.startsWith('image/')) {
        extractedContent = await processImage(buffer, filename);
      } else if (fileType === 'application/pdf') {
        extractedContent = await processPDF(buffer, filename);
      } else {
        continue; // Skip unsupported file types
      }

      // Apply prompt engineering
      const engineeredResult = await promptEngineer(extractedContent);
      
      // Save engineered result
      const engineeredPath = path.join(TMP_DIR, `${path.parse(filename).name}_engineered.txt`);
      await fs.writeFile(engineeredPath, engineeredResult);

      results.push({
        filename,
        originalContent: extractedContent,
        engineeredContent: engineeredResult,
      });
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: `Processed ${results.length} files` 
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
