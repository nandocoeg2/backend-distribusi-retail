import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '@/config/environment';
import pdf from 'pdf-parse';
import logger from '@/config/logger';

const genAI = new GoogleGenerativeAI(environment.GOOGLE_API_KEY);

async function fileToGenerativePart(file: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: file.toString('base64'),
      mimeType,
    },
  };
}

export const convertFileToJson = async (file: Buffer, mimeType: string, prompt: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let textContent = '';

  logger.info('Starting file content extraction...');
  if (mimeType === 'application/pdf') {
    const data = await pdf(file);
    textContent = data.text;
  } else {
    textContent = file.toString('utf-8');
  }
  logger.info('File content extracted successfully.');

  const fullPrompt = `${prompt}\n\n${textContent}`;

  try {
    logger.info('Sending request to Gemini API...');
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    logger.info('Received response from Gemini API.');

    const text = response.text();
    logger.info({ message: 'Raw response text from Gemini', text });

    // Clean the response to ensure it's valid JSON
    const jsonString = text.replace(/```json\n|```/g, '').trim();
    logger.info({ message: 'Cleaned JSON string', jsonString });

    try {
      const parsedJson = JSON.parse(jsonString);
      logger.info('Successfully parsed JSON response.');
      return parsedJson;
    } catch (parseError) {
      logger.error('Failed to parse JSON from Gemini response', { error: parseError, jsonString });
      throw new Error('Could not parse the converted file content.');
    }
  } catch (apiError) {
    logger.error('Error calling Gemini API', { error: apiError });
    throw new Error('Failed to get a response from the conversion service.');
  }
};
