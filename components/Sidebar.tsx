
import React from 'react';
import { View } from '../types';
import { TruckIcon, FilterIcon, LogoutIcon, LogoIcon, SettingsIcon } from '../constants';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isMobileOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobileOpen, closeSidebar }) => {
  const NavItem = ({ view, label, icon }: { view: View; label: string; icon: React.ReactNode }) => {
    // Highlight the "Engins" link even when viewing a specific machine's detail
    const isActive = currentView === view || (view === View.MACHINE_LIST && currentView === View.MACHINE_DETAIL);
    
    return (
      <button
        onClick={() => {
            setCurrentView(view);
            closeSidebar();
        }}
        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground shadow'
            : 'text-foreground/80 hover:bg-muted'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <>
        {isMobileOpen && <div onClick={closeSidebar} className="fixed inset-0 bg-black/50 z-30 md:hidden" aria-hidden="true" />}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-card border-r border-border flex flex-col`}>
          <div className="h-16 flex items-center px-6 border-b border-border">
            <LogoIcon className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold ml-3">GestiFiltres</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <NavItem view={View.MACHINE_LIST} label="Gestion des Engins" icon={<TruckIcon className="h-5 w-5"/>} />
            <NavItem view={View.FILTER_MANAGEMENT} label="Gestion des Filtres" icon={<FilterIcon className="h-5 w-5"/>} />
            <NavItem view={View.SETTINGS} label="Paramètres" icon={<SettingsIcon className="h-5 w-5"/>} />
          </nav>
          <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                    C
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Cosider TP154</p>
                    <p className="text-xs text-muted-foreground">cosidertp154@gmail.com</p>
                  </div>
                </div>
              </div>
              <button className="w-full flex items-center justify-center space-x-2 text-destructive-foreground bg-destructive text-sm font-medium mt-4 p-2 rounded-md hover:bg-destructive/90">
                <LogoutIcon className="h-4 w-4"/>
                <span>Déconnexion</span>
              </button>
          </div>
        </aside>
    </>
  );
};

export default Sidebar;