# 🎫 Browser-Only MOSIP-Compatible Zero-Knowledge Proof-of-Age QR Demo

A fully client-side web application that generates and verifies zero-knowledge proofs for age verification (18+) using MOSIP-compatible QR codes.

## ✨ Features

- **🔐 Zero-Knowledge Proofs** - Prove age without revealing birth date
- **🛡️ Privacy-Preserving** - Personal details remain hidden during verification
- **📱 MOSIP-compatible QR format** - Uses PixelPass encoding
- **🔒 Cryptographic Security** - Browser-based ZK proof generation and verification
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

### Create ZK Proof (`/create`)
1. Enter your name and date of birth
2. System validates you are 18+ years old
3. Generates a zero-knowledge proof of age
4. Encodes ZK proof into MOSIP PixelPass QR code
5. Display QR and download option

### Verify ZK Proof (`/verify`)
1. Scan QR code with camera OR upload image file
2. Decode QR using MOSIP PixelPass
3. Verify zero-knowledge proof cryptographically
4. Check expiration and age claim (without revealing birth date)
5. Display verification result with privacy protection

## 🛠️ Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript + Vite |
| QR Encoding | @mosip/pixelpass |
| Zero-Knowledge Proofs | Custom browser-based implementation |
| QR Scanning | @zxing/browser |
| Styling | CSS3 with modern gradients |

## 🔒 Security Notes

⚠️ **This is a DEMO for educational purposes only!**

- ZK proof implementation is simplified (NOT production-grade circuits)
- No real trust anchor integration
- No revocation checking
- Demo issuer only
- Production systems would use full Circom circuits with trusted setup

## 📱 Test Cases

### ✅ Supported Scenarios
- [x] Age ≥18 ZK proof generation
- [x] Age <18 rejection
- [x] Valid ZK proof verification (camera)
- [x] Valid ZK proof verification (upload)
- [x] ZK proof tampering detection
- [x] Expiration checking
- [x] Privacy-preserving verification
- [x] Offline functionality

### 🧪 Testing
1. Open the app at `http://localhost:5173`
2. Navigate to **Create** page
3. Enter name: "Alice" and DOB: "2000-01-01"
4. Generate ZK proof and download QR
5. Navigate to **Verify** page
6. Upload the QR image or scan with camera
7. Verify the ZK proof shows as valid (with birth date hidden)

## 📁 Project Structure

```
src/
├── components/
│   └── Navigation.tsx       # App navigation
├── pages/
│   ├── CreatePage.tsx       # ZK proof creation
│   └── VerifyPage.tsx       # ZK proof verification
├── utils/
│   ├── zkProof.ts          # Zero-knowledge proof generation/verification
│   └── zkQr.ts             # MOSIP PixelPass QR handling for ZK proofs
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