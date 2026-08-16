

export default function ScannerPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full aspect-square max-w-sm border-2 border-white/50 rounded-2xl flex items-center justify-center mb-8">
        Camera Feed Here
      </div>
      <p className="text-center font-medium">Point camera at customer's QR code</p>
    </div>
  );
}
