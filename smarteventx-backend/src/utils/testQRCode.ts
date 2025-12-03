import QRCode from 'qrcode';

async function testQRCode() {
  try {
    const qrData = JSON.stringify({
      bookingId: 'test-booking-id',
      amount: 100,
      timestamp: new Date().getTime()
    });
    
    console.log('Generating QR code with data:', qrData);
    const qrCodeImage = await QRCode.toDataURL(qrData);
    console.log('QR code generated successfully:', qrCodeImage.substring(0, 100) + '...');
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
}

testQRCode();