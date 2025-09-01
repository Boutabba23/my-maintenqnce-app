
import React, { useState } from 'react';
import { Machine } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import Button from './ui/Button';
import { PencilIcon, PlusIcon, TrashIcon, SearchIcon } from '../constants';
import ConfirmationDialog from './ConfirmationDialog';
import Input from './ui/Input';

interface MachineListViewProps {
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
  onAddMachine: () => void;
  onEditMachine: (machine: Machine) => void;
  onDeleteMachine: (machineId: string) => void;
}

const MachineListView: React.FC<MachineListViewProps> = ({ machines, onSelectMachine, onAddMachine, onEditMachine, onDeleteMachine }) => {
  const [deletingMachineId, setDeletingMachineId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
        <Card className="mb-6">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl">Votre Flotte d'Engins</CardTitle>
                        <CardDescription>
                            Gérez, ajoutez, et modifiez vos engins en toute simplicité.
                        </CardDescription>
                    </div>
                    <Button onClick={onAddMachine} className="flex-shrink-0">
                        <PlusIcon className="mr-2 h-5 w-5" />
                        <span>Nouveau Engin</span>
                    </Button>
                </div>
            </CardHeader>
        </Card>

        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Rechercher un Engin</CardTitle>
                <CardDescription>
                    Filtrez votre flotte par nom, marque ou modèle.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom, marque ou modèle..."
                        className="w-full max-w-md pl-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMachines.map((machine) => (
          <Card 
            key={machine.id} 
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary flex flex-col"
            onClick={() => onSelectMachine(machine.id)}
          >
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 sm:mr-2 overflow-hidden">
                        <CardTitle className="truncate">{machine.name}</CardTitle>
                        <CardDescription>{machine.brand} - {machine.model}</CardDescription>
                    </div>
                    <div className="flex space-x-2 self-end sm:self-auto">
                        <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); onEditMachine(machine); }}>
                            <PencilIcon />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); setDeletingMachineId(machine.id); }}>
                            <TrashIcon />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {machine.assignedFilters.filter(f => f.filterGroupId).length} filtres assignés.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMachines.length === 0 && searchQuery && (
        <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Aucun engin ne correspond à votre recherche.</p>
        </div>
      )}

      {deletingMachineId && (
        <ConfirmationDialog
            isOpen={!!deletingMachineId}
            onClose={() => setDeletingMachineId(null)}
            onConfirm={() => {
                if(deletingMachineId) onDeleteMachine(deletingMachineId);
                setDeletingMachineId(null);
            }}
            title="Supprimer l'engin"
            description="Êtes-vous sûr de vouloir supprimer cet engin ? Cette action est irréversible."
        />
      )}
    </div>
  );
};

export default MachineListView;
