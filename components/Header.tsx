
import React from 'react';
import { Machine, View } from '../types';
import { MenuIcon } from '../constants';

interface HeaderProps {
  currentView: View;
  selectedMachine: Machine | null;
  onMenuClick: () => void;
}

const BreadcrumbSeparator = () => <span className="mx-2 text-muted-foreground">/</span>;

const Header: React.FC<HeaderProps> = ({ currentView, selectedMachine, onMenuClick }) => {
    
    const getTitle = () => {
        switch(currentView) {
            case View.MACHINE_LIST:
                return "Gestion des Engins";
            case View.MACHINE_DETAIL:
                return selectedMachine?.name || "Détail de l'engin";
            case View.FILTER_MANAGEMENT:
                return "Gestion des Filtres";
            case View.SETTINGS:
                return "Paramètres";
            default:
                return "Tableau de bord";
        }
    }

    return (
        <header className="sticky top-0 z-20 h-16 flex-shrink-0 flex items-center px-4 sm:px-6 lg:px-8 border-b border-border bg-card/80 backdrop-blur-sm">
            <button 
                onClick={onMenuClick} 
                className="md:hidden mr-4 p-2 -ml-2 rounded-full text-foreground/80 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Ouvrir le menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center text-lg">
                <span className="font-semibold text-muted-foreground hidden sm:inline">GestiFiltres</span>
                <span className="font-semibold text-muted-foreground sm:hidden">...</span>
                <BreadcrumbSeparator />
                <span className="font-bold text-foreground">{getTitle()}</span>
            </div>
        </header>
    );
};

export default Header;