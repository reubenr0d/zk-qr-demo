# 🎫 Browser-Only MOSIP-Compatible Proof-of-Age QR Demo

A fully client-side web application that generates and verifies MOSIP-style Verifiable Credentials for proof of age (18+) using QR codes.

## ✨ Features

- **🔐 End-to-end browser verification** - No backend required
- **📱 MOSIP-compatible QR format** - Uses PixelPass encoding
- **🔑 Ed25519 digital signatures** - Cryptographic authenticity
- **📷 Camera QR scanning** - Live verification via camera
- **📁 File upload support** - Verify QR codes from images
- **⚡ Offline capable** - Works without internet after loading

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 📖 How It Works

### Create Credential (`/create`)
1. Enter your name and date of birth
2. System validates you are 18+ years old
3. Generates a signed Verifiable Credential (VC)
4. Encodes VC into MOSIP PixelPass QR code
5. Display QR and download option

### Verify Credential (`/verify`)
1. Scan QR code with camera OR upload image file
2. Decode QR using MOSIP PixelPass
3. Verify Ed25519 signature
4. Check expiration and age claim
5. Display verification result

## 🛠️ Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript + Vite |
| QR Encoding | @mosip/pixelpass |
| Cryptography | @noble/ed25519 |
| QR Scanning | @zxing/browser |
| Styling | CSS3 with modern gradients |

## 🔒 Security Notes

⚠️ **This is a DEMO for educational purposes only!**

- Private keys are hardcoded (NOT production secure)
- No real trust anchor integration
- No revocation checking
- Demo issuer only

## 📱 Test Cases

### ✅ Supported Scenarios
- [x] Age ≥18 credential generation
- [x] Age <18 rejection
- [x] Valid QR verification (camera)
- [x] Valid QR verification (upload)
- [x] Signature tampering detection
- [x] Expiration checking
- [x] Offline functionality

### 🧪 Testing
1. Open the app at `http://localhost:5173`
2. Navigate to **Create** page
3. Enter name: "Alice" and DOB: "2000-01-01"
4. Generate credential and download QR
5. Navigate to **Verify** page
6. Upload the QR image or scan with camera
7. Verify the credential shows as valid

## 📁 Project Structure

```
src/
├── components/
│   └── Navigation.tsx      # App navigation
├── pages/
│   ├── CreatePage.tsx      # Credential creation
│   └── VerifyPage.tsx      # Credential verification
├── utils/
│   ├── crypto.ts           # Ed25519 signing/verification
│   └── qr.ts              # MOSIP PixelPass QR handling
└── types/
    └── mosip-pixelpass.d.ts # Type definitions
```

## 🚀 Deployment

This is a static site that can be deployed to:
- ✅ Vercel (recommended)
- ✅ Netlify
- ✅ GitHub Pages
- ✅ Any static hosting service

```bash
npm run build
# Deploy the `dist/` folder
```

## 🔮 Future Enhancements

- [ ] Integration with Inji Certify for real MOSIP trust
- [ ] Revocation registry support
- [ ] Multiple credential types
- [ ] Biometric integration
- [ ] Production key management

## 📄 License

This project is for educational and demonstration purposes only.

---

Built with ❤️ for MOSIP ecosystem demonstration