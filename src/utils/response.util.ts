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

  static error(message: string, details?: Record<string, unknown>) {
    return {
      success: false as const,
      error: {
        message,
        ...(details ?? {}),
      },
    };
  }
}
