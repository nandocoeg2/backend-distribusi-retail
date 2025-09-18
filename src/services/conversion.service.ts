import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { environment } from '@/config/environment';
import logger from '@/config/logger';
import { AppError } from '@/utils/app-error';

export class ConversionService {
  private static genAI = new GoogleGenerativeAI(environment.GOOGLE_API_KEY);

  private static model = ConversionService.genAI.getGenerativeModel({
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
              id: { type: SchemaType.STRING },
              date: { type: SchemaType.STRING },
              status: { type: SchemaType.STRING },
              type: { type: SchemaType.STRING }
            }
          },
          supplier: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING, nullable: true },
              code: { type: SchemaType.STRING, nullable: true },
              address: { type: SchemaType.STRING, nullable: true },
              phone: { type: SchemaType.STRING, nullable: true },
              fax: { type: SchemaType.STRING, nullable: true },
              bank: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING, nullable: true },
                  account: { type: SchemaType.STRING, nullable: true },
                  holder: { type: SchemaType.STRING, nullable: true }
                }
              }
            }
          },
          customers: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING, nullable: true },
              code: { type: SchemaType.STRING, nullable: true },
              address: { type: SchemaType.STRING, nullable: true },
              phone: { type: SchemaType.STRING, nullable: true },
              fax: { type: SchemaType.STRING, nullable: true },
              bank: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING, nullable: true },
                  account: { type: SchemaType.STRING, nullable: true },
                  holder: { type: SchemaType.STRING, nullable: true }
                }
              }
            }
          },
          items: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                productName: { type: SchemaType.STRING, nullable: true },
                plu: { type: SchemaType.STRING, nullable: true },
                qtyOrdered_carton: { type: SchemaType.INTEGER, nullable: true },
                price_perCarton: { type: SchemaType.NUMBER, nullable: true },
                totalLine_net: { type: SchemaType.NUMBER, nullable: true },
              }
            }
          },
        }
      }
    },
  });

  private static async fileToGenerativePart(file: Buffer, mimeType: string) {
    return {
      inlineData: {
        data: file.toString('base64'),
        mimeType,
      },
    };
  }

  static async convertFileToJson(file: Buffer, mimeType: string, prompt: string) {
    logger.info('Preparing file for Gemini API...');
    const filePart = await this.fileToGenerativePart(file, mimeType);
    logger.info('File part created successfully.');

    const requestPayload = [prompt, filePart];

    try {
      logger.info('Sending request to Gemini API for structured JSON output...');
      const result = await this.model.generateContent(requestPayload);
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
        throw new AppError('Could not parse the converted file content.', 500);
      }
    } catch (apiError) {
      logger.error('Error calling Gemini API', { error: JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)) });
      throw new AppError('Failed to get a response from the conversion service.', 502);
    }
  }
}
