export function readFileAsText(
  file: File,
  encoding: string = "utf-8"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (): void => {
      if (typeof reader.result !== "string") {
        reject("The result is not a string.");
        return;
      }

      const text = reader.result;
      resolve(text);
    };

    reader.readAsText(file, encoding);
  });
}
