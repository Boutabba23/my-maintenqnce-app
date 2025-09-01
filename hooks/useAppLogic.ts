
import { useState } from 'react';
import { Machine, FilterGroup, FilterType, View, FilterReference, AssignedFilter, Theme } from '../types';

// --- MOCK DATA ---
const initialFilterTypes: FilterType[] = [
  { id: 'ft1', name: 'Filtre à huile moteur' },
  { id: 'ft2', name: 'Filtre à carburant' },
  { id: 'ft3', name: 'Filtre hydraulique' },
  { id: 'ft4', name: 'Filtre à air primaire' },
  { id: 'ft5', name: 'Filtre à air secondaire' },
  { id: 'ft6', name: 'Filtre de cabine' },
];

const initialFilterGroups: FilterGroup[] = [
  {
    id: 'fg1',
    name: 'Filtre à huile standard',
    description: 'Filtre à visser standard pour moteurs diesel moyens.',
    references: [
      { id: 'fr1', reference: 'P551670', manufacturer: 'Donaldson' },
      { id: 'fr2', reference: 'LF3000', manufacturer: 'Fleetguard' },
      { id: 'fr3', reference: '1R-0716', manufacturer: 'Caterpillar' },
    ],
  },
  {
    id: 'fg2',
    name: 'Filtre à carburant haute efficacité',
    description: 'Séparateur d\'eau pour applications lourdes.',
    references: [
      { id: 'fr4', reference: 'P551000', manufacturer: 'Donaldson' },
      { id: 'fr5', reference: 'FS1000', manufacturer: 'Fleetguard' },
    ],
  },
  {
    id: 'fg3',
    name: 'Filtre à air primaire - Type A',
    description: 'Filtre cylindrique pour pelles et chargeuses.',
    references: [
      { id: 'fr6', reference: 'P821575', manufacturer: 'Donaldson' },
      { id: 'fr7', reference: '6I-2503', manufacturer: 'Caterpillar' },
    ],
  },
];

const initialMachines: Machine[] = [
  {
    id: 'm1',
    name: 'Pelle sur chenilles 320D',
    brand: 'Caterpillar',
    model: '320D',
    assignedFilters: [
      { filterTypeId: 'ft1', filterGroupId: 'fg1' },
      { filterTypeId: 'ft2', filterGroupId: 'fg2' },
      { filterTypeId: 'ft4', filterGroupId: 'fg3' },
      { filterTypeId: 'ft6', filterGroupId: null },
    ],
  },
  {
    id: 'm2',
    name: 'Chargeuse sur pneus WA380',
    brand: 'Komatsu',
    model: 'WA380-7',
    assignedFilters: [
      { filterTypeId: 'ft1', filterGroupId: 'fg1' },
      { filterTypeId: 'ft2', filterGroupId: 'fg2' },
      { filterTypeId: 'ft3', filterGroupId: null },
    ],
  },
  {
    id: 'm3',
    name: 'Niveleuse 140M',
    brand: 'Caterpillar',
    model: '140M',
    assignedFilters: [
      { filterTypeId: 'ft1', filterGroupId: null },
      { filterTypeId: 'ft2', filterGroupId: null },
      { filterTypeId: 'ft4', filterGroupId: 'fg3' },
    ],
  },
];


export const useAppLogic = () => {
  const [currentView, setCurrentView] = useState<View>(View.MACHINE_LIST);
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(initialFilterGroups);
  const [filterTypes] = useState<FilterType[]>(initialFilterTypes);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('gestifiltres-theme') as Theme) || 'default-light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const selectMachine = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    if (machine) {
      setSelectedMachine(machine);
      setCurrentView(View.MACHINE_DETAIL);
    }
  };
  
  const assignFilterToMachine = (machineId: string, filterTypeId: string, filterGroupId: string | null) => {
      setMachines(prevMachines => prevMachines.map(machine => {
          if (machine.id === machineId) {
              const newAssignedFilters = [...machine.assignedFilters];
              const existingIndex = newAssignedFilters.findIndex(af => af.filterTypeId === filterTypeId);

              if (existingIndex > -1) {
                  newAssignedFilters[existingIndex] = { ...newAssignedFilters[existingIndex], filterGroupId };
              } else {
                  newAssignedFilters.push({ filterTypeId, filterGroupId });
              }
              const updatedMachine = { ...machine, assignedFilters: newAssignedFilters };

              if(selectedMachine?.id === machineId){
                  setSelectedMachine(updatedMachine);
              }

              return updatedMachine;
          }
          return machine;
      }));
  };

  const addFilterGroup = (group: Omit<FilterGroup, 'id' | 'references'>) => {
    const newGroup: FilterGroup = {
      ...group,
      id: `fg-${Date.now()}`,
      references: [],
    };
    setFilterGroups(prev => [...prev, newGroup]);
  };
  
  const updateFilterGroup = (updatedGroup: FilterGroup) => {
    setFilterGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };
  
  const deleteFilterGroup = (groupId: string) => {
    setFilterGroups(prev => prev.filter(g => g.id !== groupId));
    // Also unassign this filter group from all machines
    setMachines(prevMachines => prevMachines.map(m => ({
        ...m,
        assignedFilters: m.assignedFilters.map(af => af.filterGroupId === groupId ? {...af, filterGroupId: null} : af)
    })));
  };

  const addReferenceToGroup = (groupId: string, reference: Omit<FilterReference, 'id'>) => {
    const newRef: FilterReference = {...reference, id: `fr-${Date.now()}`};
    setFilterGroups(prev => prev.map(g => g.id === groupId ? {...g, references: [...g.references, newRef]} : g));
  };

  const updateReferenceInGroup = (groupId: string, updatedRef: FilterReference) => {
      setFilterGroups(prev => prev.map(g => g.id === groupId ? {
          ...g, 
          references: g.references.map(r => r.id === updatedRef.id ? updatedRef : r)
      } : g));
  };

  const deleteReferenceFromGroup = (groupId: string, referenceId: string) => {
      setFilterGroups(prev => prev.map(g => g.id === groupId ? {
          ...g,
          references: g.references.filter(r => r.id !== referenceId)
      } : g));
  };

  const openMachineModal = (machine: Machine | null) => {
    setEditingMachine(machine);
    setIsMachineModalOpen(true);
  };
  
  const closeMachineModal = () => {
    setEditingMachine(null);
    setIsMachineModalOpen(false);
  };
  
  const saveMachine = (machineData: { name: string; brand: string; model: string; }) => {
    if (editingMachine) {
        // Update
        const updatedMachine = { ...editingMachine, ...machineData };
        setMachines(prev => prev.map(m => m.id === updatedMachine.id ? updatedMachine : m));
        if (selectedMachine?.id === updatedMachine.id) {
            setSelectedMachine(updatedMachine);
        }
    } else {
        // Add
        const newMachine: Machine = {
            id: `m-${Date.now()}`,
            ...machineData,
            assignedFilters: [],
        };
        setMachines(prev => [...prev, newMachine]);
    }
    closeMachineModal();
  };

  const deleteMachine = (machineId: string) => {
      setMachines(prev => prev.filter(m => m.id !== machineId));
      if (selectedMachine?.id === machineId) {
          setSelectedMachine(null);
          setCurrentView(View.MACHINE_LIST);
      }
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('gestifiltres-theme', newTheme);
  };


  return {
    state: {
      currentView,
      machines,
      filterGroups,
      filterTypes,
      selectedMachine,
      theme,
      isSidebarOpen,
      isMachineModalOpen,
      editingMachine,
    },
    actions: {
      setCurrentView,
      selectMachine,
      assignFilterToMachine,
      addFilterGroup,
      updateFilterGroup,
      deleteFilterGroup,
      addReferenceToGroup,
      updateReferenceInGroup,
      deleteReferenceFromGroup,
      setTheme: handleSetTheme,
      toggleSidebar,
      closeSidebar,
      openMachineModal,
      closeMachineModal,
      saveMachine,
      deleteMachine,
    }
  };
};