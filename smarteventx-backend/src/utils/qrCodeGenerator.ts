import QRCode from 'qrcode';

// Generate QR code as data URL
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

// Generate QR code as SVG
export const generateQRCodeSVG = async (text: string): Promise<string> => {
  try {
    const qrCodeSVG = await QRCode.toString(text, {
      type: 'svg',
      width: 300,
      margin: 2
    });
    return qrCodeSVG;
  } catch (error) {
    throw new Error('Failed to generate QR code SVG');
  }
};