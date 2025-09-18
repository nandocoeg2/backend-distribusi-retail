export class ResponseUtil {
  static success<T>(data: T) {
    return {
      success: true,
      data,
    };
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
