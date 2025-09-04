
import React, { useState, useEffect } from 'react';
import { Machine, Theme } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import Button from './ui/Button';
import { PencilIcon, PlusIcon, TrashIcon, SearchIcon, EllipsisVerticalIcon, TruckIcon, ClockIcon, FilterIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '../constants';
import Input from './ui/Input';
import EmptyState from './ui/EmptyState';
import { useAppLogic } from '../hooks/useAppLogic';
import { exportMachinesToCSV } from '../utils/export';

interface MachineListViewProps {
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
  onAddMachine: () => void;
  onEditMachine: (machine: Machine) => void;
  onDeleteMachine: (machineId: string) => void;
  onOpenConfirmationDialog: ReturnType<typeof useAppLogic>['actions']['openConfirmationDialog'];
  theme: Theme;
  customCardBorders: string[];
  onOpenImportModal: () => void;
}

const cardColors = [
  { border: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-200' },
  { border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-200' },
  { border: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-200' },
  { border: 'border-l-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/40', text: 'text-rose-800 dark:text-rose-200' },
  { border: 'border-l-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/40', text: 'text-violet-800 dark:text-violet-200' },
  { border: 'border-l-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/40', text: 'text-sky-800 dark:text-sky-200' },
];


const MachineListView: React.FC<MachineListViewProps> = ({ machines, onSelectMachine, onAddMachine, onEditMachine, onDeleteMachine, onOpenConfirmationDialog, theme, customCardBorders, onOpenImportModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (openMenuId && !target.closest('.menu-container')) {
            setOpenMenuId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);
  
  const handleDeleteClick = (machine: Machine) => {
    onOpenConfirmationDialog({
      title: "Supprimer l'engin",
      description: `Êtes-vous sûr de vouloir supprimer l'engin ${machine.designation}? Cette action est irréversible.`,
      onConfirm: () => onDeleteMachine(machine.id)
    });
  };

  const filteredMachines = machines.filter(machine =>
    machine.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (machines.length === 0) {
      return (
        <EmptyState
          icon={<TruckIcon className="h-24 w-24" />}
          title="Votre parc est vide pour le moment"
          description="Commencez par ajouter votre premier engin pour suivre ses filtrations et planifier sa maintenance."
          action={
            <Button onClick={onAddMachine}>
              <PlusIcon className="mr-2 h-5 w-5" />
              Ajouter votre premier engin
            </Button>
          }
        />
      );
    }

    if (filteredMachines.length === 0 && searchQuery) {
      return (
        <EmptyState
          icon={<SearchIcon className="h-24 w-24" />}
          title="Aucun résultat"
          description={`Aucun engin ne correspond à votre recherche pour "${searchQuery}". Essayez avec d'autres mots-clés.`}
          action={
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Effacer la recherche
            </Button>
          }
        />
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMachines.map((machine, index) => {
          const color = cardColors[index % cardColors.length];
          
          const cardStyle: React.CSSProperties = {};
          let cardClassName = 'border-l-4';

          if (theme === 'custom' && customCardBorders.length > 0) {
              cardStyle.borderLeftColor = customCardBorders[index % customCardBorders.length];
          } else {
              cardClassName += ` ${color.border}`;
          }

          return (
            <Card 
              key={machine.id} 
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] flex flex-col min-h-[190px] ${cardClassName}`}
              style={cardStyle}
              onClick={() => onSelectMachine(machine.id)}
            >
              <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 mr-2 overflow-hidden">
                          <CardTitle className="truncate text-xl">{machine.designation}</CardTitle>
                          <CardDescription>{machine.marque} - {machine.type}</CardDescription>
                      </div>
                      <div className="relative menu-container flex-shrink-0">
                          <Button variant="ghost" size="icon" className="-mr-2 -mt-2" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === machine.id ? null : machine.id); }}>
                              <EllipsisVerticalIcon />
                          </Button>
                          {openMenuId === machine.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50 animate-fadeIn">
                                  <ul className="py-1">
                                      <li>
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); onEditMachine(machine); setOpenMenuId(null); }}
                                              className="w-full text-left flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                                          >
                                              <PencilIcon className="mr-3 h-4 w-4" />
                                              Modifier
                                          </button>
                                      </li>
                                      <li>
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); handleDeleteClick(machine); setOpenMenuId(null); }}
                                              className="w-full text-left flex items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                                          >
                                              <TrashIcon className="mr-3 h-4 w-4" />
                                              Supprimer
                                          </button>
                                      </li>
                                  </ul>
                              </div>
                          )}
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                  <div className="w-full space-y-3">
                      <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <FilterIcon className="h-4 w-4" />
                            Filtres assignés
                          </span>
                          <span className="font-bold text-foreground">{machine.assignedFilters.filter(f => f.filterGroupId).length}</span>
                      </div>
                       <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-muted-foreground flex items-center gap-2"><ClockIcon className="h-4 w-4"/> Heures de service</span>
                          <span className="font-bold text-foreground">{machine.serviceHours.toLocaleString()} hs</span>
                      </div>
                      <div className="pt-3 border-t border-dashed border-border">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${color.bg} ${color.text}`}>Code: {machine.code}</span>
                      </div>
                  </div>
              </CardContent>
            </Card>
        )})}
      </div>
    );
  };


  return (
    <div>
        <Card className="mb-6">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl">Votre Parc d'Engins</CardTitle>
                        <CardDescription>
                            Gérez, ajoutez, et modifiez vos engins en toute simplicité.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Button onClick={onOpenImportModal} variant="outline">
                            <ArrowUpTrayIcon className="mr-2 h-5 w-5" />
                            Importer
                        </Button>
                        {machines.length > 0 && (
                            <Button onClick={() => exportMachinesToCSV(machines)} variant="outline">
                                <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
                                Exporter
                            </Button>
                        )}
                        <Button onClick={onAddMachine}>
                            <PlusIcon className="mr-2 h-5 w-5" />
                            <span>Nouveau Engin</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>

        {machines.length > 0 && (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Rechercher un Engin</CardTitle>
                    <CardDescription>
                        Filtrez votre parc par désignation, marque, type ou code.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par désignation, marque, type, code..."
                            className="w-full max-w-md pl-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
        )}

      {renderContent()}
    </div>
  );
};

export default MachineListView;