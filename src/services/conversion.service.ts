import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { environment } from '@/config/environment';

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
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction:
      'You are an expert at converting documents into structured JSON. ' +
      'Analyze the provided file and convert it into a valid JSON object based on the user\'s prompt. ' +
      'Do not include any explanatory text or markdown formatting in your response.',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          order: {
            type: SchemaType.OBJECT,
            properties: {
              id:   { type: SchemaType.STRING },
              date: { type: SchemaType.STRING },
              status: { type: SchemaType.STRING },
              type: { type: SchemaType.STRING }
            }
          },
          supplier: {
            type: SchemaType.OBJECT,
            properties: {
              name:    { type: SchemaType.STRING },
              code:    { type: SchemaType.STRING },
              address: { type: SchemaType.STRING },
              phone:   { type: SchemaType.STRING, nullable: true },
              fax:     { type: SchemaType.STRING, nullable: true },
              bank: {
                type: SchemaType.OBJECT,
                properties: {
                  name:    { type: SchemaType.STRING },
                  account: { type: SchemaType.STRING },
                  holder:  { type: SchemaType.STRING }
                }
              }
            }
          },
          delivery: {
            type: SchemaType.OBJECT,
            properties: {
              destination:   { type: SchemaType.STRING },
              dateScheduled: { type: SchemaType.STRING },
              timeScheduled: { type: SchemaType.STRING },
              doorTime:      { type: SchemaType.STRING },
              notes: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              }
            }
          },
          items: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                lineNo:            { type: SchemaType.INTEGER },
                productName:       { type: SchemaType.STRING },
                plu:               { type: SchemaType.STRING },
                qtyOrdered_carton: { type: SchemaType.INTEGER },
                qtyOrdered_pcs:    { type: SchemaType.INTEGER },
                price_perPcs:      { type: SchemaType.NUMBER },
                discount_percent:  { type: SchemaType.NUMBER },
                netPrice_perPcs:   { type: SchemaType.NUMBER },
                totalLine_net:     { type: SchemaType.NUMBER },
                bonus:             { type: SchemaType.INTEGER },
                lst:               { type: SchemaType.INTEGER },
                remarks:           { type: SchemaType.STRING, nullable: true }
              }
            }
          },
          pricing: {
            type: SchemaType.OBJECT,
            properties: {
              subTotal:         { type: SchemaType.NUMBER },
              totalDiscount:    { type: SchemaType.NUMBER },
              netAfterDiscount: { type: SchemaType.NUMBER },
              vatInput:         { type: SchemaType.NUMBER },
              grandTotal:       { type: SchemaType.NUMBER },
              inWords:          { type: SchemaType.STRING }
            }
          }
        }
      }
    },
  });

  logger.info('Preparing file for Gemini API...');
  const filePart = await fileToGenerativePart(file, mimeType);
  logger.info('File part created successfully.');

  const requestPayload = [prompt, filePart];

  try {
    logger.info('Sending request to Gemini API for structured JSON output...');
    const result = await model.generateContent(requestPayload);
    const response = await result.response;
    logger.info('Received structured response from Gemini API.');

    const jsonString = response.text();
    logger.info({ message: 'Raw JSON string from Gemini', jsonString });

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
