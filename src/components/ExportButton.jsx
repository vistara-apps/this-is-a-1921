import React from 'react';
import { Crown } from 'lucide-react';

function ExportButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon: Icon, 
  disabled = false,
  requiresPro = false 
}) {
  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${requiresPro ? 'relative' : ''}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
      {requiresPro && (
        <Crown className="w-4 h-4 text-yellow-500" />
      )}
    </button>
  );
}

export default ExportButton;