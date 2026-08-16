
import clsx from 'clsx';

interface FilterChipGroupProps {
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export default function FilterChipGroup({ options, selectedValues, onChange }: FilterChipGroupProps) {
  const toggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selectedValues.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
              isSelected 
                ? "bg-primary text-white border-primary" 
                : "bg-surface text-on-surface border-outline-variant hover:border-outline"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
