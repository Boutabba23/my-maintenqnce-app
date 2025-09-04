
import React from 'react';
import { useAppLogic } from './hooks/useAppLogic';
import Header from './components/Header';
import MachineListView from './components/MachineListView';
import MachineDetailView from './components/MachineDetailView';
import FilterManagementView from './components/FilterManagementView';
import { Notification, View } from './types';
import Sidebar from './components/Sidebar';
import SettingsView from './components/ThemeSettingsView';
import MachineModal from './components/MachineModal';
// fix: Use a named import for MaintenanceView as it is now a named export.
import { MaintenanceView } from './components/MaintenanceView';
import DashboardView, { AnalyticsView } from './components/DashboardView';
import FilterGroupModal from './components/FilterGroupModal';
import MaintenanceModal from './components/MaintenanceModal';
import ConfirmationDialog from './components/ConfirmationDialog';
import { themes } from './utils/themes';
import AIAssistantModal from './components/AIAssistantModal';
import ScannerModal from './components/ScannerModal';
import ToastContainer from './components/ToastContainer';
import AddStockModal from './components/AddStockModal';
import ThemeCustomizerModal from './components/ThemeCustomizerModal';
import { hexToHsl, isColorDark } from './utils/colors';
import ImportModal from './components/ImportModal';
import LoginView from './components/LoginView';
import { LogoIcon } from './constants';
import { supabase } from './utils/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const {
    state,
    actions
  } = useAppLogic();

  const [session, setSession] = React.useState<Session | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const customStyleTagId = 'custom-theme-styles';

    const classesToRemove = Array.from(root.classList).filter(
      cls => cls.startsWith('theme-')
    );
    if (classesToRemove.length > 0) {
      root.classList.remove(...classesToRemove);
    }
    const oldStyleTag = document.getElementById(customStyleTagId);
    if (oldStyleTag) {
      oldStyleTag.remove();
    }
    root.classList.remove('dark', 'theme-custom');

    if (state.theme.startsWith('custom')) {
      const style = document.createElement('style');
      style.id = customStyleTagId;
      
      const colors = state.customColors;
      
      style.innerHTML = `
        .theme-custom {
          --background: ${hexToHsl(colors.background)};
          --foreground: ${hexToHsl(colors.foreground)};
          --muted-foreground: ${hexToHsl(colors.foregroundSecondary)};
          --card: ${hexToHsl(colors.card)};
          --card-foreground: ${hexToHsl(colors.cardForeground)};
          --popover: ${hexToHsl(colors.card)};
          --popover-foreground: ${hexToHsl(colors.cardForeground)};
          --primary: ${hexToHsl(colors.primary)};
          --primary-foreground: ${hexToHsl(colors.primaryForeground)};
          --secondary: ${hexToHsl(colors.accent)};
          --secondary-foreground: ${hexToHsl(colors.cardForeground)};
          --muted: ${hexToHsl(colors.accent)};
          --accent: ${hexToHsl(colors.accent)};
          --accent-foreground: ${hexToHsl(colors.cardForeground)};
          --destructive: ${hexToHsl(colors.destructive)};
          --destructive-foreground: ${hexToHsl(colors.destructiveForeground)};
          --border: ${hexToHsl(colors.border)};
          --input: ${hexToHsl(colors.input)};
          --ring: ${hexToHsl(colors.ring)};
          
          --warning: 38 92% 50%;
          --warning-foreground: 48 96% 6%;
        }
      `;
      document.head.appendChild(style);
      root.classList.add('theme-custom');

      if (isColorDark(colors.background)) {
        root.classList.add('dark');
      }
    } else {
      root.classList.add(`theme-${state.theme}`);
      const selectedThemeInfo = themes.find(t => t.id === state.theme);
      if (selectedThemeInfo?.type === 'dark') {
        root.classList.add('dark');
      }
    }
  }, [state.theme, state.customColors]);


  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const machineId = params.get('machineId');
    const filterGroupId = params.get('filterGroupId');

    if (session) {
        if (machineId) {
            actions.selectMachine(machineId);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (filterGroupId) {
            actions.navigateToFilterGroup(filterGroupId);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
  }, [session, actions]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const renderLoadingScreen = () => (
     <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <LogoIcon className="h-12 w-12 text-primary animate-pulse" />
        <p className="mt-4 text-muted-foreground">Chargement...</p>
     </div>
  );
  
  if (authLoading) {
    return renderLoadingScreen();
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LoginView />
      </div>
    );
  }

  if (state.isLoading) {
    return renderLoadingScreen();
  }


  const renderView = () => {
    switch (state.currentView) {
      case View.DASHBOARD:
        return <DashboardView
            machines={state.machines}
            filterGroups={state.filterGroups}
            maintenanceRecords={state.maintenanceRecords}
            onSelectMachine={actions.selectMachine}
            onSetView={actions.setCurrentView}
        />;
      case View.MACHINE_LIST:
        return <MachineListView 
            machines={state.machines} 
            onSelectMachine={actions.selectMachine}
            onAddMachine={() => actions.openMachineModal(null)}
            onEditMachine={(machine) => actions.openMachineModal(machine)}
            onDeleteMachine={actions.deleteMachine}
            onOpenConfirmationDialog={actions.openConfirmationDialog}
            theme={state.theme}
            customCardBorders={state.customColors.cardBorders}
            onOpenImportModal={actions.openImportModal}
        />;
      case View.MACHINE_DETAIL:
        if (!state.selectedMachine) return null;
        return (
          <MachineDetailView
            machine={state.selectedMachine}
            filterTypes={state.filterTypes}
            filterGroups={state.filterGroups}
            onAssignFilter={actions.assignFilterToMachine}
            onAddFilterType={actions.addFilterTypeToMachine}
            onRemoveFilterType={actions.removeFilterTypeFromMachine}
            onBack={() => actions.setCurrentView(View.MACHINE_LIST)}
            onOpenConfirmationDialog={actions.openConfirmationDialog}
            maintenanceRecords={state.maintenanceRecords}
            onOpenMaintenanceModal={actions.openMaintenanceModal}
            onDeleteMaintenance={actions.deleteMaintenanceRecord}
          />
        );
      case View.FILTER_MANAGEMENT:
        return (
          <FilterManagementView
            filterGroups={state.filterGroups}
            onDeleteGroup={actions.deleteFilterGroup}
            onOpenFilterGroupModal={actions.openFilterGroupModal}
            onOpenConfirmationDialog={actions.openConfirmationDialog}
            highlightedFilterGroupId={state.highlightedFilterGroupId}
            onClearHighlight={actions.clearHighlightedFilterGroup}
            onOpenAddStockModal={actions.openAddStockModal}
          />
        );
      case View.MAINTENANCE:
        return (
            <MaintenanceView
                maintenanceRecords={state.maintenanceRecords}
                machines={state.machines}
                onOpenMaintenanceModal={actions.openMaintenanceModal}
                onDeleteMaintenance={actions.deleteMaintenanceRecord}
                onOpenConfirmationDialog={actions.openConfirmationDialog}
            />
        );
       case View.ANALYTICS:
        return (
            <AnalyticsView
                machines={state.machines}
                filterGroups={state.filterGroups}
                maintenanceRecords={state.maintenanceRecords}
                filterTypes={state.filterTypes}
            />
        );
       case View.SETTINGS:
        return (
            <SettingsView
                currentTheme={state.theme}
                savedThemes={state.savedThemes}
                onThemeChange={actions.setTheme}
                onOpenCustomizer={actions.openThemeCustomizer}
                onDeleteTheme={actions.deleteCustomTheme}
                onOpenConfirmationDialog={actions.openConfirmationDialog}
            />
        );
      default:
        return <DashboardView
            machines={state.machines}
            filterGroups={state.filterGroups}
            maintenanceRecords={state.maintenanceRecords}
            onSelectMachine={actions.selectMachine}
            onSetView={actions.setCurrentView}
        />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    actions.handleNotificationClick(notification);
    setIsNotificationsOpen(false);
  };
  
  const handleScanSuccess = (filterGroupId: string) => {
    actions.navigateToFilterGroup(filterGroupId);
    actions.closeScanner();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar 
        currentView={state.currentView} 
        setCurrentView={actions.setCurrentView}
        isMobileOpen={state.isSidebarOpen}
        closeSidebar={actions.closeSidebar}
        onLogout={handleLogout}
        userEmail={session.user.email}
      />
      <div className="flex flex-col md:pl-64">
        <Header 
            currentView={state.currentView} 
            selectedMachine={state.selectedMachine}
            onMenuClick={actions.toggleSidebar}
            notifications={state.notifications}
            isNotificationsOpen={isNotificationsOpen}
            onToggleNotifications={() => setIsNotificationsOpen(p => !p)}
            onCloseNotifications={() => setIsNotificationsOpen(false)}
            onNotificationClick={handleNotificationClick}
            onMarkAllNotificationsAsRead={actions.markAllNotificationsAsRead}
            onOpenAIAssistant={actions.openAIAssistant}
            onOpenScanner={actions.openScanner}
        />
        <main className="relative flex-1 p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
      
      <ToastContainer toasts={state.toasts} onDismiss={actions.removeToast} />

       {state.isScannerOpen && (
            <ScannerModal 
                isOpen={state.isScannerOpen}
                onClose={actions.closeScanner}
                onScan={handleScanSuccess}
            />
        )}
      {state.isAIAssistantOpen && (
          <AIAssistantModal
              isOpen={state.isAIAssistantOpen}
              onClose={actions.closeAIAssistant}
              filterGroups={state.filterGroups}
              onNavigateToGroup={actions.navigateToFilterGroup}
          />
      )}
      {state.isMachineModalOpen && (
        <MachineModal
            isOpen={state.isMachineModalOpen}
            onClose={actions.closeMachineModal}
            onSave={actions.saveMachine}
            machine={state.editingMachine}
        />
      )}
      {state.isFilterGroupModalOpen && (
        <FilterGroupModal
            isOpen={state.isFilterGroupModalOpen}
            onClose={actions.closeFilterGroupModal}
            onSave={actions.saveFilterGroup}
            group={state.editingFilterGroup}
        />
      )}
      {state.isMaintenanceModalOpen && (
        <MaintenanceModal
            isOpen={state.isMaintenanceModalOpen}
            onClose={actions.closeMaintenanceModal}
            onSave={actions.saveMaintenanceRecord}
            machines={state.machines}
            filterTypes={state.filterTypes}
            filterGroups={state.filterGroups}
            record={state.editingMaintenanceRecord}
            viewOnly={state.isMaintenanceViewOnly}
        />
      )}
       {state.isAddStockModalOpen && (
          <AddStockModal
            isOpen={state.isAddStockModalOpen}
            onClose={actions.closeAddStockModal}
            onAdd={actions.addStock}
            stockInfo={state.stockUpdateInfo}
          />
       )}
       {state.isThemeCustomizerOpen && (
        <ThemeCustomizerModal
          isOpen={state.isThemeCustomizerOpen}
          onClose={actions.closeThemeCustomizer}
          onSave={actions.saveCustomTheme}
          initialColors={state.customColors}
          editingTheme={state.editingCustomTheme}
        />
      )}
      {state.isImportModalOpen && (
        <ImportModal
            isOpen={state.isImportModalOpen}
            onClose={actions.closeImportModal}
            onImport={actions.importMachines}
        />
      )}
      <ConfirmationDialog
        isOpen={state.confirmationDialogConfig.isOpen}
        onClose={actions.closeConfirmationDialog}
        onConfirm={actions.handleConfirm}
        title={state.confirmationDialogConfig.title}
        description={state.confirmationDialogConfig.description}
      />
    </div>
  );
};

export default App;