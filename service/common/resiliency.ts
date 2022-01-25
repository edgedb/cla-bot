function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RetryError extends Error {
  internalError: Error;

  constructor(internalError: Error, methodName: string) {
    super(
      `The method ${methodName} failed more than allowed retry times. ` +
        `Inspect the internal error for more details on the last error.`
    );
    this.internalError = internalError;
  }
}

export type BackoffFunction = (n: number) => number;

function defaultBackoff(attempt: number): number {
  return 2 ** attempt * 100 + Math.random() * 100;
}

export function async_retry(
  times: number = 6,
  backoff: BackoffFunction = defaultBackoff
): (
  target: object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>
) => TypedPropertyDescriptor<any> {
  return (
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    // Wraps an async function to handle retries upon failure,
    // attempting up to a given number of times, and applying a given
    // delay between retries.
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<any> {
      let attempt = 0;

      while (true) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          if (error instanceof RetryError) {
            throw error;
          }

          attempt += 1;

          if (attempt > times) {
            throw new RetryError(error as Error, propertyKey);
          }

          await sleep(backoff(attempt));
        }
      }
    };

    return descriptor;
  };
}
