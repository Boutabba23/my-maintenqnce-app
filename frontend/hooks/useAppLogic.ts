
import { useState, useEffect, useCallback } from 'react';
import { Machine, FilterGroup, FilterType, View, FilterReference, AssignedFilter, Theme, MaintenanceRecord, Notification, Toast, StockUpdateInfo, CustomColors, SavedTheme } from '../types';
import { calculateNextMaintenance } from '../utils/maintenance';
import { supabase } from '../utils/supabase';

interface ConfirmationDialogConfig {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
       try {
        return JSON.parse(storedValue);
      } catch (e) {
        if (key === 'gestifiltres-theme' && !storedValue.startsWith('"')) {
          console.warn('Old theme format detected, migrating.');
          return storedValue as T;
        }
        throw e;
      }
    }
  } catch (error) {
    console.error(`Error processing localStorage key "${key}":`, error);
  }
  return defaultValue;
};

export const defaultCustomColors: CustomColors = {
  background: '#f8fafc',
  foreground: '#0f172a',
  foregroundSecondary: '#64748b',
  card: '#ffffff',
  cardForeground: '#0f172a',
  primary: '#f97316',
  primaryForeground: '#f8fafc',
  accent: '#f1f5f9',
  destructive: '#ef4444',
  destructiveForeground: '#f8fafc',
  border: '#e2e8f0',
  input: '#f1f5f9',
  ring: '#f97316',
  cardBorders: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'],
};

export const useAppLogic = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [filterTypes, setFilterTypes] = useState<FilterType[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  
  const [theme, _setTheme] = useState<Theme>(() => loadFromStorage('gestifiltres-theme', 'default-light'));
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(() => loadFromStorage('gestifiltres-savedThemes', []));
  const [customColors, setCustomColors] = useState<CustomColors>(() => {
      const saved = loadFromStorage('gestifiltres-customColors', defaultCustomColors);
      return { ...defaultCustomColors, ...saved };
  });
  
  const [highlightedFilterGroupId, setHighlightedFilterGroupId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  
  const [isFilterGroupModalOpen, setIsFilterGroupModalOpen] = useState(false);
  const [editingFilterGroup, setEditingFilterGroup] = useState<FilterGroup | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingMaintenanceRecord, setEditingMaintenanceRecord] = useState<Partial<MaintenanceRecord> | null>(null);
  const [isMaintenanceViewOnly, setIsMaintenanceViewOnly] = useState(false);
  
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [stockUpdateInfo, setStockUpdateInfo] = useState<StockUpdateInfo | null>(null);
  
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [editingCustomTheme, setEditingCustomTheme] = useState<SavedTheme | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [confirmationDialogConfig, setConfirmationDialogConfig] = useState<ConfirmationDialogConfig>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, ...toast }]);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [
        machinesRes,
        filterGroupsRes,
        filterTypesRes,
        maintenanceRecordsRes,
      ] = await Promise.all([
        supabase.from('machines').select('*'),
        supabase.from('filter_groups').select('*'),
        supabase.from('filter_types').select('*'),
        supabase.from('maintenance_records').select('*'),
      ]);

      if (machinesRes.error) throw machinesRes.error;
      if (filterGroupsRes.error) throw filterGroupsRes.error;
      if (filterTypesRes.error) throw filterTypesRes.error;
      if (maintenanceRecordsRes.error) throw maintenanceRecordsRes.error;

      setMachines(machinesRes.data as Machine[]);
      setFilterGroups(filterGroupsRes.data as FilterGroup[]);
      setFilterTypes(filterTypesRes.data as FilterType[]);
      setMaintenanceRecords(maintenanceRecordsRes.data as MaintenanceRecord[]);
      
    } catch (error: any) {
      console.error("Failed to fetch data from Supabase:", error);
      addToast({ type: 'error', title: 'Erreur de chargement', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    localStorage.setItem('gestifiltres-theme', JSON.stringify(theme));
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('gestifiltres-customColors', JSON.stringify(customColors));
  }, [customColors]);
  
  useEffect(() => {
    localStorage.setItem('gestifiltres-savedThemes', JSON.stringify(savedThemes));
  }, [savedThemes]);
  
  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  const navigateToFilterGroup = (groupId: string) => {
    setIsAIAssistantOpen(false);
    setCurrentView(View.FILTER_MANAGEMENT);
    setHighlightedFilterGroupId(groupId);
  };
  
  useEffect(() => {
    const now = new Date().toISOString();
    const currentValidAlerts: Omit<Notification, 'read' | 'createdAt'>[] = [];

    const historyByMachine = new Map<string, MaintenanceRecord[]>();
    maintenanceRecords.forEach(rec => {
        if (!historyByMachine.has(rec.machineId)) historyByMachine.set(rec.machineId, []);
        historyByMachine.get(rec.machineId)!.push(rec);
    });

    machines.forEach(machine => {
        const history = historyByMachine.get(machine.id) || [];
        const nextMaint = calculateNextMaintenance(machine, history);
        if (nextMaint && nextMaint.dueIn <= 50) {
            currentValidAlerts.push({
                id: `maint-alert-${machine.id}-${nextMaint.hours}`,
                type: 'maintenance',
                message: `L'engin ${machine.designation} (${machine.code}) nécessite une maintenance (Gamme ${nextMaint.gamme}) dans ${nextMaint.dueIn}h.`,
                entityId: machine.id,
            });
        }
    });

    filterGroups.forEach(group => {
        group.references.forEach(ref => {
            if (ref.stock > 0 && ref.stock <= 5) {
                currentValidAlerts.push({
                    id: `stock-alert-${ref.id}`,
                    type: 'stock',
                    message: `Le stock pour le filtre ${ref.reference} (${ref.manufacturer}) est faible (${ref.stock} unités).`,
                    entityId: group.id,
                });
            }
        });
    });
    
    setNotifications(prevNotifications => {
        const prevMap = new Map(prevNotifications.map(n => [n.id, n]));
        
        const nextNotifications = currentValidAlerts.map(alert => {
            const prev = prevMap.get(alert.id);
            if (prev) {
                return { ...prev, message: alert.message };
            }
            return { ...alert, read: false, createdAt: now };
        });
        return nextNotifications;
    });

  }, [machines, filterGroups, maintenanceRecords]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const selectMachine = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    if (machine) {
      setSelectedMachine(machine);
      setCurrentView(View.MACHINE_DETAIL);
    }
  };
  
  const assignFilterToMachine = async (machineId: string, filterTypeId: string, filterGroupId: string | null) => {
      const machineToUpdate = machines.find(m => m.id === machineId);
      if (!machineToUpdate) return;

      const newAssignedFilters = [...machineToUpdate.assignedFilters];
      const existingIndex = newAssignedFilters.findIndex(af => af.filterTypeId === filterTypeId);

      if (existingIndex > -1) {
          newAssignedFilters[existingIndex] = { ...newAssignedFilters[existingIndex], filterGroupId };
      } else {
          newAssignedFilters.push({ filterTypeId, filterGroupId });
      }
      
      const { error } = await supabase.from('machines').update({ assignedFilters: newAssignedFilters }).eq('id', machineId);
      if (error) {
          addToast({type: 'error', title: 'Erreur', description: error.message});
      } else {
          fetchData();
          if (selectedMachine?.id === machineId) {
             const updatedMachine = { ...machineToUpdate, assignedFilters: newAssignedFilters };
             setSelectedMachine(updatedMachine);
          }
      }
  };

  const addFilterTypeToMachine = async (machineId: string, filterTypeId: string) => {
    const machineToUpdate = machines.find(m => m.id === machineId);
    if (!machineToUpdate || machineToUpdate.assignedFilters.some(af => af.filterTypeId === filterTypeId)) return;

    const newAssignedFilters = [...machineToUpdate.assignedFilters, { filterTypeId, filterGroupId: null }];
    const { error } = await supabase.from('machines').update({ assignedFilters: newAssignedFilters }).eq('id', machineId);

    if (error) {
        addToast({type: 'error', title: 'Erreur', description: error.message});
    } else {
        fetchData();
        if (selectedMachine?.id === machineId) {
            const updatedMachine = { ...machineToUpdate, assignedFilters: newAssignedFilters };
            setSelectedMachine(updatedMachine);
        }
    }
  };

  const removeFilterTypeFromMachine = async (machineId: string, filterTypeId: string) => {
    const machineToUpdate = machines.find(m => m.id === machineId);
    if (!machineToUpdate) return;
    
    const newAssignedFilters = machineToUpdate.assignedFilters.filter(af => af.filterTypeId !== filterTypeId);
    const { error } = await supabase.from('machines').update({ assignedFilters: newAssignedFilters }).eq('id', machineId);
    
    if (error) {
        addToast({type: 'error', title: 'Erreur', description: error.message});
    } else {
        fetchData();
        if (selectedMachine?.id === machineId) {
            const updatedMachine = { ...machineToUpdate, assignedFilters: newAssignedFilters };
            setSelectedMachine(updatedMachine);
        }
    }
  };

  const openConfirmationDialog = (config: Omit<ConfirmationDialogConfig, 'isOpen' | 'onClose'>) => {
    setConfirmationDialogConfig({ ...config, isOpen: true });
  };
  
  const closeConfirmationDialog = () => {
    setConfirmationDialogConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    confirmationDialogConfig.onConfirm();
    closeConfirmationDialog();
  };

  const openMachineModal = (machine: Machine | null) => {
      setEditingMachine(machine);
      setIsMachineModalOpen(true);
  };
  const closeMachineModal = () => setIsMachineModalOpen(false);
  
  const saveMachine = async (machineData: { code: string; designation: string; marque: string; type: string; serviceHours: number; }) => {
    const machineToSave: Machine = editingMachine 
        ? { ...editingMachine, ...machineData }
        : { id: `m-${Date.now()}`, ...machineData, assignedFilters: [] };
        
    const { error } = await supabase.from('machines').upsert(machineToSave);
    
    if (error) {
        addToast({ type: 'error', title: 'Erreur', description: error.message });
    } else {
        fetchData();
        const successMessage = editingMachine ? 'Engin Mis à Jour' : 'Engin Ajouté';
        addToast({type: 'success', title: successMessage, description: `L'engin ${machineToSave.designation} a été sauvegardé.`});
        if (selectedMachine?.id === machineToSave.id) {
          setSelectedMachine(machineToSave);
      }
    }
    closeMachineModal();
  };
  
  const deleteMachine = async (machineId: string) => {
    const { error } = await supabase.from('machines').delete().eq('id', machineId);
    if (error) {
        addToast({ type: 'error', title: 'Erreur', description: error.message });
    } else {
        fetchData();
        addToast({type: 'info', title: 'Engin Supprimé'});
    }
  };
  
  const closeImportModal = () => setIsImportModalOpen(false);

  const importMachines = async (newMachinesData: Omit<Machine, 'id' | 'assignedFilters'>[]) => {
      const machinesToAdd = newMachinesData.map(nm => ({
          ...nm,
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          assignedFilters: [],
      }));
      const { error } = await supabase.from('machines').insert(machinesToAdd);
      if (error) {
          addToast({ type: 'error', title: 'Erreur d\'importation', description: error.message });
      } else {
          fetchData();
          addToast({type: 'success', title: 'Importation Réussie', description: `${machinesToAdd.length} engins ont été ajoutés.`});
      }
      closeImportModal();
  };

  const openFilterGroupModal = (group: FilterGroup | null) => {
      setEditingFilterGroup(group);
      setIsFilterGroupModalOpen(true);
  };
  const closeFilterGroupModal = () => setIsFilterGroupModalOpen(false);

  const saveFilterGroup = async (groupData: FilterGroup | Omit<FilterGroup, 'id'>) => {
    const groupToSave = 'id' in groupData && groupData.id ? groupData : { ...groupData, id: `fg-${Date.now()}` };
    const { error } = await supabase.from('filter_groups').upsert(groupToSave);
    if (error) {
        addToast({ type: 'error', title: 'Erreur', description: error.message });
    } else {
        fetchData();
        const successMessage = 'id' in groupData && groupData.id ? 'Groupe Mis à Jour' : 'Groupe Créé';
        addToast({ type: 'success', title: successMessage, description: `Le groupe ${groupToSave.name} a été sauvegardé.` });
    }
    closeFilterGroupModal();
  };

  const deleteFilterGroup = async (groupId: string) => {
      const { error } = await supabase.from('filter_groups').delete().eq('id', groupId);
      if (error) {
          addToast({type: 'error', title: 'Erreur', description: error.message});
      } else {
          // Also need to un-assign from machines. This is a non-atomic operation for simplicity.
          machines.forEach(async m => {
              if (m.assignedFilters.some(af => af.filterGroupId === groupId)) {
                  const newAssigned = m.assignedFilters.map(af => af.filterGroupId === groupId ? { ...af, filterGroupId: null } : af);
                  await supabase.from('machines').update({ assignedFilters: newAssigned }).eq('id', m.id);
              }
          });
          fetchData();
          addToast({type: 'info', title: 'Groupe Supprimé'});
      }
  };

  const openMaintenanceModal = (record: Partial<MaintenanceRecord> | null, viewOnly: boolean = false) => {
      setEditingMaintenanceRecord(record);
      setIsMaintenanceViewOnly(viewOnly);
      setIsMaintenanceModalOpen(true);
  };
  const closeMaintenanceModal = () => setIsMaintenanceModalOpen(false);

  const saveMaintenanceRecord = async (recordData: MaintenanceRecord | Omit<MaintenanceRecord, 'id'>) => {
    const recordToSave = 'id' in recordData && recordData.id ? recordData : { ...recordData, id: `maint-${Date.now()}` };
    const { error } = await supabase.from('maintenance_records').upsert(recordToSave);

    if (error) {
        addToast({ type: 'error', title: 'Erreur', description: error.message });
    } else {
        const machine = machines.find(m => m.id === recordData.machineId);
        if (machine && recordData.serviceHours > machine.serviceHours) {
            await supabase.from('machines').update({ serviceHours: recordData.serviceHours }).eq('id', machine.id);
        }
        fetchData();
        const successMessage = 'id' in recordData && recordData.id ? 'Maintenance Mise à Jour' : 'Maintenance Enregistrée';
        addToast({ type: 'success', title: successMessage });
    }
    closeMaintenanceModal();
  };

  const deleteMaintenanceRecord = async (recordId: string) => {
      const { error } = await supabase.from('maintenance_records').delete().eq('id', recordId);
      if (error) {
          addToast({ type: 'error', title: 'Erreur', description: error.message });
      } else {
          fetchData();
          addToast({type: 'info', title: 'Enregistrement Supprimé'});
      }
  };

  const handleNotificationClick = (notification: Notification) => {
      setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, read: true} : n));
      if (notification.type === 'maintenance') {
          selectMachine(notification.entityId);
      } else if (notification.type === 'stock') {
          navigateToFilterGroup(notification.entityId);
      }
  };
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const openAddStockModal = (info: StockUpdateInfo) => {
      setStockUpdateInfo(info);
      setIsAddStockModalOpen(true);
  };
  const closeAddStockModal = () => setIsAddStockModalOpen(false);

  const addStock = async (quantity: number) => {
    if (!stockUpdateInfo) return;
    const { filterReference, filterGroupId } = stockUpdateInfo;
    
    const groupToUpdate = filterGroups.find(g => g.id === filterGroupId);
    if (!groupToUpdate) return;
    
    const newReferences = groupToUpdate.references.map(ref => 
        ref.id === filterReference.id ? { ...ref, stock: ref.stock + quantity } : ref
    );

    const { error } = await supabase.from('filter_groups').update({ references: newReferences }).eq('id', filterGroupId);

    if (error) {
        addToast({ type: 'error', title: 'Erreur', description: error.message });
    } else {
        fetchData();
        addToast({type: 'success', title: 'Stock Ajouté', description: `${quantity} unité(s) ajoutée(s) pour ${filterReference.reference}.`});
    }
    closeAddStockModal();
  };
  
  const setTheme = (themeId: Theme) => {
      _setTheme(themeId);
      if (themeId.startsWith('custom-')) {
        const saved = savedThemes.find(t => t.id === themeId);
        if (saved) setCustomColors(saved.colors);
      }
  };
  
  const openThemeCustomizer = (themeToEdit: SavedTheme | null) => {
    setEditingCustomTheme(themeToEdit);
    setCustomColors(themeToEdit ? themeToEdit.colors : defaultCustomColors);
    setIsThemeCustomizerOpen(true);
  };
  const closeThemeCustomizer = () => {
      setTheme(theme);
      setIsThemeCustomizerOpen(false);
  };

  const saveCustomTheme = (themeData: Omit<SavedTheme, 'id'> & { id?: string }) => {
      if (themeData.id) {
          const updatedThemes = savedThemes.map(t => t.id === themeData.id ? { ...t, ...themeData } : t);
          setSavedThemes(updatedThemes);
          setTheme(themeData.id);
      } else {
          const newTheme: SavedTheme = { ...themeData, id: `custom-${Date.now()}`};
          setSavedThemes([...savedThemes, newTheme]);
          setTheme(newTheme.id);
      }
      addToast({type: 'success', title: 'Thème Enregistré', description: `Le thème "${themeData.name}" a été sauvegardé.`});
  };

  const deleteCustomTheme = (themeId: string) => {
    setSavedThemes(savedThemes.filter(t => t.id !== themeId));
    if (theme === themeId) {
        setTheme('default-light');
    }
     addToast({type: 'info', title: 'Thème Supprimé'});
  };

  const actions = {
      setCurrentView,
      toggleSidebar,
      closeSidebar,
      selectMachine,
      assignFilterToMachine,
      addFilterTypeToMachine,
      removeFilterTypeFromMachine,
      openConfirmationDialog,
      closeConfirmationDialog,
      handleConfirm,
      openMachineModal,
      closeMachineModal,
      saveMachine,
      deleteMachine,
      openFilterGroupModal,
      closeFilterGroupModal,
      saveFilterGroup,
      deleteFilterGroup,
      openMaintenanceModal,
      closeMaintenanceModal,
      saveMaintenanceRecord,
      deleteMaintenanceRecord,
      navigateToFilterGroup,
      clearHighlightedFilterGroup: () => setHighlightedFilterGroupId(null),
      handleNotificationClick,
      markAllNotificationsAsRead,
      openAIAssistant: () => setIsAIAssistantOpen(true),
      closeAIAssistant: () => setIsAIAssistantOpen(false),
      openScanner: () => setIsScannerOpen(true),
      closeScanner: () => setIsScannerOpen(false),
      addToast,
      removeToast,
      openAddStockModal,
      closeAddStockModal,
      addStock,
      setTheme,
      openThemeCustomizer,
      closeThemeCustomizer,
      saveCustomTheme,
      deleteCustomTheme,
      openImportModal: () => setIsImportModalOpen(true),
      closeImportModal,
      importMachines,
  };

  const state = {
      isLoading,
      currentView,
      machines,
      filterGroups,
      filterTypes,
      selectedMachine,
      maintenanceRecords,
      theme,
      customColors,
      savedThemes,
      highlightedFilterGroupId,
      isSidebarOpen,
      notifications,
      toasts,
      isScannerOpen,
      isAIAssistantOpen,
      isMachineModalOpen,
      editingMachine,
      isFilterGroupModalOpen,
      editingFilterGroup,
      isMaintenanceModalOpen,
      editingMaintenanceRecord,
      isMaintenanceViewOnly,
      isAddStockModalOpen,
      stockUpdateInfo,
      isThemeCustomizerOpen,
      editingCustomTheme,
      isImportModalOpen,
      confirmationDialogConfig,
  };
  
  return { state, actions };
};