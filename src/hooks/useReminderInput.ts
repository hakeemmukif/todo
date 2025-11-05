import { useState } from 'react';
import { ReminderPreset } from '../types/task';

export const useReminderInput = (initialPreset: ReminderPreset = 'none') => {
  const [preset, setPreset] = useState<ReminderPreset>(initialPreset);

  const reset = () => {
    setPreset('none');
  };

  return {
    preset,
    setPreset,
    reset,
    hasReminder: preset !== 'none',
  };
};
