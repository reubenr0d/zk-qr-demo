import { useState, useRef, useEffect } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { decodeZKCredentialFromQR } from '../utils/zkQr'
import { verifyZKProof, isZKCredentialExpired } from '../utils/zkProof'
import type { ZKCredential } from '../utils/zkProof'
import './VerifyPage.css'

interface VerificationResult {
  isValid: boolean
  isExpired: boolean
  zkCredential: ZKCredential | null
  error?: string
}

const VerifyPage = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrCodeReader = useRef<BrowserQRCodeReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setIsScanning(true)
      setVerificationResult(null)
      setCameraError(null)
      
      // Request camera permissions and get video stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve()
          }
        })
      }

      // Initialize QR code reader and start continuous scanning
      if (!qrCodeReader.current) {
        qrCodeReader.current = new BrowserQRCodeReader()
      }

      // Start continuous scanning
      const result = await qrCodeReader.current.decodeOnceFromVideoDevice(undefined, videoRef.current!)
      
      // Process the scanned QR code
      await processQRCode(result.getText())
      
    } catch (error) {
      console.error('Camera error:', error)
      let errorMessage = 'Failed to access camera. '
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Camera permission was denied. Please allow camera access and try again.'
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.'
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Camera is not supported on this device.'
        } else {
          errorMessage += 'Please try uploading an image instead.'
        }
      }
      
      setCameraError(errorMessage)
      setVerificationResult({
        isValid: false,
        isExpired: false,
        zkCredential: null,
        error: errorMessage
      })
    } finally {
      stopCamera()
    }
  }

  const stopCamera = () => {
    setIsScanning(false)
    setCameraError(null)
    
    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Reset QR code reader
    qrCodeReader.current = null
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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

      // Try multiple approaches to decode the QR code
      let result
      const imageUrl = URL.createObjectURL(file)
      
      try {
        // First attempt: Direct image URL decoding
        result = await qrCodeReader.current.decodeFromImageUrl(imageUrl)
      } catch (firstError) {
        console.warn('Direct image decoding failed, trying canvas approach:', firstError)
        
        try {
          // Second attempt: Canvas-based decoding with image processing
          const img = new Image()
          img.src = imageUrl
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
          })
          
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          result = await qrCodeReader.current.decodeFromCanvas(canvas)
        } catch (secondError) {
          console.warn('Canvas decoding failed, trying with enhanced contrast:', secondError)
          
          // Third attempt: Enhanced image processing
          const img = new Image()
          img.src = imageUrl
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
          })
          
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          canvas.width = img.width
          canvas.height = img.height
          
          // Draw with enhanced contrast
          ctx.filter = 'contrast(200%) brightness(150%)'
          ctx.drawImage(img, 0, 0)
          
          result = await qrCodeReader.current.decodeFromCanvas(canvas)
        }
      } finally {
        URL.revokeObjectURL(imageUrl)
      }

      await processQRCode(result.getText())
      
    } catch (error) {
      console.error('File processing error:', error)
      setVerificationResult({
        isValid: false,
        isExpired: false,
        zkCredential: null,
        error: 'Failed to decode QR code from image. Please ensure the image contains a clear, valid QR code. Try taking a clearer photo or checking the QR code format.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const processQRCode = async (qrData: string) => {
    try {
      setIsProcessing(true)
      
      console.log('Raw QR data:', qrData.substring(0, 100) + '...') // Log first 100 chars for debugging
      
      // Decode the QR code to get the ZK credential
      const zkCredential = await decodeZKCredentialFromQR(qrData)
      
      console.log('Decoded ZK credential:', zkCredential)
      
      // Verify the ZK proof
      const isValidProof = await verifyZKProof(zkCredential)
      
      // Check if expired
      const expired = isZKCredentialExpired(zkCredential)
      
      setVerificationResult({
        isValid: isValidProof,
        isExpired: expired,
        zkCredential: zkCredential,
        error: isValidProof ? undefined : 'Invalid ZK proof - credential may have been tampered with'
      })
      
    } catch (error) {
      console.error('QR processing error details:', error)
      console.error('Raw QR data that failed:', qrData)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to process QR code. '
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorMessage += 'The QR code does not contain valid JSON data.'
        } else if (error.message.includes('PixelPass')) {
          errorMessage += 'Failed to decode PixelPass format. This may not be a MOSIP-compatible QR code.'
        } else if (error.message.includes('ZK credential')) {
          errorMessage += 'The QR code does not contain a valid ZK credential structure.'
        } else {
          errorMessage += 'Please ensure it\'s a valid ZK proof of age credential.'
        }
      }
      
      setVerificationResult({
        isValid: false,
        isExpired: false,
        zkCredential: null,
        error: errorMessage
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
    
    if (verificationResult.error) return 'ZK Proof Verification Failed'
    if (verificationResult.isExpired) return 'ZK Credential Expired'
    if (verificationResult.isValid) return 'Valid ZK Proof'
    return 'Invalid ZK Proof'
  }

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-header">
          <h2>Verify Zero-Knowledge Proof of Age</h2>
          <p>Scan a QR code or upload an image to verify a zero-knowledge proof of age without seeing personal details</p>
        </div>

        <div className="verification-methods">
          <div className="method-section">
            <h3>📱 Scan with Camera</h3>
            <p>Use your device's camera to scan a QR code directly</p>
            
            <div className="camera-section">
              {cameraError && (
                <div className="camera-error">
                  <p>❌ {cameraError}</p>
                </div>
              )}
              
              {!isScanning ? (
                <button
                  onClick={startCamera}
                  className="camera-btn"
                  disabled={isProcessing}
                >
                  📷 Start Camera
                </button>
              ) : (
                <div className="camera-container">
                  <video
                    ref={videoRef}
                    className="camera-video"
                    autoPlay
                    playsInline
                    muted
                  />
                  <div className="camera-info">
                    <p>📱 Point your camera at a QR code</p>
                  </div>
                  <button
                    onClick={stopCamera}
                    className="stop-camera-btn"
                  >
                    ⏹ Stop Camera
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

            {verificationResult.zkCredential && (
              <div className="credential-details">
                <h4>Zero-Knowledge Proof Information:</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{verificationResult.zkCredential.metadata.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Age Verification:</span>
                    <span className="value">
                      {verificationResult.zkCredential.zkProof.publicSignals[0] === "1" ? '✅ Over 18' : '❌ Under 18'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Proof Type:</span>
                    <span className="value">🔒 Zero-Knowledge Proof</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Issuer:</span>
                    <span className="value">{verificationResult.zkCredential.metadata.iss}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Issued Date:</span>
                    <span className="value">
                      {new Date(verificationResult.zkCredential.metadata.iat * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Expiry Date:</span>
                    <span className="value">
                      {new Date(verificationResult.zkCredential.metadata.exp * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Proof Valid:</span>
                    <span className="value">
                      {verificationResult.isValid ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Privacy:</span>
                    <span className="value">🛡️ Birth date not revealed</span>
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
