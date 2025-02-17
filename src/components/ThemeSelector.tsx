import React from 'react';
import { Paintbrush, Sparkles, Dumbbell, Minimize } from 'lucide-react';

export type Theme = 'default' | 'anime' | 'feminine' | 'hardcore' | 'minimal';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const themes = [
  {
    id: 'default',
    name: 'Clásico',
    icon: Dumbbell,
    description: 'El tema estándar de la aplicación'
  },
  {
    id: 'anime',
    name: 'Anime',
    icon: Sparkles,
    description: 'Inspirado en el mundo del anime'
  },
  {
    id: 'feminine',
    name: 'Elegante',
    icon: Paintbrush,
    description: 'Diseño suave y elegante'
  },
  {
    id: 'hardcore',
    name: 'Hardcore',
    icon: Dumbbell,
    description: 'Para los más intensos'
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    icon: Minimize,
    description: 'Simple y funcional'
  }
];

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Paintbrush className="w-5 h-5 mr-2" />
        Personalización
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map(({ id, name, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => onThemeChange(id as Theme)}
            className={`p-4 rounded-lg border transition-all ${
              currentTheme === id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon className={`w-6 h-6 ${
                currentTheme === id ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <div className="text-left">
                <h4 className={`font-medium ${
                  currentTheme === id ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {name}
                </h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}