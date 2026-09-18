import React from 'react';
import { Search, X } from 'lucide-react';
import { soundService } from '../services/soundService';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  onlyOnline: boolean;
  onToggleOnlyOnline: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onlyOnline,
  onToggleOnlyOnline,
  inputRef,
}) => {
  return (
    <div className="px-4 sm:px-8 py-4 space-y-3">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar canais por nome, número ou categoria (ou pressione 'S')..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:border-[#8c1010] focus:ring-1 focus:ring-[#690909]/50 outline-none transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                soundService.playBack();
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Online Only */}
        <button
          type="button"
          onClick={() => {
            soundService.playSelect();
            onToggleOnlyOnline();
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition shrink-0 cursor-pointer w-full sm:w-auto justify-center ${
            onlyOnline
              ? 'bg-[#690909]/40 text-[#ff6b6b] border-[#8c1010] shadow-sm shadow-[#690909]/20'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              onlyOnline ? 'bg-[#ff4d4d] shadow-[0_0_8px_rgba(255,77,77,0.8)]' : 'bg-neutral-600'
            }`}
          />
          <span>{onlyOnline ? 'Apenas Canais Online' : 'Todos os Canais'}</span>
        </button>
      </div>

      {/* Categories chips horizontal scroll */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          type="button"
          onClick={() => {
            soundService.playNav();
            onCategoryChange('all');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-[#690909] text-white font-bold border-[#8c1010] shadow-md shadow-[#690909]/30'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
          }`}
        >
          Todos ({categories.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              soundService.playNav();
              onCategoryChange(cat);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-[#690909] text-white font-bold border-[#8c1010] shadow-md shadow-[#690909]/30'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
