import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_COLORS = [
  { name: 'Red', value: '#dc4c3e' },
  { name: 'Orange', value: '#ff9a14' },
  { name: 'Yellow', value: '#fad000' },
  { name: 'Green', value: '#4caf50' },
  { name: 'Blue', value: '#4073ff' },
  { name: 'Purple', value: '#a970ff' },
  { name: 'Pink', value: '#eb4c8f' },
  { name: 'Brown', value: '#a0826d' },
  { name: 'Grey', value: '#b8b8b8' },
];

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { themeColor, setThemeColor } = useTaskStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-minimal-bg dark:bg-[#0A0A0A] border border-minimal-border dark:border-[#2A2A2A] w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-minimal-border dark:border-[#2A2A2A]">
          <h2 className="text-lg font-normal text-minimal-text dark:text-[#FAFAFA]">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors rounded text-minimal-text dark:text-[#FAFAFA]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-minimal-text dark:text-[#FAFAFA]">
              Theme Color
            </h3>
            <p className="text-xs opacity-60 mb-4 text-minimal-text dark:text-[#FAFAFA]">
              Choose your accent color for buttons and highlights
            </p>

            <div className="grid grid-cols-3 gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setThemeColor(color.value)}
                  className={`flex flex-col items-center gap-2 p-3 border-2 transition-all rounded ${
                    themeColor === color.value
                      ? 'border-current'
                      : 'border-minimal-border dark:border-[#2A2A2A]'
                  }`}
                  style={{
                    borderColor: themeColor === color.value ? color.value : undefined
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs text-minimal-text dark:text-[#FAFAFA]">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 pt-6 border-t border-minimal-border dark:border-[#2A2A2A]">
            <h3 className="text-sm font-medium mb-3 text-minimal-text dark:text-[#FAFAFA]">
              Preview
            </h3>
            <button
              className="px-4 py-2 text-sm rounded text-white"
              style={{ backgroundColor: themeColor }}
            >
              Add Task Button
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-minimal-border dark:border-[#2A2A2A]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
