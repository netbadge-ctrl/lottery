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
        className="relative w-full aspect-[16/10] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-200 group"
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
          <div className="text-center text-slate-500 dark:text-slate-400">
            <CameraIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
            <p className="mt-2 font-semibold">点击上传彩票照片</p>
            <p className="text-sm">请确保图片清晰、光线充足</p>
          </div>
        )}
      </div>
      
      {hasImage && (
        <button
          onClick={onScan}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
        >
          开始识别
        </button>
      )}
    </div>
  );
};