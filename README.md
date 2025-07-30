# AI Content Extractor Server

A Node.js server that extracts and analyzes content from URLs using Google's Gemini AI.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with the following content:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8000
   ```

3. **Get a Gemini API key:**

   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key and paste it in your `.env` file

4. **Run the server:**
   ```bash
   npm start
   ```

## API Endpoints

### POST /api/extract

Extracts and analyzes content from a URL.

**Request body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "title": "Page Title",
  "summary": "Comprehensive summary...",
  "keyPoints": ["Key point 1", "Key point 2"],
  "url": "https://example.com",
  "timestamp": "2025-01-30T17:19:34.117Z",
  "status": "success"
}
```

## Error Handling

The API returns detailed error information when something goes wrong:

```json
{
  "title": "Error",
  "summary": "Failed to extract content",
  "keyPoints": [],
  "url": "https://example.com",
  "timestamp": "2025-01-30T17:19:34.117Z",
  "status": "error",
  "error": "Error details..."
}
```

## Common Issues

1. **403 Forbidden Error:** Make sure your Gemini API key is correctly set in the `.env` file
2. **Invalid URL:** Ensure the URL is properly formatted and accessible
3. **No Content Found:** Some pages may not have extractable text content
