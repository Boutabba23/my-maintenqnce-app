
import React, { useState, useEffect } from 'react';
import { Machine } from '../types';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from './ui/Dialog';
import Button from './ui/Button';
import Input from './ui/Input';
import Label from './ui/Label';

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (machine: { code: string; designation: string; marque: string; type: string; serviceHours: number; }) => void;
  machine: Machine | null;
}

const MachineModal: React.FC<MachineModalProps> = ({ isOpen, onClose, onSave, machine }) => {
  const [code, setCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [marque, setMarque] = useState('');
  const [type, setType] = useState('');
  const [serviceHours, setServiceHours] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (machine) {
      setCode(machine.code);
      setDesignation(machine.designation);
      setMarque(machine.marque);
      setType(machine.type);
      setServiceHours(String(machine.serviceHours));
    } else {
      setCode('');
      setDesignation('');
      setMarque('');
      setType('');
      setServiceHours('');
    }
    setError('');
  }, [machine, isOpen]);

  const handleSave = () => {
    if (!code.trim() || !designation.trim() || !marque.trim() || !type.trim() || !serviceHours.trim()) {
        setError('Tous les champs sont requis.');
        return;
    }
    const hours = parseInt(serviceHours, 10);
    if (isNaN(hours) || hours < 0) {
        setError('Les heures de service doivent être un nombre positif.');
        return;
    }
    onSave({ code, designation, marque, type, serviceHours: hours });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{machine ? "Modifier l'engin" : 'Nouvel Engin'}</DialogTitle>
        <DialogDescription>
          Remplissez les informations de l'engin ci-dessous.
        </DialogDescription>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ex: CAT320D" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation">Désignation</Label>
          <Input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="ex: Pelle sur chenilles 320D" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marque">Marque</Label>
          <Input id="marque" value={marque} onChange={(e) => setMarque(e.target.value)} placeholder="ex: Caterpillar" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="ex: 320D" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceHours">Heures de service</Label>
          <Input id="serviceHours" type="number" value={serviceHours} onChange={(e) => setServiceHours(e.target.value)} placeholder="ex: 12500" />
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