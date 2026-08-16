
import clsx from 'clsx';

interface SlotPickerProps {
  slots: { startTime: string; available: boolean }[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
}

export default function SlotPicker({ slots, selectedSlot, onSelect }: SlotPickerProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {slots.map((slot) => {
        const date = new Date(slot.startTime);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isSelected = selectedSlot === slot.startTime;
        
        return (
          <button
            key={slot.startTime}
            disabled={!slot.available}
            onClick={() => onSelect(slot.startTime)}
            className={clsx(
              "py-2 px-1 rounded-lg text-sm font-medium transition-colors border text-center",
              isSelected
                ? "bg-primary text-white border-primary"
                : slot.available
                  ? "bg-surface text-on-surface border-outline-variant hover:border-outline"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            )}
          >
            {timeString}
          </button>
        );
      })}
    </div>
  );
}
