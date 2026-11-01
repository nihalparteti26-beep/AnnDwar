import { Language } from '../types';

export interface LanguageOption {
  code: Language;
  nativeName: string;
  englishName: string;
  flag: string;
  translateCode: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇬🇧', translateCode: 'en' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳', translateCode: 'hi' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', flag: '🇮🇳', translateCode: 'bn' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', flag: '🇮🇳', translateCode: 'te' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', flag: '🇮🇳', translateCode: 'mr' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', flag: '🇮🇳', translateCode: 'ta' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', flag: '🇮🇳', translateCode: 'gu' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', flag: '🇮🇳', translateCode: 'kn' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', flag: '🇮🇳', translateCode: 'ml' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', flag: '🇮🇳', translateCode: 'pa' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', flag: '🇮🇳', translateCode: 'or' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', flag: '🇮🇳', translateCode: 'as' },
];

export function getStoredLanguage(): Language {
  const value = localStorage.getItem('anndwar_language') as Language | null;
  return LANGUAGE_OPTIONS.some((item) => item.code === value) ? (value as Language) : 'hi';
}

export function setGoogleLanguage(language: Language) {
  const code = LANGUAGE_OPTIONS.find((item) => item.code === language)?.translateCode || language;
  const cookieValue = language === 'en' ? '/en/en' : `/en/${code}`;
  document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}; max-age=31536000`;
}

export function clearGoogleLanguage() {
  const expired = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = expired;
  document.cookie = `${expired}; domain=${window.location.hostname}`;
}

export function applyGoogleTranslate(language: Language) {
  if (language === 'hi' || language === 'en') return;
  const code = LANGUAGE_OPTIONS.find((item) => item.code === language)?.translateCode;
  if (!code) return;

  let attempts = 0;
  const timer = window.setInterval(() => {
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
      window.clearInterval(timer);
    }
    attempts += 1;
    if (attempts > 30) window.clearInterval(timer);
  }, 250);
}
