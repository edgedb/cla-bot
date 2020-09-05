export class ValueError<T> extends Error {
  private _invalidValue: T;

  public get value(): T {
    return this._invalidValue;
  }

  constructor(value: T, message?: string) {
    super(message);
    this._invalidValue = value;
  }
}

export class ParseError<T> extends ValueError<T> {}

export class InvalidOption extends Error {}

export class UnsupportedFileType extends InvalidOption {
  constructor(fileType: string) {
    super(`Unsupported file type: ${fileType}`);
  }
}
