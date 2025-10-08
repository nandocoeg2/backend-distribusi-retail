import { GoogleGenAI, Type, type Schema } from '@google/genai';
import { prisma } from '@/config/database';
import { environment } from '@/config/environment';
import logger from '@/config/logger';
import { AppError } from '@/utils/app-error';

type SchemaType = 'bulk-purchase-order' | 'laporan-penerimaan-barang';

export class ConversionService {
  private static genAI = new GoogleGenAI({
    apiKey: environment.GOOGLE_API_KEY,
  });

  // Schema untuk bulk purchase order processing
  private static bulkPurchaseOrderSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      order: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          date: {
            type: Type.STRING,
            description: 'e.g., Process 11-MAR-25 Jam 00:00:00',
          },
          type: { type: Type.STRING, description: 'e.g., AUTO, MANUAL' },
        },
      },
      supplier: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, nullable: true },
          code: { type: Type.STRING, nullable: true },
          address: { type: Type.STRING, nullable: true },
          phone: { type: Type.STRING, nullable: true },
          fax: { type: Type.STRING, nullable: true },
          bank: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, nullable: true },
              account: { type: Type.STRING, nullable: true },
              holder: { type: Type.STRING, nullable: true },
            },
          },
        },
      },
      customers: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, nullable: true },
          code: { type: Type.STRING, nullable: true },
          address: { type: Type.STRING, nullable: true },
          phone: { type: Type.STRING, nullable: true },
          fax: { type: Type.STRING, nullable: true },
          bank: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, nullable: true },
              account: { type: Type.STRING, nullable: true },
              holder: { type: Type.STRING, nullable: true },
            },
          },
        },
      },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING, nullable: true },
            plu: { type: Type.STRING, nullable: true },
            qtyOrdered_carton: { type: Type.INTEGER, nullable: true },
            price_perCarton: { type: Type.NUMBER, nullable: true },
            totalLine_net: { type: Type.NUMBER, nullable: true },
          },
        },
      },
      invoice: {
        type: Type.OBJECT,
        properties: {
          TOTAL_PURCHASE_PRICE: { type: Type.NUMBER, nullable: true },
          TOTAL_ITEM_DISCOUNT: { type: Type.NUMBER, nullable: true },
          TOTAL_INVOICE_DISCOUNT: { type: Type.NUMBER, nullable: true },
          TOTAL_AFTER_DISCOUNT: { type: Type.NUMBER, nullable: true },
          TOTAL_BONUS: { type: Type.NUMBER, nullable: true },
          TOTAL_LST: { type: Type.NUMBER, nullable: true },
          TOTAL_VAT_INPUT: { type: Type.NUMBER, nullable: true },
          TOTAL_INCLUDE_VAT: { type: Type.NUMBER, nullable: true },
          TOTAL_INVOICE: { type: Type.NUMBER, nullable: true },
          amountInWords: {
            type: Type.STRING,
            nullable: true,
            description:
              'By Letter : Satu Juta Sembilan Puluh Delapan Ribu Sembilan Ratus',
          },
        },
      },
    },
  };

  // Schema untuk laporan penerimaan barang
  private static laporanPenerimaanBarangSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      fppNumber: { type: Type.STRING },
      orderDate: { type: Type.STRING },
      deliveryDate: { type: Type.STRING },
      deliveryTime: { type: Type.STRING },
      door: { type: Type.INTEGER },
      lpbNumber: { type: Type.STRING },
      supplier: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          name: { type: Type.STRING },
          address: { type: Type.STRING },
          phone: { type: Type.STRING, nullable: true },
        },
      },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            lineNo: { type: Type.INTEGER },
            plu: { type: Type.STRING },
            productName: { type: Type.STRING },
            qtyCarton: { type: Type.INTEGER },
            qtyPcs: { type: Type.INTEGER },
            price: { type: Type.NUMBER },
            discountPercent: { type: Type.NUMBER },
            netPrice: { type: Type.NUMBER },
            ppnbm: { type: Type.NUMBER },
            total: { type: Type.NUMBER },
            ket: { type: Type.STRING },
          },
        },
      },
      pricing: {
        type: Type.OBJECT,
        properties: {
          totalPurchasePrice: { type: Type.NUMBER },
          totalDiscount: { type: Type.NUMBER },
          netAfterDiscount: { type: Type.NUMBER },
          ppnInput: { type: Type.NUMBER },
          grandTotal: { type: Type.NUMBER },
          grandTotalWords: { type: Type.STRING },
        },
      },
      payment: {
        type: Type.OBJECT,
        properties: {
          method: { type: Type.STRING },
          bankAccount: { type: Type.STRING },
          accountName: { type: Type.STRING },
        },
      },
    },
  };

  private static getModelConfig(
    schemaType: SchemaType = 'bulk-purchase-order'
  ) {
    const responseSchema =
      schemaType === 'laporan-penerimaan-barang'
        ? this.laporanPenerimaanBarangSchema
        : this.bulkPurchaseOrderSchema;

    return {
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction:
          'You are an expert at converting documents into structured JSON. ' +
          "Analyze the provided file and convert it into a valid JSON object based on the user's prompt. " +
          'Return ONLY raw JSON that strictly matches the response schema. No extra text, no markdown.',
        responseMimeType: 'application/json',
        responseSchema,
      },
      // saya mau nambahin data customer agar lebih mudah matching ke database
      functions: [
        { name: 'addCustomerData', parameters: { customerId: 'string' } },
      ],
    } as const;
  }

  private static async fileToGenerativePart(file: Buffer, mimeType: string) {
    return {
      inlineData: {
        data: file.toString('base64'),
        mimeType,
      },
    };
  }

  private static async fetchCustomerReferenceData() {
    try {
      const customers = await prisma.customer.findMany({
        select: {
          namaCustomer: true,
          kodeCustomer: true,
          alamatPengiriman: true,
        },
        orderBy: {
          namaCustomer: 'asc',
        },
      });

      if (!customers.length) {
        logger.warn(
          'No customer records found to use as RAG context for conversion.'
        );
        return null;
      }

      return customers;
    } catch (error) {
      logger.error(
        'Failed to fetch customer data for conversion RAG context.',
        { error }
      );
      return null;
    }
  }

  private static async buildRequestPayload(
    prompt: string,
    filePart: Awaited<ReturnType<typeof ConversionService.fileToGenerativePart>>,
    schemaType: SchemaType
  ) {
    if (schemaType !== 'bulk-purchase-order') {
      return [prompt, filePart];
    }

    const customers = await this.fetchCustomerReferenceData();
    if (customers && customers.length > 0) {
      const ragInstruction =
        `${prompt}\n\n` +
        'Customer reference data (sourced from the database to keep the "customers" object aligned with existing records):\n' +
        `${JSON.stringify(customers)}`;

      logger.debug('Attached customer dataset to Gemini prompt for RAG.', {
        totalCustomers: customers.length,
      });

      return [ragInstruction, filePart];
    }

    logger.debug(
      'Proceeding without customer RAG context for conversion (no data available).'
    );
    return [prompt, filePart];
  }

  static async convertFileToJson(
    file: Buffer,
    mimeType: string,
    prompt: string,
    schemaType: SchemaType = 'bulk-purchase-order'
  ) {
    logger.info('Preparing file for Gemini API...');
    const filePart = await this.fileToGenerativePart(file, mimeType);
    logger.info('File part created successfully.');

    const requestPayload = await this.buildRequestPayload(
      prompt,
      filePart,
      schemaType
    );

    try {
      logger.info(
        `Sending request to Gemini API for structured JSON output with schema: ${schemaType}...`
      );
      const { model, config } = this.getModelConfig(schemaType);
      const response = await this.genAI.models.generateContent({
        model,
        contents: requestPayload,
        config,
      });
      logger.info('Received structured response from Gemini API.');

      const jsonString = response.text;
      logger.info({ message: 'Raw JSON string from Gemini', jsonString });

      try {
        if (!jsonString) {
          throw new Error('Empty response body');
        }
        const parsedJson = JSON.parse(jsonString);
        logger.info('Successfully parsed JSON response.');
        return parsedJson;
      } catch (parseError) {
        logger.error('Failed to parse JSON from Gemini response', {
          error: parseError,
          jsonString,
        });
        throw new AppError('Could not parse the converted file content.', 500);
      }
    } catch (apiError) {
      if (apiError instanceof AppError) {
        throw apiError;
      }

      const errorInfo = this.parseApiError(apiError);

      if (errorInfo.quotaExceeded) {
        logger.warn('Gemini quota exceeded', errorInfo.logPayload);
        const retryMessage = errorInfo.retryAfterSeconds
          ? `Google Gemini quota exceeded. Please retry after ${Math.ceil(
              errorInfo.retryAfterSeconds
            )} seconds.`
          : 'Google Gemini quota exceeded. Please review your plan or billing settings.';
        throw new AppError(retryMessage, 429);
      }

      logger.error('Error calling Gemini API', errorInfo.logPayload);
      throw new AppError(
        'Failed to get a response from the conversion service.',
        502
      );
    }
  }

  private static parseApiError(error: unknown) {
    const defaultPayload = { error };
    const result = {
      quotaExceeded: false,
      retryAfterSeconds: undefined as number | undefined,
      logPayload: defaultPayload as Record<string, unknown>,
    };

    if (!error || typeof error !== 'object') {
      return result;
    }

    const apiError = error as Record<string, unknown>;
    const rawError = apiError.error ?? apiError.message;
    let structuredError: any;

    if (typeof rawError === 'string') {
      try {
        structuredError = JSON.parse(rawError);
      } catch (parseError) {
        logger.debug('Failed to parse Gemini error message as JSON', {
          parseError,
          rawError,
        });
      }
    } else if (rawError && typeof rawError === 'object') {
      structuredError = rawError;
    }

    const googleError = structuredError?.error ?? structuredError;
    const statusCode =
      typeof apiError.status === 'number'
        ? apiError.status
        : typeof googleError?.code === 'number'
        ? googleError.code
        : undefined;
    const statusText =
      typeof googleError?.status === 'string' ? googleError.status : undefined;

    if (statusCode === 429 || statusText === 'RESOURCE_EXHAUSTED') {
      result.quotaExceeded = true;
      const retryInfo = Array.isArray(googleError?.details)
        ? googleError.details.find((detail: any) =>
            detail?.['@type']?.includes('RetryInfo')
          )
        : undefined;

      const retryAfterSeconds = this.parseRetryDelay(retryInfo?.retryDelay);
      result.retryAfterSeconds = retryAfterSeconds;
    }

    result.logPayload = {
      error,
      structuredError,
      statusCode,
      statusText,
      retryAfterSeconds: result.retryAfterSeconds,
    };

    return result;
  }

  private static parseRetryDelay(retryDelay: unknown) {
    if (typeof retryDelay === 'number') {
      return retryDelay;
    }

    if (typeof retryDelay !== 'string') {
      return undefined;
    }

    const secondsMatch = retryDelay.match(/([0-9]+(?:\.[0-9]+)?)\s*s?/i);
    if (!secondsMatch) {
      return undefined;
    }

    const parsed = Number(secondsMatch[1]);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
