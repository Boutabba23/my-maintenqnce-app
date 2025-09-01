
import React from 'react';
import { Theme } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { CheckIcon } from '../constants';

interface ThemeInfo {
  id: Theme;
  name: string;
  type: 'light' | 'dark';
  colors: {
    bg: string;
    card: string;
    primary: string;
    text: string;
  };
}

const themes: ThemeInfo[] = [
    { 
      id: 'default-light', 
      name: 'GestiFiltres Clair', 
      type: 'light', 
      colors: { bg: 'hsl(210 40% 98%)', card: 'hsl(0 0% 100%)', primary: 'hsl(24.6 95% 53.1%)', text: 'hsl(222.2 84% 4.9%)' } 
    },
    { 
      id: 'solarized-light', 
      name: 'Solarized Clair', 
      type: 'light', 
      colors: { bg: 'hsl(46 86% 94%)', card: 'hsl(45 62% 91%)', primary: 'hsl(207 88% 51%)', text: 'hsl(196 15% 42%)' } 
    },
    { 
      id: 'default-dark', 
      name: 'GestiFiltres Sombre', 
      type: 'dark', 
      colors: { bg: 'hsl(222.2 84% 4.9%)', card: 'hsl(222.2 84% 4.9%)', primary: 'hsl(24.6 95% 53.1%)', text: 'hsl(210 40% 98%)' } 
    },
    { 
      id: 'vscode-dark', 
      name: 'VSCode Sombre', 
      type: 'dark', 
      colors: { bg: 'hsl(240 10% 12%)', card: 'hsl(240 7% 16%)', primary: 'hsl(212 100% 40%)', text: 'hsl(0 0% 83%)' } 
    },
    { 
      id: 'nord', 
      name: 'Nord', 
      type: 'dark', 
      colors: { bg: 'hsl(220 13% 21%)', card: 'hsl(220 13% 25%)', primary: 'hsl(194 38% 67%)', text: 'hsl(220 17% 90%)' } 
    },
    { 
      id: 'github-dark', 
      name: 'GitHub Sombre', 
      type: 'dark', 
      colors: { bg: 'hsl(216 28% 7%)', card: 'hsl(220 23% 11%)', primary: 'hsl(212 100% 67%)', text: 'hsl(212 14% 82%)' } 
    },
];

const ThemeCard: React.FC<{ theme: ThemeInfo; isActive: boolean; onClick: () => void }> = ({ theme, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left rounded-lg border-2 transition-all ${isActive ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50'}`}
        aria-label={`Sélectionner le thème ${theme.name}`}
        aria-pressed={isActive}
    >
        <div className="p-4 rounded-md flex flex-col space-y-2" style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}>
            <div className="flex justify-between items-center">
                <span className="font-semibold">{theme.name}</span>
                {isActive && <CheckIcon className="w-5 h-5 text-primary"/>}
            </div>
            <div className="flex space-x-2">
                <div className="flex-1 p-2 rounded" style={{ backgroundColor: theme.colors.card }}>
                    <div className="w-1/2 h-2 rounded" style={{ backgroundColor: theme.colors.primary }}></div>
                </div>
            </div>
        </div>
    </button>
);


interface SettingsViewProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const SettingsView: React.FC<SettingsViewProps> = (props) => {
  const lightThemes = themes.filter(t => t.type === 'light');
  const darkThemes = themes.filter(t => t.type === 'dark');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Paramètres d'Affichage</CardTitle>
          <CardDescription>
            Personnalisez l'apparence de l'application pour qu'elle corresponde à vos préférences.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Thèmes Clairs</CardTitle>
              <CardDescription>Des thèmes lumineux et aérés pour une utilisation en journée.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lightThemes.map(theme => (
                  <ThemeCard 
                      key={theme.id}
                      theme={theme} 
                      isActive={props.currentTheme === theme.id} 
                      onClick={() => props.onThemeChange(theme.id)}
                  />
              ))}
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Thèmes Sombres</CardTitle>
               <CardDescription>Parfait pour les environnements à faible luminosité pour réduire la fatigue oculaire.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {darkThemes.map(theme => (
                  <ThemeCard 
                      key={theme.id}
                      theme={theme} 
                      isActive={props.currentTheme === theme.id} 
                      onClick={() => props.onThemeChange(theme.id)}
                  />
              ))}
          </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;