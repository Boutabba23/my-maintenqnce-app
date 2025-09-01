import React from 'react';
import { Machine, FilterType, FilterGroup } from '../types';
import Button from './ui/Button';
import { BackIcon } from '../constants';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Select from './ui/Select';

interface MachineDetailViewProps {
  machine: Machine;
  filterTypes: FilterType[];
  filterGroups: FilterGroup[];
  onAssignFilter: (machineId: string, filterTypeId: string, filterGroupId: string | null) => void;
  onBack: () => void;
}

const MachineDetailView: React.FC<MachineDetailViewProps> = ({ machine, filterTypes, filterGroups, onAssignFilter, onBack }) => {

  const getFilterTypeName = (id: string) => filterTypes.find(ft => ft.id === id)?.name || 'Type inconnu';
  
  const getAssignedFilterGroupId = (filterTypeId: string) => {
    return machine.assignedFilters.find(af => af.filterTypeId === filterTypeId)?.filterGroupId || null;
  };

  const handleFilterChange = (filterTypeId: string, newFilterGroupId: string) => {
    onAssignFilter(machine.id, filterTypeId, newFilterGroupId === "none" ? null : newFilterGroupId);
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={onBack} className="mr-4">
          <BackIcon className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Configuration des Filtres pour {machine.name}</h2>
        {filterTypes.map(filterType => (
          <Card key={filterType.id}>
            <CardHeader>
              <CardTitle className="text-xl">{filterType.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium">Groupe de filtres assigné :</span>
                <Select
                  value={getAssignedFilterGroupId(filterType.id) || "none"}
                  onChange={(e) => handleFilterChange(filterType.id, e.target.value)}
                  className="max-w-xs"
                >
                  <option value="none">-- Non assigné --</option>
                  {filterGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </Select>
              </div>
              
              {getAssignedFilterGroupId(filterType.id) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-semibold text-muted-foreground mb-2">Références compatibles :</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {filterGroups.find(fg => fg.id === getAssignedFilterGroupId(filterType.id))?.references.map(ref => (
                      <li key={ref.id}>
                        <span className="font-semibold">{ref.reference}</span> ({ref.manufacturer})
                      </li>
                    ))}
                     {filterGroups.find(fg => fg.id === getAssignedFilterGroupId(filterType.id))?.references.length === 0 && (
                        <li className="text-muted-foreground">Aucune référence dans ce groupe.</li>
                     )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MachineDetailView;