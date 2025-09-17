declare module '@mosip/pixelpass' {
  export function generateQRData(data: string): Promise<string>;
  export function generateQRCode(data: string): Promise<string>;
  export function decode(qrData: string): string;
  export function getMappedData(data: any): any;
  export function decodeMappedData(data: any): any;
  export function decodeBinary(data: ArrayBuffer): Promise<string>;
}
