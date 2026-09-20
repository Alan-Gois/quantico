import React, { useState, useEffect } from "react";

interface ParameterInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  precision?: number;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
  precision = 2,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    value.toFixed(precision)
  );

  useEffect(() => {
    setInputValue(value.toFixed(precision));
  }, [value, precision]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);

    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleInputBlur = () => {
    if (isNaN(parseFloat(inputValue))) {
      setInputValue(value.toFixed(precision));
    }
  };

  return (
    <div className="flex flex-col gap-2 py-4 px-4 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-center">
        <label className="font-semibold text-sm text-gray-700">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            step={step}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-quantum-500"
          />
          {unit && <span className="text-xs text-gray-600">{unit}</span>}
        </div>
      </div>

      <input
        type="range"
        value={value}
        onChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-quantum-500"
      />

      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default ParameterInput;
