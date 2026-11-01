import QRCode from 'qrcode';

/**
 * Generates an actual, scannable 2D QR Code image as a base64 Data URL.
 * Can be directly rendered in <img src={qrUrl} /> or downloaded/printed.
 */
export async function generateQrDataUrl(data: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: {
        dark: '#143425', // Forest green theme dark
        light: '#FFFFFF'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    // Fallback minimal valid 1x1 png or empty string
    return '';
  }
}
