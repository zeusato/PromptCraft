import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface FileData {
  name: string;
  mimeType: string;
  data: string; // Base64 raw
  preview: string; // Data URL for display
}

interface FileUploadProps {
  label: string;
  onFileSelect: (fileData: FileData | null) => void;
  accept?: string;
  initialValue?: FileData | null;
  height?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileSelect,
  accept = "image/*,application/pdf",
  initialValue,
  height = "h-32"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileData, setFileData] = useState<FileData | null>(initialValue || null);
  const { t } = useApp();

  useEffect(() => {
    setFileData(initialValue || null);
  }, [initialValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract base64 data (remove "data:image/xxx;base64,")
        const base64Data = result.split(',')[1];
        const mimeType = file.type;

        const newData = {
          name: file.name,
          mimeType,
          data: base64Data,
          preview: result
        };

        setFileData(newData);
        onFileSelect(newData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onFileSelect(null);
  };

  const isImage = fileData?.mimeType?.startsWith('image/') || false;

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{label}</label>}

      {!fileData ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-white/20 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-white/5 transition duration-300 ${height}`}
        >
          <span className="material-symbols-rounded text-slate-500 group-hover:text-primary text-3xl mb-1 transition-colors">cloud_upload</span>
          <span className="text-[10px] text-slate-400 text-center">{t('upload.label')}</span>
        </div>
      ) : (
        <div className={`relative border border-white/10 rounded-xl overflow-hidden group ${height} bg-black/40 flex items-center justify-center`}>
          {isImage ? (
            <img src={fileData.preview} alt="Preview" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" />
          ) : (
            <div className="flex flex-col items-center p-2 text-center">
              <span className="material-symbols-rounded text-slate-400 text-3xl mb-1">description</span>
              <span className="text-xs text-slate-200 truncate w-full px-2">{fileData.name}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm shadow-lg transform scale-90 hover:scale-100 transition"
              title={t('upload.delete')}
            >
              <span className="material-symbols-rounded text-lg">delete</span>
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
