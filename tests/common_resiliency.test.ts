import { async_retry } from "../service/common/resiliency";
import { expect } from "chai";


describe("Async retry decorator", () => {

  it("Decorates an async function to support retries", async () => {

    class Example {

      k: number

      constructor() {
        this.k = 0;
      }

      @async_retry(5, 1)
      async crashing(): Promise<number> {
        this.k += 1;

        if (this.k < 3) {
          throw new Error("Crash test")
        }
        return this.k;
      }
    }

    const example = new Example();
    const value = await example.crashing();
    expect(value).to.eq(3);
  });
});
