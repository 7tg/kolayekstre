import { useState, useRef } from 'react';
import BankStatementParser from '../parsers/BankStatementParser';
import { ParseResult } from '../types';

interface FileUploadProps {
  onTransactionsLoaded: (result: ParseResult & { filename: string; fileSize: number; parsedAt: Date }) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function FileUpload({ onTransactionsLoaded, isLoading, setIsLoading }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedBank, setSelectedBank] = useState('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parser = new BankStatementParser();

  const handleFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    
    try {
      for (const file of files) {
        if (!file.name.toLowerCase().includes('.xlsx') && !file.name.toLowerCase().includes('.xls')) {
          throw new Error(`Desteklenmeyen dosya formatı: ${file.name}. Sadece Excel dosyaları (.xlsx, .xls) destekleniyor.`);
        }

        const bankType = selectedBank === 'auto' ? null : selectedBank;
        const result = await parser.parseFile(file, bankType);
        
        await onTransactionsLoaded(result);
      }
    } catch (error) {
      alert(`Dosya işleme hatası: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(Array.from(event.target.files));
      event.target.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files) {
      handleFiles(Array.from(event.dataTransfer.files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="file-upload-section">
      <div className="bank-selector">
        <label htmlFor="bank-select">Banka Seçimi:</label>
        <select 
          id="bank-select"
          value={selectedBank} 
          onChange={(e) => setSelectedBank(e.target.value)}
          disabled={isLoading}
        >
          <option value="auto">Otomatik Tespit</option>
          <option value="ziraat">Ziraat Bankası</option>
        </select>
      </div>

      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".xlsx,.xls" 
          onChange={handleFileSelect}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        
        {isLoading ? (
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Dosyalar işleniyor...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <h3>Banka Ekstresini Yükleyin</h3>
            <p>Excel dosyalarınızı buraya sürükleyip bırakın veya tıklayarak seçin</p>
            <div className="supported-formats">
              <small>Desteklenen formatlar: .xlsx, .xls</small>
            </div>
          </div>
        )}
      </div>
      
      <div className="upload-info">
        <p><strong>Not:</strong> Aynı işlemler tekrar yüklenmez, sadece yeni veriler eklenir.</p>
      </div>
    </div>
  );
}