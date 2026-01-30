type ThemeColorRadioProps = {
  value: string;
  selected: string;
  onChange: (value: string) => void;
};

const ThemeColorRadio = ({
  value,
  selected,
  onChange,
}: ThemeColorRadioProps) => {
  const isSelected = value === selected;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onChange(value)}
      className={`
        relative h-6 w-6 rounded-full
        ${value}
        transition-all
        ${isSelected ? "ring-2 ring-blue-500 ring-offset-2 scale-110" : "hover:scale-105"}
      `}
    />
  );
};
