import { GoogleGenAI } from '@google/genai';
import 'dotenv/config'

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function extractContentFromUrl(url) {
  try {
    // First, fetch the content from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Use a simple HTML parser to extract text content
    const textContent = extractTextFromHTML(html);
    
    if (!textContent || textContent.length < 100) {
      throw new Error('No meaningful content found on the page');
    }

    // Use Gemini to analyze the content
    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    };
    
    const model = 'gemini-2.5-flash-lite';
    
    const prompt = `
    Analyze the following content from a webpage and provide:
    1. A concise title (max 100 characters)
    2. A comprehensive summary (2-3 paragraphs)
    3. 5-7 key points as a bulleted list
    
    Content:
    ${textContent.substring(0, 8000)} // Limit content to avoid token limits
    
    Please format your response as JSON:
    {
      "title": "Page Title",
      "summary": "Comprehensive summary...",
      "keyPoints": [
        "Key point 1",
        "Key point 2",
        ...
      ]
    }
    `;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    const result = await genAI.models.generateContentStream({
      model,
      config,
      contents,
    });
    
    let response_text = '';
    for await (const chunk of result) {
      response_text += chunk.text;
    }
    
    // Try to parse JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response_text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      parsedResponse = {
        title: 'Content Analysis',
        summary: response_text.substring(0, 500),
        keyPoints: ['Content extracted successfully', 'AI analysis completed']
      };
    }

    return {
      title: parsedResponse.title || 'Untitled',
      summary: parsedResponse.summary || 'No summary available',
      keyPoints: Array.isArray(parsedResponse.keyPoints) ? parsedResponse.keyPoints : ['No key points available'],
      url,
      timestamp: new Date(),
      status: 'success'
    };
  } catch (error) {
    return {
      title: 'Error',
      summary: 'Failed to extract content',
      keyPoints: [],
      url,
      timestamp: new Date(),
      status: 'error',
      error: JSON.stringify({
        error: {
          message: error.message,
          code: error.code || 500,
          status: error.status || 'Internal Server Error'
        }
      })
    };
  }
}

function extractTextFromHTML(html) {
  // Remove script and style elements
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
} 