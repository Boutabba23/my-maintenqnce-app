import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Machine } from '../types';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from './ui/Dialog';
import Button from './ui/Button';
import { ArrowUpTrayIcon, CheckCircleIcon, XCircleIcon } from '../constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

type ParsedMachine = Omit<Machine, 'id' | 'assignedFilters'>;
type ValidatedRow = ParsedMachine & { _error?: string };

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (machines: ParsedMachine[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setFile(null);
    setValidatedRows([]);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateRow = (row: any): ValidatedRow => {
    const requiredFields = ['code', 'designation', 'marque', 'type', 'serviceHours'];
    for (const field of requiredFields) {
      if (!row[field] || String(row[field]).trim() === '') {
        return { ...row, _error: `Champ requis manquant : ${field}` };
      }
    }
    
    const serviceHours = Number(row.serviceHours);
    if (isNaN(serviceHours) || serviceHours < 0) {
      return { ...row, _error: `Heures de service invalides : ${row.serviceHours}` };
    }
    
    return {
        code: String(row.code).trim(),
        designation: String(row.designation).trim(),
        marque: String(row.marque).trim(),
        type: String(row.type).trim(),
        serviceHours,
    };
  };


  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setValidatedRows([]);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validated = results.data.map(validateRow);
        setValidatedRows(validated);
        setIsProcessing(false);
      },
      error: (error) => {
        console.error("Erreur d'analyse CSV:", error);
        setIsProcessing(false);
      }
    });
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleImportClick = () => {
    const validMachines = validatedRows.filter(row => !row._error);
    if (validMachines.length > 0) {
      onImport(validMachines);
    }
  };

  const validRows = validatedRows.filter(row => !row._error);
  const invalidRows = validatedRows.filter(row => row._error);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogHeader>
        <DialogTitle>Importer des Engins</DialogTitle>
        <DialogDescription>
          Importez une liste d'engins depuis un fichier CSV. Les colonnes requises sont : 
          <code className="mx-1 p-1 bg-muted rounded-sm text-xs">code</code>, 
          <code className="mx-1 p-1 bg-muted rounded-sm text-xs">designation</code>, 
          <code className="mx-1 p-1 bg-muted rounded-sm text-xs">marque</code>, 
          <code className="mx-1 p-1 bg-muted rounded-sm text-xs">type</code>, et 
          <code className="mx-1 p-1 bg-muted rounded-sm text-xs">serviceHours</code>.
        </DialogDescription>
      </DialogHeader>
      <DialogContent>
        {!file ? (
          <div 
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ArrowUpTrayIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Cliquez pour téléverser</span> ou glissez-déposez
                </p>
                <p className="text-xs text-muted-foreground">Fichier CSV (max 5MB)</p>
            </div>
            <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                accept=".csv"
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
                <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    {validRows.length} Ligne(s) Valide(s) pour l'Importation
                </h3>
                {validRows.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background/95">
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Désignation</TableHead>
                                    <TableHead>Heures</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {validRows.map((row, i) => (
                                    <TableRow key={`valid-${i}`}>
                                        <TableCell>{row.code}</TableCell>
                                        <TableCell>{row.designation}</TableCell>
                                        <TableCell>{row.serviceHours}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
            {invalidRows.length > 0 && (
                 <div>
                    <h3 className="font-semibold flex items-center gap-2">
                        <XCircleIcon className="w-5 h-5 text-destructive" />
                        {invalidRows.length} Ligne(s) Ignorée(s)
                    </h3>
                    <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background/95">
                                <TableRow>
                                    <TableHead>Ligne</TableHead>
                                    <TableHead>Erreur</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invalidRows.map((row, i) => (
                                    <TableRow key={`invalid-${i}`}>
                                        <TableCell>{JSON.stringify(row)}</TableCell>
                                        <TableCell className="text-destructive text-xs">{row._error}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
          </div>
        )}
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>Annuler</Button>
        <Button onClick={handleImportClick} disabled={validRows.length === 0 || isProcessing}>
          {isProcessing ? 'Analyse en cours...' : `Importer ${validRows.length} engin(s)`}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ImportModal;