import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatKenyanNumber = (value: string) => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('254')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 9);
  
  let formatted = '';
  if (digits.length > 0) {
    formatted += digits.slice(0, 3);
    if (digits.length > 3) {
      formatted += ' ' + digits.slice(3, 6);
      if (digits.length > 6) {
        formatted += ' ' + digits.slice(6, 9);
      }
    }
  }
  return formatted;
};
