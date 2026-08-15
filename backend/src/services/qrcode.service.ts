import QRCode from 'qrcode';

export const generateQRCode = async (bookingId: string, bookingCode: string): Promise<string> => {
  try {
    const data = JSON.stringify({ bookingId, bookingCode });
    // Returns a base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 400,
      margin: 2,
      color: {
        dark: '#151c27', // On-Surface
        light: '#ffffff'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};
