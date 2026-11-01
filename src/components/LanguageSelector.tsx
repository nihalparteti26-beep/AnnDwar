import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGE_OPTIONS } from '../utils/languages';

interface Props {
  value: Language;
  onChange: (language: Language) => void;
  compact?: boolean;
}

export const LanguageSelector: React.FC<Props> = ({ value, onChange, compact = false }) => {
  const selected = LANGUAGE_OPTIONS.find((item) => item.code === value) || LANGUAGE_OPTIONS[1];

  return (
    <label className={`inline-flex items-center gap-1.5 bg-[#255e4c] hover:bg-[#2c6e59] text-white text-xs font-semibold rounded-full border border-[#3b7d67] ${compact ? 'px-2 py-1' : 'px-2.5 py-1.5'}`}>
      <Globe className="w-3.5 h-3.5 text-[#91e0bd] shrink-0" />
      <select
        aria-label="Select language"
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="bg-transparent text-white outline-none cursor-pointer max-w-[120px]"
      >
        {LANGUAGE_OPTIONS.map((language) => (
          <option key={language.code} value={language.code} className="text-[#143425] bg-white">
            {language.flag} {language.nativeName} · {language.englishName}
          </option>
        ))}
      </select>
      <span className="sr-only">Selected: {selected.nativeName}</span>
    </label>
  );
};
