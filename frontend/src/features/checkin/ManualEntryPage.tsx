
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ManualEntryPage() {
  return (
    <div className="p-4">
      <h1 className="font-serif text-2xl font-bold mb-6">Manual Entry</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
        <Input label="Booking Code" placeholder="XX-REST-XXXX" fullWidth className="mb-4" />
        <Button fullWidth>Verify Booking</Button>
      </div>
    </div>
  );
}
