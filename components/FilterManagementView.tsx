
import React, { useState } from 'react';
import { FilterGroup, FilterReference } from '../types';
import Button from './ui/Button';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon } from '../constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/Table';
import FilterGroupModal from './FilterGroupModal';
import ConfirmationDialog from './ConfirmationDialog';
import Input from './ui/Input';

interface FilterManagementViewProps {
  filterGroups: FilterGroup[];
  onAddGroup: (group: Omit<FilterGroup, 'id' | 'references'>) => void;
  onUpdateGroup: (group: FilterGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddReference: (groupId: string, reference: Omit<FilterReference, 'id'>) => void;
  onUpdateReference: (groupId: string, reference: FilterReference) => void;
  onDeleteReference: (groupId: string, referenceId: string) => void;
}

const FilterManagementView: React.FC<FilterManagementViewProps> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FilterGroup | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (group: FilterGroup | null = null) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingGroup(null);
    setIsModalOpen(false);
  };

  const handleSaveGroup = (group: FilterGroup) => {
    if (editingGroup) {
      props.onUpdateGroup(group);
    } else {
      props.onAddGroup(group);
    }
  };
  
  const filteredFilterGroups = props.filterGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.references.some(ref =>
      ref.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div>
      <Card className="mb-6">
          <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                      <CardTitle className="text-2xl">Gestion des Groupes de Filtres</CardTitle>
                      <CardDescription>
                          Créez et organisez vos groupes de filtres compatibles.
                      </CardDescription>
                  </div>
                  <Button onClick={() => handleOpenModal()} className="flex-shrink-0">
                      <PlusIcon className="mr-2 h-5 w-5" />
                      <span>Nouveau Groupe</span>
                  </Button>
              </div>
          </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
            <CardTitle>Rechercher un Groupe de Filtres</CardTitle>
            <CardDescription>
                Filtrez par nom, description, ou référence de filtre.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  placeholder="Rechercher par nom, description, référence..."
                  className="w-full max-w-md pl-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {filteredFilterGroups.map(group => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenModal(group)}>
                      <PencilIcon />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setDeletingGroupId(group.id)}>
                      <TrashIcon />
                    </Button>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold text-muted-foreground mb-2">Références compatibles :</h4>
              {group.references.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Fabricant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.references.map(ref => (
                      <TableRow key={ref.id}>
                        <TableCell>{ref.reference}</TableCell>
                        <TableCell>{ref.manufacturer}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground italic">Aucune référence ajoutée à ce groupe.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFilterGroups.length === 0 && searchQuery && (
        <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Aucun groupe ne correspond à votre recherche.</p>
        </div>
      )}
      
      {isModalOpen && (
        <FilterGroupModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveGroup}
          group={editingGroup}
          onAddReference={props.onAddReference}
          onUpdateReference={props.onUpdateReference}
          onDeleteReference={props.onDeleteReference}
        />
      )}

      {deletingGroupId && (
        <ConfirmationDialog
            isOpen={!!deletingGroupId}
            onClose={() => setDeletingGroupId(null)}
            onConfirm={() => {
                props.onDeleteGroup(deletingGroupId);
                setDeletingGroupId(null);
            }}
            title="Supprimer le groupe de filtres"
            description="Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible et le groupe sera désassigné de tous les engins."
        />
      )}

    </div>
  );
};

export default FilterManagementView;
