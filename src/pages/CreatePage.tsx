import { useState } from 'react'
import { generateZKProof, validateBirthYearForZK, getCurrentYear } from '../utils/zkProof'
import type { ZKCredential } from '../utils/zkProof'
import { encodeZKCredentialToQR, downloadZKQRCode } from '../utils/zkQr'
import './CreatePage.css'

const CreatePage = () => {
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [zkCredential, setZkCredential] = useState<ZKCredential | null>(null)

  const handleGenerateCredential = async () => {
    setError('')
    setQrDataUrl('')
    setZkCredential(null)

    // Validate inputs
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!dateOfBirth) {
      setError('Please select your date of birth')
      return
    }

    const birthDate = new Date(dateOfBirth)
    const birthYear = birthDate.getFullYear()
    const currentYear = getCurrentYear()
    
    setIsLoading(true)

    try {
      // ZK Proof mode - validate birth year without revealing exact age
      const zkValidation = validateBirthYearForZK(birthYear)

      if (!zkValidation.isValid) {
        setError(`You must be 18 or older to generate a credential. You are ${zkValidation.age} years old.`)
        return
      }

      // Generate ZK proof
      const zkCred = await generateZKProof(birthYear, currentYear, name.trim())
      setZkCredential(zkCred)
      
      // Generate QR code with ZK proof
      const qrData = await encodeZKCredentialToQR(zkCred)
      setQrDataUrl(qrData)
      
    } catch (err) {
      console.error('Error generating ZK credential:', err)
      setError('Failed to generate ZK credential. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadQR = async () => {
    if (!zkCredential) return

    try {
      await downloadZKQRCode(zkCredential, `zk-proof-of-age-${name.replace(/\s+/g, '-').toLowerCase()}.png`)
    } catch (err) {
      console.error('Error downloading ZK QR:', err)
      setError('Failed to download ZK QR code. Please try again.')
    }
  }

  const handleReset = () => {
    setName('')
    setDateOfBirth('')
    setError('')
    setQrDataUrl('')
    setZkCredential(null)
  }

  return (
    <div className="create-page">
      <div className="create-container">
        <div className="create-header">
          <h2>Create Zero-Knowledge Proof of Age</h2>
          <p>Generate a privacy-preserving proof that you're over 18 without revealing your birth date or exact age</p>
        </div>

        <div className="create-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={isLoading}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              onClick={handleGenerateCredential}
              disabled={isLoading}
              className="generate-btn"
            >
              {isLoading ? 'Generating...' : 'Generate Credential'}
            </button>
            
            {(qrDataUrl || error) && (
              <button
                onClick={handleReset}
                className="reset-btn"
              >
                Reset Form
              </button>
            )}
          </div>
        </div>

        {qrDataUrl && zkCredential && (
          <div className="qr-result">
            <div className="qr-header">
              <h3>✅ Zero-Knowledge Proof Generated Successfully!</h3>
              <p>Scan or download this QR code to prove your age over 18 without revealing personal details</p>
            </div>
            
            <div className="qr-display">
              <img src={qrDataUrl} alt="Proof of Age QR Code" className="qr-image" />
            </div>

            <div className="credential-info">
              <h4>ZK Proof Details:</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{zkCredential.metadata.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Proof Type:</span>
                  <span className="value">🔒 Zero-Knowledge Proof</span>
                </div>
                <div className="info-item">
                  <span className="label">Age Claim:</span>
                  <span className="value">✅ Over 18 (verified privately)</span>
                </div>
                <div className="info-item">
                  <span className="label">Issued:</span>
                  <span className="value">{new Date(zkCredential.metadata.iat * 1000).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Expires:</span>
                  <span className="value">{new Date(zkCredential.metadata.exp * 1000).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Privacy:</span>
                  <span className="value">🛡️ Birth date hidden</span>
                </div>
              </div>
            </div>

            <div className="qr-actions">
              <button
                onClick={handleDownloadQR}
                className="download-btn"
              >
                📥 Download QR Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatePage
