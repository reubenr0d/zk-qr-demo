import { useState, useRef } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { decodeFromPixelPassQR } from '../utils/qr'
import { verifyCredential, isCredentialExpired } from '../utils/crypto'
import type { SignedCredential } from '../utils/crypto'
import './VerifyPage.css'

interface VerificationResult {
  isValid: boolean
  isExpired: boolean
  credential: SignedCredential | null
  error?: string
}

const VerifyPage = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrCodeReader = useRef<BrowserQRCodeReader | null>(null)

  const startCamera = async () => {
    try {
      setIsScanning(true)
      setVerificationResult(null)
      
      if (!qrCodeReader.current) {
        qrCodeReader.current = new BrowserQRCodeReader()
      }

      const result = await qrCodeReader.current.decodeOnceFromVideoDevice(undefined, videoRef.current!)
      
      // Process the scanned QR code
      await processQRCode(result.getText())
      
    } catch (error) {
      console.error('Camera error:', error)
      setVerificationResult({
        isValid: false,
        isExpired: false,
        credential: null,
        error: 'Failed to access camera or scan QR code. Please try uploading an image instead.'
      })
    } finally {
      stopCamera()
    }
  }

  const stopCamera = () => {
    setIsScanning(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setVerificationResult(null)
    setIsProcessing(true)

    try {
      if (!qrCodeReader.current) {
        qrCodeReader.current = new BrowserQRCodeReader()
      }

      const result = await qrCodeReader.current.decodeFromImageUrl(URL.createObjectURL(file))
      await processQRCode(result.getText())
      
    } catch (error) {
      console.error('File processing error:', error)
      setVerificationResult({
        isValid: false,
        isExpired: false,
        credential: null,
        error: 'Failed to decode QR code from image. Please ensure the image contains a valid QR code.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const processQRCode = async (qrData: string) => {
    try {
      setIsProcessing(true)
      
      // Decode the QR code to get the signed credential
      const signedCredential = await decodeFromPixelPassQR(qrData)
      
      // Verify the signature
      const isValidSignature = await verifyCredential(signedCredential)
      
      // Check if expired
      const expired = isCredentialExpired(signedCredential.payload)
      
      setVerificationResult({
        isValid: isValidSignature,
        isExpired: expired,
        credential: signedCredential,
        error: isValidSignature ? undefined : 'Invalid signature - credential may have been tampered with'
      })
      
    } catch (error) {
      console.error('QR processing error:', error)
      setVerificationResult({
        isValid: false,
        isExpired: false,
        credential: null,
        error: 'Failed to process QR code. Please ensure it\'s a valid proof of age credential.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setVerificationResult(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    stopCamera()
  }

  const getStatusIcon = () => {
    if (!verificationResult) return ''
    
    if (verificationResult.error) return '❌'
    if (verificationResult.isExpired) return '⏰'
    if (verificationResult.isValid) return '✅'
    return '❌'
  }

  const getStatusText = () => {
    if (!verificationResult) return ''
    
    if (verificationResult.error) return 'Verification Failed'
    if (verificationResult.isExpired) return 'Credential Expired'
    if (verificationResult.isValid) return 'Valid Credential'
    return 'Invalid Credential'
  }

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-header">
          <h2>Verify Proof of Age Credential</h2>
          <p>Scan a QR code or upload an image to verify a proof of age credential</p>
        </div>

        <div className="verification-methods">
          <div className="method-section">
            <h3>📱 Scan with Camera</h3>
            <p>Use your device's camera to scan a QR code directly</p>
            
            <div className="camera-section">
              {!isScanning ? (
                <button
                  onClick={startCamera}
                  className="camera-btn"
                  disabled={isProcessing}
                >
                  Start Camera
                </button>
              ) : (
                <div className="camera-container">
                  <video
                    ref={videoRef}
                    className="camera-video"
                    autoPlay
                    playsInline
                  />
                  <button
                    onClick={stopCamera}
                    className="stop-camera-btn"
                  >
                    Stop Camera
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="method-divider">OR</div>

          <div className="method-section">
            <h3>📁 Upload Image</h3>
            <p>Upload a PNG or JPG image containing a QR code</p>
            
            <div className="upload-section">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="file-input"
                disabled={isProcessing || isScanning}
              />
              
              {selectedFile && (
                <div className="file-info">
                  <span>📄 {selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="processing">
            <div className="spinner"></div>
            <p>Processing QR code...</p>
          </div>
        )}

        {verificationResult && (
          <div className={`verification-result ${verificationResult.isValid && !verificationResult.isExpired ? 'valid' : 'invalid'}`}>
            <div className="result-header">
              <h3>{getStatusIcon()} {getStatusText()}</h3>
            </div>

            {verificationResult.error && (
              <div className="error-details">
                <p>{verificationResult.error}</p>
              </div>
            )}

            {verificationResult.credential && (
              <div className="credential-details">
                <h4>Credential Information:</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{verificationResult.credential.payload.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Over 18:</span>
                    <span className="value">
                      {verificationResult.credential.payload.over18 ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Issuer:</span>
                    <span className="value">{verificationResult.credential.payload.iss}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Issued Date:</span>
                    <span className="value">
                      {new Date(verificationResult.credential.payload.iat * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Expiry Date:</span>
                    <span className="value">
                      {new Date(verificationResult.credential.payload.exp * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Signature Valid:</span>
                    <span className="value">
                      {verificationResult.isValid ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value">
                      {verificationResult.isExpired ? '⏰ Expired' : '✅ Active'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="result-actions">
              <button
                onClick={handleReset}
                className="reset-btn"
              >
                Verify Another Credential
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyPage
