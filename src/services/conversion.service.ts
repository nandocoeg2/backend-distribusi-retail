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

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
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
            name:    { type: SchemaType.STRING, nullable: true, description: 'Nama supplier' },
            code:    { type: SchemaType.STRING, nullable: true, description: 'Kode supplier' },
            address: { type: SchemaType.STRING, nullable: true, description: 'Alamat supplier' },
            phone:   { type: SchemaType.STRING, nullable: true, description: 'Nomor telepon supplier' },
            fax:     { type: SchemaType.STRING, nullable: true, description: 'Nomor fax supplier' },
            bank: {
              type: SchemaType.OBJECT,
              properties: {
                name:    { type: SchemaType.STRING, nullable: true, description: 'Nama bank supplier' },
                account: { type: SchemaType.STRING, nullable: true, description: 'Nomor rekening bank supplier' },
                holder:  { type: SchemaType.STRING, nullable: true, description: 'Nama pemilik rekening bank supplier' }
              }
            }
          }
        },
        customers: {
          type: SchemaType.OBJECT,
          properties: {
            name:    { type: SchemaType.STRING, nullable: true, description: 'Nama customer' },
            code:    { type: SchemaType.STRING, nullable: true, description: 'Kode customer' },
            address: { type: SchemaType.STRING, nullable: true, description: 'Alamat customer' },
            phone:   { type: SchemaType.STRING, nullable: true, description: 'Nomor telepon customer' },
            fax:     { type: SchemaType.STRING, nullable: true, description: 'Nomor fax customer' },
            bank: {
              type: SchemaType.OBJECT,
              properties: {
                name:    { type: SchemaType.STRING, nullable: true, description: 'Nama bank customer' },
                account: { type: SchemaType.STRING, nullable: true, description: 'Nomor rekening bank customer' },
                holder:  { type: SchemaType.STRING, nullable: true, description: 'Nama pemilik rekening bank customer' }
              }
            }
          }
        },
        delivery: {
          type: SchemaType.OBJECT,
          properties: {
            destination:   { type: SchemaType.STRING, nullable: true, description: 'Tujuan pengiriman' },
            dateScheduled: { type: SchemaType.STRING, nullable: true, description: 'Tanggal pengiriman' },
            timeScheduled: { type: SchemaType.STRING, nullable: true, description: 'Waktu pengiriman' },
            doorTime:      { type: SchemaType.STRING, nullable: true, description: 'Waktu tiba di tempat' },
            notes: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING, nullable: true, description: 'Catatan pengiriman' }
            }
          }
        },
        items: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              lineNo:            { type: SchemaType.INTEGER, nullable: true, description: 'Nomor urut' },
              productName:       { type: SchemaType.STRING, nullable: true, description: 'Nama produk' },
              plu:               { type: SchemaType.STRING, nullable: true, description: 'Kode PLU' },
              qtyOrdered_carton: { type: SchemaType.INTEGER, nullable: true, description: 'Jumlah pesanan (carton)' },
              qtyOrdered_pcs:    { type: SchemaType.INTEGER, nullable: true, description: 'Jumlah pesanan (pcs)' },
              price_perPcs:      { type: SchemaType.NUMBER, nullable: true, description: 'Harga per pcs' },
              discount_percent:  { type: SchemaType.NUMBER, nullable: true, description: 'Diskon persentase' },
              netPrice_perPcs:   { type: SchemaType.NUMBER, nullable: true, description: 'Harga net per pcs' },
              totalLine_net:     { type: SchemaType.NUMBER, nullable: true, description: 'Harga total per line' },
              bonus:             { type: SchemaType.INTEGER, nullable: true, description: 'Bonus' },
              lst:               { type: SchemaType.INTEGER, nullable: true, description: 'LST' },
              remarks:           { type: SchemaType.STRING, nullable: true, description: 'Catatan' },
              price_perCarton:   { type: SchemaType.NUMBER, nullable: true, description: 'Harga per carton' },
              ppnbm:             { type: SchemaType.NUMBER, nullable: true, description: 'PPNBM' },
              totalPrice:        { type: SchemaType.NUMBER, nullable: true, description: 'Harga total' },
            }
          }
        },
        pricing: {
          type: SchemaType.OBJECT,
          properties: {
            subTotal:         { type: SchemaType.NUMBER, nullable: true, description: 'Subtotal' },
            totalDiscount:    { type: SchemaType.NUMBER, nullable: true, description: 'Total diskon' },
            netAfterDiscount: { type: SchemaType.NUMBER, nullable: true, description: 'Harga setelah diskon' },
            vatInput:         { type: SchemaType.NUMBER, nullable: true, description: 'Pajak input' },
            grandTotal:       { type: SchemaType.NUMBER, nullable: true, description: 'Total harga' },
            inWords:          { type: SchemaType.STRING, nullable: true, description: 'Total harga dalam kata' },
          }
        }
      }
    }
  },
});

export const convertFileToJson = async (file: Buffer, mimeType: string, prompt: string) => {
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
    logger.error('Error calling Gemini API', { error: JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)) });
    throw new Error('Failed to get a response from the conversion service.');
  }
};

