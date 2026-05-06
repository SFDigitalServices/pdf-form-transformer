'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function FormTitleInput({ value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor="form-title" className="block text-sm font-medium text-[#0b0c0c]">
        Form title
      </label>
      <input
        id="form-title"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Untitled Form"
        className="w-full h-10 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:border-transparent"
      />
    </div>
  );
}
