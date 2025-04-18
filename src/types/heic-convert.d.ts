declare module "heic-convert" {
  interface ConvertOptions {
    buffer: Uint8Array | Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  }

  interface ConvertAllOptions extends ConvertOptions {}

  interface HeicImage {
    convert(): Promise<Uint8Array>;
  }

  function convert(options: ConvertOptions): Promise<Uint8Array>;

  namespace convert {
    function all(options: ConvertAllOptions): Promise<HeicImage[]>;
  }

  export = convert;
}
