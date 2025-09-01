
import React from 'react';
import { useAppLogic } from './hooks/useAppLogic';
import Header from './components/Header';
import MachineListView from './components/MachineListView';
import MachineDetailView from './components/MachineDetailView';
import FilterManagementView from './components/FilterManagementView';
import { View } from './types';
import Sidebar from './components/Sidebar';
import SettingsView from './components/ThemeSettingsView';
import MachineModal from './components/MachineModal';

const App: React.FC = () => {
  const {
    state,
    actions
  } = useAppLogic();

  React.useEffect(() => {
    const root = window.document.documentElement;
    // Remove all potentially existing theme classes
    const classesToRemove: string[] = [];
    root.classList.forEach(className => {
        if (className.startsWith('theme-')) {
            classesToRemove.push(className);
        }
    });
    if (root.classList.contains('light')) classesToRemove.push('light');
    if (root.classList.contains('dark')) classesToRemove.push('dark');
    
    if (classesToRemove.length > 0) {
        root.classList.remove(...classesToRemove);
    }
    
    // Add the new theme class
    root.classList.add(`theme-${state.theme}`);

  }, [state.theme]);

  const renderView = () => {
    switch (state.currentView) {
      case View.MACHINE_LIST:
        return <MachineListView 
            machines={state.machines} 
            onSelectMachine={actions.selectMachine}
            onAddMachine={() => actions.openMachineModal(null)}
            onEditMachine={(machine) => actions.openMachineModal(machine)}
            onDeleteMachine={actions.deleteMachine}
        />;
      case View.MACHINE_DETAIL:
        if (!state.selectedMachine) return null;
        return (
          <MachineDetailView
            machine={state.selectedMachine}
            filterTypes={state.filterTypes}
            filterGroups={state.filterGroups}
            onAssignFilter={actions.assignFilterToMachine}
            onBack={() => actions.setCurrentView(View.MACHINE_LIST)}
          />
        );
      case View.FILTER_MANAGEMENT:
        return (
          <FilterManagementView
            filterGroups={state.filterGroups}
            onAddGroup={actions.addFilterGroup}
            onUpdateGroup={actions.updateFilterGroup}
            onDeleteGroup={actions.deleteFilterGroup}
            onAddReference={actions.addReferenceToGroup}
            onUpdateReference={actions.updateReferenceInGroup}
            onDeleteReference={actions.deleteReferenceFromGroup}
          />
        );
       case View.SETTINGS:
        return (
            <SettingsView
                currentTheme={state.theme}
                onThemeChange={actions.setTheme}
            />
        );
      default:
        return <MachineListView 
            machines={state.machines} 
            onSelectMachine={actions.selectMachine}
            onAddMachine={() => actions.openMachineModal(null)}
            onEditMachine={(machine) => actions.openMachineModal(machine)}
            onDeleteMachine={actions.deleteMachine}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar 
        currentView={state.currentView} 
        setCurrentView={actions.setCurrentView}
        isMobileOpen={state.isSidebarOpen}
        closeSidebar={actions.closeSidebar}
      />
      <div className="flex flex-col md:pl-64">
        <Header 
            currentView={state.currentView} 
            selectedMachine={state.selectedMachine}
            onMenuClick={actions.toggleSidebar}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
      {state.isMachineModalOpen && (
        <MachineModal
            isOpen={state.isMachineModalOpen}
            onClose={actions.closeMachineModal}
            onSave={actions.saveMachine}
            machine={state.editingMachine}
        />
      )}
    </div>
  );
};

export default App;