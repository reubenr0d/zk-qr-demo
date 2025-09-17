declare module '@mosip/pixelpass' {
  export class PixelPass {
    constructor();
    compress(data: string): Promise<string>;
    decompress(data: string): Promise<string>;
    encode(data: string): Promise<string>;
    decode(data: string): Promise<string>;
  }
}
