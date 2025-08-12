"use client"
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react';

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default", // "default", "destructive", "success", "warning"
  icon: CustomIcon,
  loading = false
}) => {
  const getIcon = () => {
    if (CustomIcon) return CustomIcon;
    
    switch (variant) {
      case "destructive":
        return Trash2;
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "destructive":
        return "text-red-400";
      case "success":
        return "text-emerald-400";
      case "warning":
        return "text-yellow-400";
      default:
        return "text-blue-400";
    }
  };

  const getActionVariant = () => {
    switch (variant) {
      case "destructive":
        return "destructive";
      case "success":
        return "default";
      case "warning":
        return "default";
      default:
        return "default";
    }
  };

  const Icon = getIcon();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gray-800 ${getIconColor()}`}>
              <Icon className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              {title}
            </AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription className="text-gray-400 text-left mt-2">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onCancel}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={loading}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            variant={getActionVariant()}
            disabled={loading}
            className={`${
              variant === "destructive" 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
