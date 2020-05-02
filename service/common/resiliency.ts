
function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export class RetryError extends Error {

  internalError: Error

  constructor(internalError: Error, methodName: string) {
    super(
      `The method ${methodName} failed more than allowed retry times. ` +
      `Inspect the internal error for more details on the last error.`
    );
    this.internalError = internalError;
  }
}


export function async_retry(times: number = 3, delay: number = 100) {
  return (
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    // Wraps an async function to handle retries upon failure,
    // attempting up to a given number of times, and applying a given delay between
    // retries.
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      var attempt = 0;

      while (true) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {

          if (error instanceof RetryError) {
            throw error;
          }

          attempt += 1;

          if (attempt > times) {
            throw new RetryError(error, propertyKey);
          }

          console.log(
            `Attempt ${attempt} to execute method ${propertyKey} failed ` +
            `with error: ${error}, retrying...`
          );

          if (delay > 0)
            await timeout(delay);
        }
      }
    };

    return descriptor;
  };
}
