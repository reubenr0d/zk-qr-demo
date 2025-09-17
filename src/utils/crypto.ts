import * as ed25519 from '@noble/ed25519';

// Set up SHA-512 for ed25519 (required for signing)
async function setupCrypto() {
  // Import the Noble hashes SHA-512 implementation
  const { sha512 } = await import('@noble/hashes/sha2');
  ed25519.hashes.sha512 = sha512;
}

// Initialize crypto setup
let cryptoReady = false;
const ensureCryptoReady = async () => {
  if (!cryptoReady) {
    await setupCrypto();
    cryptoReady = true;
  }
};

// Demo keys for the prototype - NOT for production use
const DEMO_PRIVATE_KEY = new Uint8Array([
  74, 72, 147, 198, 35, 77, 182, 204, 144, 172, 106, 178, 80, 13, 175, 106,
  221, 196, 43, 171, 135, 166, 46, 86, 127, 124, 27, 20, 138, 131, 179, 226
]);

const DEMO_PUBLIC_KEY = new Uint8Array([
  151, 240, 147, 78, 29, 200, 180, 216, 242, 14, 82, 176, 104, 174, 53, 156,
  21, 239, 175, 189, 97, 191, 35, 143, 73, 23, 198, 183, 40, 178, 64, 72
]);

export interface VerifiableCredential {
  iss: string;
  iat: number;
  exp: number;
  name: string;
  over18: boolean;
}

export interface SignedCredential {
  payload: VerifiableCredential;
  signature: string;
}

/**
 * Generate a new Ed25519 key pair (for demo purposes)
 * In production, this would use secure key management
 */
export async function generateKeyPair(): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
  await ensureCryptoReady();
  const privateKey = ed25519.utils.randomSecretKey();
  const publicKey = await ed25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

/**
 * Get the demo private key
 */
export function getDemoPrivateKey(): Uint8Array {
  return DEMO_PRIVATE_KEY;
}

/**
 * Get the demo public key
 */
export function getDemoPublicKey(): Uint8Array {
  return DEMO_PUBLIC_KEY;
}

/**
 * Create a verifiable credential for a user
 */
export function createVerifiableCredential(name: string, dateOfBirth: Date): VerifiableCredential {
  const now = Date.now();
  const oneYear = 365 * 24 * 60 * 60 * 1000; // One year in milliseconds
  
  // Calculate age
  const age = Math.floor((now - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const over18 = age >= 18;

  return {
    iss: "DemoIssuer",
    iat: Math.floor(now / 1000), // Unix timestamp in seconds
    exp: Math.floor((now + oneYear) / 1000), // Expires in one year
    name,
    over18
  };
}

/**
 * Sign a verifiable credential using Ed25519
 */
export async function signCredential(credential: VerifiableCredential): Promise<SignedCredential> {
  await ensureCryptoReady();
  const payload = JSON.stringify(credential);
  const payloadBytes = new TextEncoder().encode(payload);
  
  const signature = await ed25519.sign(payloadBytes, DEMO_PRIVATE_KEY);
  const signatureHex = Array.from(signature).map((b: number) => b.toString(16).padStart(2, '0')).join('');
  
  return {
    payload: credential,
    signature: signatureHex
  };
}

/**
 * Verify a signed credential
 */
export async function verifyCredential(signedCredential: SignedCredential): Promise<boolean> {
  try {
    await ensureCryptoReady();
    const payload = JSON.stringify(signedCredential.payload);
    const payloadBytes = new TextEncoder().encode(payload);
    
    // Convert hex signature back to Uint8Array
    const signatureBytes = new Uint8Array(
      signedCredential.signature.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const isValid = await ed25519.verify(signatureBytes, payloadBytes, DEMO_PUBLIC_KEY);
    return isValid;
  } catch (error) {
    console.error('Error verifying credential:', error);
    return false;
  }
}

/**
 * Check if a credential is expired
 */
export function isCredentialExpired(credential: VerifiableCredential): boolean {
  const now = Math.floor(Date.now() / 1000);
  return credential.exp < now;
}

/**
 * Validate age requirement (18+)
 */
export function validateAge(dateOfBirth: Date): { isValid: boolean; age: number } {
  const now = Date.now();
  const age = Math.floor((now - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  return {
    isValid: age >= 18,
    age
  };
}
