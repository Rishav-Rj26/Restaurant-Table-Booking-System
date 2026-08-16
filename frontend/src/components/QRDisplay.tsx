

interface QRDisplayProps {
  dataUrl: string;
  bookingCode: string;
}

export default function QRDisplay({ dataUrl, bookingCode }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-outline-variant">
      <img src={dataUrl} alt="Booking QR Code" className="w-48 h-48 mb-4" />
      <div className="text-sm text-outline font-medium">BOOKING CODE</div>
      <div className="font-serif text-2xl font-bold tracking-widest text-on-surface">{bookingCode}</div>
    </div>
  );
}
