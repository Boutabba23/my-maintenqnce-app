import React, { useState, useEffect } from 'react';
import { FilterGroup, FilterReference } from '../types';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from './ui/Dialog';
import Button from './ui/Button';
import Input from './ui/Input';
import Label from './ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { PlusIcon, TrashIcon, PencilIcon } from '../constants';

interface FilterGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: FilterGroup) => void;
  group: FilterGroup | null;
  onAddReference: (groupId: string, reference: Omit<FilterReference, 'id'>) => void;
  onUpdateReference: (groupId: string, reference: FilterReference) => void;
  onDeleteReference: (groupId: string, referenceId: string) => void;
}

const FilterGroupModal: React.FC<FilterGroupModalProps> = ({ isOpen, onClose, onSave, group, ...refProps }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [references, setReferences] = useState<FilterReference[]>([]);
  
  const [refInput, setRefInput] = useState({ id: '', reference: '', manufacturer: ''});
  const [isEditingRef, setIsEditingRef] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
      setReferences(group.references);
    } else {
      setName('');
      setDescription('');
      setReferences([]);
    }
  }, [group]);

  const handleSave = () => {
    const finalGroup = {
      id: group?.id || '',
      name,
      description,
      references,
    };
    onSave(finalGroup);
    onClose();
  };
  
  const handleAddOrUpdateReference = () => {
    if (!refInput.reference || !refInput.manufacturer) return;

    if (group) { // Only allow adding/editing if group exists (is being edited)
      if (isEditingRef) {
        refProps.onUpdateReference(group.id, {
            id: refInput.id, 
            reference: refInput.reference, 
            manufacturer: refInput.manufacturer
        });
      } else {
        refProps.onAddReference(group.id, {
            reference: refInput.reference, 
            manufacturer: refInput.manufacturer
        });
      }
    } else { // if creating new group, manage refs locally
        if(isEditingRef) {
            setReferences(refs => refs.map(r => r.id === refInput.id ? {...refInput} : r));
        } else {
            setReferences(refs => [...refs, {...refInput, id: `temp-${Date.now()}`}]);
        }
    }
    
    setRefInput({ id: '', reference: '', manufacturer: '' });
    setIsEditingRef(false);
  };
  
  const handleEditReference = (ref: FilterReference) => {
    setIsEditingRef(true);
    setRefInput(ref);
  }

  const handleDeleteReference = (refId: string) => {
      if (group) {
          refProps.onDeleteReference(group.id, refId);
      } else {
          setReferences(refs => refs.filter(r => r.id !== refId));
      }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{group ? 'Modifier le groupe de filtres' : 'Nouveau groupe de filtres'}</DialogTitle>
        <DialogDescription>
          Remplissez les informations du groupe et gérez ses références compatibles.
        </DialogDescription>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du groupe</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Filtre à huile standard" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex: Pour moteurs diesel moyens" />
        </div>
        <div className="border-t border-border pt-4">
          <h4 className="font-semibold mb-2">Références</h4>
          <div className="flex flex-wrap gap-4 items-end mb-4">
            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="reference" className="text-xs">Référence</Label>
              <Input id="reference" value={refInput.reference} onChange={(e) => setRefInput({...refInput, reference: e.target.value})} placeholder="P551670"/>
            </div>
            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="manufacturer" className="text-xs">Fabricant</Label>
              <Input id="manufacturer" value={refInput.manufacturer} onChange={(e) => setRefInput({...refInput, manufacturer: e.target.value})} placeholder="Donaldson" />
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleAddOrUpdateReference} disabled={!group && !isEditingRef} title={!group ? 'Sauvegardez le groupe pour ajouter des refs' : ''}>
                  <PlusIcon className="mr-2"/> {isEditingRef ? 'Mettre à jour' : 'Ajouter'}
                </Button>
                {isEditingRef && <Button variant="ghost" onClick={() => { setIsEditingRef(false); setRefInput({id:'', reference:'', manufacturer:''}); }}>Annuler</Button>}
            </div>
          </div>
          {references.length > 0 && (
            <div className="relative w-full overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead>Fabricant</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {references.map(ref => (
                        <TableRow key={ref.id}>
                          <TableCell>{ref.reference}</TableCell>
                          <TableCell>{ref.manufacturer}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditReference(ref)} disabled={!group}>
                                <PencilIcon className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteReference(ref.id)} disabled={!group}>
                                <TrashIcon className="h-4 w-4 text-destructive"/>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </Table>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default FilterGroupModal;