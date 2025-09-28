import React, { useRef } from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface ImageUploaderProps {
  onImageChange: (file: File) => void;
  previewUrl: string | null;
  onScan: () => void;
  hasImage: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, previewUrl, onScan, hasImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div 
        className="relative w-full aspect-[16/10] bg-slate-900/50 border border-slate-700 rounded-xl flex items-center justify-center cursor-pointer group transition-all duration-300 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/50"
        onClick={handleUploadClick}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {previewUrl ? (
          <img src={previewUrl} alt="Ticket preview" className="object-contain w-full h-full rounded-xl" />
        ) : (
          <div className="text-center text-slate-400">
            <CameraIcon className="w-12 h-12 mx-auto text-slate-500 group-hover:text-indigo-400 transition-colors" />
            <p className="mt-2 font-semibold">点击上传彩票照片</p>
            <p className="text-sm">请确保图片清晰、光线充足</p>
          </div>
        )}
      </div>
      
      {hasImage && (
        <button
          onClick={onScan}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 shadow-lg shadow-indigo-500/30 animate-pulse-glow"
        >
          开始识别
        </button>
      )}
    </div>
  );
};