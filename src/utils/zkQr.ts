import * as PixelPass from '@mosip/pixelpass';
import QRCode from 'qrcode';
import type { ZKCredential } from './zkProof';

/**
 * Encode a ZK credential into a MOSIP PixelPass QR code
 */
export async function encodeZKCredentialToQR(zkCredential: ZKCredential): Promise<string> {
  try {
    // Convert the ZK credential to JSON string
    const credentialJson = JSON.stringify(zkCredential);
    
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
    console.error('Error encoding ZK credential to QR:', error);
    throw new Error('Failed to encode ZK credential to QR code');
  }
}

/**
 * Decode a MOSIP PixelPass QR code back to a ZK credential
 */
export async function decodeZKCredentialFromQR(qrData: string): Promise<ZKCredential> {
  try {
    console.log('Attempting to decode QR data with PixelPass...');
    
    // First attempt: Use PixelPass to decode the QR data
    let decodedData: string;
    try {
      decodedData = PixelPass.decode(qrData);
      console.log('PixelPass decode successful');
    } catch (pixelPassError) {
      console.warn('PixelPass decode failed, trying direct JSON parse:', pixelPassError);
      
      // Fallback: Try direct JSON parsing (in case QR wasn't encoded with PixelPass)
      decodedData = qrData;
    }
    
    console.log('Decoded data:', decodedData.substring(0, 200) + '...');
    
    // Parse the JSON to get the ZK credential
    const zkCredential: ZKCredential = JSON.parse(decodedData);
    
    // Validate that it's a ZK credential structure
    if (!zkCredential.zkProof || !zkCredential.metadata || !zkCredential.commitment) {
      throw new Error('Invalid ZK credential structure - missing required fields');
    }
    
    // Additional validation
    if (!zkCredential.zkProof.proof || !zkCredential.zkProof.publicSignals) {
      throw new Error('Invalid ZK proof structure - missing proof or publicSignals');
    }
    
    console.log('ZK credential validation successful');
    return zkCredential;
  } catch (error) {
    console.error('Error decoding QR to ZK credential:', error);
    if (error instanceof SyntaxError) {
      throw new Error('Failed to decode QR code - invalid JSON format');
    }
    throw new Error(`Failed to decode QR code to ZK credential: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a downloadable ZK QR code image
 */
export async function generateDownloadableZKQR(zkCredential: ZKCredential): Promise<Blob> {
  try {
    const credentialJson = JSON.stringify(zkCredential);
    
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
          throw new Error('Failed to generate ZK QR code blob');
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error generating downloadable ZK QR:', error);
    throw new Error('Failed to generate downloadable ZK QR code');
  }
}

/**
 * Download a ZK QR code image with a given filename
 */
export async function downloadZKQRCode(zkCredential: ZKCredential, filename: string = 'zk-proof-of-age-qr.png'): Promise<void> {
  try {
    const blob = await generateDownloadableZKQR(zkCredential);
    
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
    console.error('Error downloading ZK QR code:', error);
    throw new Error('Failed to download ZK QR code');
  }
}
