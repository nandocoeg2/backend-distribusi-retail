import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { environment } from '@/config/environment';
import logger from '@/config/logger';
import { AppError } from '@/utils/app-error';

export class ConversionService {
  private static genAI = new GoogleGenerativeAI(environment.GOOGLE_API_KEY);

  // Schema untuk bulk purchase order processing
  private static bulkPurchaseOrderSchema = {
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
  };

  // Schema untuk laporan penerimaan barang
  private static laporanPenerimaanBarangSchema = {
    type: SchemaType.OBJECT,
    properties: {
      fppNumber: { type: SchemaType.STRING },
      orderDate: { type: SchemaType.STRING },
      deliveryDate: { type: SchemaType.STRING },
      deliveryTime: { type: SchemaType.STRING },
      door: { type: SchemaType.INTEGER },
      lpbNumber: { type: SchemaType.STRING },
      supplier: {
        type: SchemaType.OBJECT,
        properties: {
          code: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          address: { type: SchemaType.STRING },
          phone: { type: SchemaType.STRING, nullable: true }
        }
      },
      items: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            lineNo: { type: SchemaType.INTEGER },
            plu: { type: SchemaType.STRING },
            productName: { type: SchemaType.STRING },
            qtyCarton: { type: SchemaType.INTEGER },
            qtyPcs: { type: SchemaType.INTEGER },
            price: { type: SchemaType.NUMBER },
            discountPercent: { type: SchemaType.NUMBER },
            netPrice: { type: SchemaType.NUMBER },
            ppnbm: { type: SchemaType.NUMBER },
            total: { type: SchemaType.NUMBER },
            ket: { type: SchemaType.STRING }
          }
        }
      },
      pricing: {
        type: SchemaType.OBJECT,
        properties: {
          totalPurchasePrice: { type: SchemaType.NUMBER },
          totalDiscount: { type: SchemaType.NUMBER },
          netAfterDiscount: { type: SchemaType.NUMBER },
          ppnInput: { type: SchemaType.NUMBER },
          grandTotal: { type: SchemaType.NUMBER },
          grandTotalWords: { type: SchemaType.STRING }
        }
      },
      payment: {
        type: SchemaType.OBJECT,
        properties: {
          method: { type: SchemaType.STRING },
          bankAccount: { type: SchemaType.STRING },
          accountName: { type: SchemaType.STRING }
        }
      }
    }
  };

  private static getModel(schemaType: 'bulk-purchase-order' | 'laporan-penerimaan-barang' = 'bulk-purchase-order') {
    const responseSchema = schemaType === 'laporan-penerimaan-barang' 
      ? this.laporanPenerimaanBarangSchema 
      : this.bulkPurchaseOrderSchema;

    return this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction:
        'You are an expert at converting documents into structured JSON. ' +
        'Analyze the provided file and convert it into a valid JSON object based on the user\'s prompt. ' +
        'Do not include any explanatory text or markdown formatting in your response.',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema as any
      },
    });
  }

  private static async fileToGenerativePart(file: Buffer, mimeType: string) {
    return {
      inlineData: {
        data: file.toString('base64'),
        mimeType,
      },
    };
  }

  static async convertFileToJson(
    file: Buffer, 
    mimeType: string, 
    prompt: string,
    schemaType: 'bulk-purchase-order' | 'laporan-penerimaan-barang' = 'bulk-purchase-order'
  ) {
    logger.info('Preparing file for Gemini API...');
    const filePart = await this.fileToGenerativePart(file, mimeType);
    logger.info('File part created successfully.');

    const requestPayload = [prompt, filePart];

    try {
      logger.info(`Sending request to Gemini API for structured JSON output with schema: ${schemaType}...`);
      const model = this.getModel(schemaType);
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
        throw new AppError('Could not parse the converted file content.', 500);
      }
    } catch (apiError) {
      logger.error('Error calling Gemini API', { error: JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)) });
      throw new AppError('Failed to get a response from the conversion service.', 502);
    }
  }
}
