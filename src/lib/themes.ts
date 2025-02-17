import type { Theme } from '../components/ThemeSelector';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export const themeColors: Record<Theme, ThemeColors> = {
  default: {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-100',
    accent: 'bg-blue-500',
    background: 'bg-white',
    text: 'text-gray-900'
  },
  anime: {
    primary: 'bg-pink-500',
    secondary: 'bg-purple-100',
    accent: 'bg-purple-400',
    background: 'bg-gray-50',
    text: 'text-gray-800'
  },
  feminine: {
    primary: 'bg-rose-400',
    secondary: 'bg-pink-50',
    accent: 'bg-rose-300',
    background: 'bg-white',
    text: 'text-gray-800'
  },
  hardcore: {
    primary: 'bg-red-600',
    secondary: 'bg-gray-900',
    accent: 'bg-red-500',
    background: 'bg-black',
    text: 'text-white'
  },
  minimal: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-100',
    accent: 'bg-gray-700',
    background: 'bg-white',
    text: 'text-gray-900'
  }
};

export const themeImages = {
  anime: {
    background: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=2070',
    achievements: [
      'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?auto=format&fit=crop&q=80&w=500',
      'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?auto=format&fit=crop&q=80&w=500'
    ]
  },
  feminine: {
    background: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=2070',
    achievements: [
      'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=500',
      'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=500'
    ]
  }
};