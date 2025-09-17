import * as PixelPass from '@mosip/pixelpass';
import QRCode from 'qrcode';
import type { SignedCredential } from './crypto';

/**
 * Encode a signed credential into a MOSIP PixelPass QR code
 */
export async function encodeToPixelPassQR(signedCredential: SignedCredential): Promise<string> {
  try {
    // Convert the signed credential to JSON string
    const credentialJson = JSON.stringify(signedCredential);
    
    // Use PixelPass to generate QR data
    const qrData = await PixelPass.generateQRData(credentialJson);
    
    // Generate QR code from the encoded data
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error encoding credential to QR:', error);
    throw new Error('Failed to encode credential to QR code');
  }
}

/**
 * Decode a MOSIP PixelPass QR code back to a signed credential
 */
export async function decodeFromPixelPassQR(qrData: string): Promise<SignedCredential> {
  try {
    // Use PixelPass to decode the QR data
    const decodedData = PixelPass.decode(qrData);
    
    // Parse the JSON to get the signed credential
    const signedCredential: SignedCredential = JSON.parse(decodedData);
    
    return signedCredential;
  } catch (error) {
    console.error('Error decoding QR to credential:', error);
    throw new Error('Failed to decode QR code to credential');
  }
}

/**
 * Generate a downloadable QR code image
 */
export async function generateDownloadableQR(signedCredential: SignedCredential): Promise<Blob> {
  try {
    const credentialJson = JSON.stringify(signedCredential);
    
    // Use PixelPass to generate QR data
    const qrData = await PixelPass.generateQRData(credentialJson);
    
    // Generate QR code as canvas
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          throw new Error('Failed to generate QR code blob');
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error generating downloadable QR:', error);
    throw new Error('Failed to generate downloadable QR code');
  }
}

/**
 * Download a QR code image with a given filename
 */
export async function downloadQRCode(signedCredential: SignedCredential, filename: string = 'proof-of-age-qr.png'): Promise<void> {
  try {
    const blob = await generateDownloadableQR(signedCredential);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
}
