export class ResponseUtil {
  static success<T>(data: T, message?: string) {
    const response: { success: true; data: T; message?: string } = {
      success: true,
      data,
    };

    if (message) {
      response.message = message;
    }

    return response;
  }

  static error(message: string) {
    return {
      success: false,
      error: {
        message,
      },
    };
  }
}
