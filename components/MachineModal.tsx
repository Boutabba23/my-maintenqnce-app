import React, { useState, useEffect } from 'react';
import { Machine } from '../types';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from './ui/Dialog';
import Button from './ui/Button';
import Input from './ui/Input';
import Label from './ui/Label';

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (machine: { name: string; brand: string; model: string }) => void;
  machine: Machine | null;
}

const MachineModal: React.FC<MachineModalProps> = ({ isOpen, onClose, onSave, machine }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (machine) {
      setName(machine.name);
      setBrand(machine.brand);
      setModel(machine.model);
    } else {
      setName('');
      setBrand('');
      setModel('');
    }
    setError('');
  }, [machine, isOpen]);

  const handleSave = () => {
    if (!name.trim() || !brand.trim() || !model.trim()) {
        setError('Tous les champs sont requis.');
        return;
    }
    onSave({ name, brand, model });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{machine ? 'Modifier l\'engin' : 'Nouvel Engin'}</DialogTitle>
        <DialogDescription>
          Remplissez les informations de l'engin ci-dessous.
        </DialogDescription>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de l'engin</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Pelle sur chenilles 320D" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Marque</Label>
          <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="ex: Caterpillar" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modèle</Label>
          <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="ex: 320D" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default MachineModal;