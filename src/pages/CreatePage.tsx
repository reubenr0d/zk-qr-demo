import { useState } from 'react'
import { createVerifiableCredential, signCredential, validateAge } from '../utils/crypto'
import type { SignedCredential } from '../utils/crypto'
import { encodeToPixelPassQR, downloadQRCode } from '../utils/qr'
import './CreatePage.css'

const CreatePage = () => {
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [signedCredential, setSignedCredential] = useState<SignedCredential | null>(null)

  const handleGenerateCredential = async () => {
    setError('')
    setQrDataUrl('')
    setSignedCredential(null)

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
    const ageValidation = validateAge(birthDate)

    if (!ageValidation.isValid) {
      setError(`You must be 18 or older to generate a credential. You are ${ageValidation.age} years old.`)
      return
    }

    setIsLoading(true)

    try {
      // Create the verifiable credential
      const credential = createVerifiableCredential(name.trim(), birthDate)
      
      // Sign the credential
      const signed = await signCredential(credential)
      setSignedCredential(signed)
      
      // Generate QR code
      const qrData = await encodeToPixelPassQR(signed)
      setQrDataUrl(qrData)
      
    } catch (err) {
      console.error('Error generating credential:', err)
      setError('Failed to generate credential. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadQR = async () => {
    if (!signedCredential) return

    try {
      await downloadQRCode(signedCredential, `proof-of-age-${name.replace(/\s+/g, '-').toLowerCase()}.png`)
    } catch (err) {
      console.error('Error downloading QR:', err)
      setError('Failed to download QR code. Please try again.')
    }
  }

  const handleReset = () => {
    setName('')
    setDateOfBirth('')
    setError('')
    setQrDataUrl('')
    setSignedCredential(null)
  }

  return (
    <div className="create-page">
      <div className="create-container">
        <div className="create-header">
          <h2>Create Proof of Age Credential</h2>
          <p>Generate a verifiable digital credential proving you are over 18 years old</p>
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

        {qrDataUrl && signedCredential && (
          <div className="qr-result">
            <div className="qr-header">
              <h3>✅ Credential Generated Successfully!</h3>
              <p>Scan or download this QR code to share your proof of age</p>
            </div>
            
            <div className="qr-display">
              <img src={qrDataUrl} alt="Proof of Age QR Code" className="qr-image" />
            </div>

            <div className="credential-info">
              <h4>Credential Details:</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{signedCredential.payload.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Over 18:</span>
                  <span className="value">{signedCredential.payload.over18 ? '✅ Yes' : '❌ No'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Issued:</span>
                  <span className="value">{new Date(signedCredential.payload.iat * 1000).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Expires:</span>
                  <span className="value">{new Date(signedCredential.payload.exp * 1000).toLocaleDateString()}</span>
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
