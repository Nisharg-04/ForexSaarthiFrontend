import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import GoogleTranslate from "./GoogleTranslate";

interface LanguageOption {
  code: string;
  label: string;
}

const languageOptions: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "gu", label: "Gujarati" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "bn", label: "Bengali" },
  { code: "pa", label: "Punjabi" },
  { code: "or", label: "Odia" },
  { code: "as", label: "Assamese" },
  { code: "ur", label: "Urdu" },
  { code: "ne", label: "Nepali" },
];

const LanguageSelector: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<string>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang");
    if (savedLang) {
      setSelectedLang(savedLang);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLang(newLang);
    localStorage.setItem("selectedLang", newLang);

    // Find and update Google Translate select element
    const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = newLang;
      selectEl.dispatchEvent(new Event("change"));
    }

    // Reload page after short delay to apply translation
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const getCurrentLanguageLabel = (): string => {
    const currentLang = languageOptions.find(lang => lang.code === selectedLang);
    return currentLang?.label || "English";
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-1" />
        <select
          onChange={handleChange}
          value={selectedLang}
          className="bg-transparent border-0 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-cyan-400 focus:outline-none cursor-pointer pr-1"
          aria-label="Select Language"
        >
          {languageOptions.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              className="bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            >
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <GoogleTranslate />
    </div>
  );
};

export default LanguageSelector;