import { useState, useRef } from 'react';
import BankStatementParser from '../parsers/BankStatementParser';

export default function FileUpload({ onTransactionsLoaded, isLoading, setIsLoading }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedBank, setSelectedBank] = useState('auto');
  const fileInputRef = useRef(null);

  const parser = new BankStatementParser();

  const handleFiles = async (files) => {
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
      alert(`Dosya işleme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    handleFiles(Array.from(event.target.files));
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(event.dataTransfer.files));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
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