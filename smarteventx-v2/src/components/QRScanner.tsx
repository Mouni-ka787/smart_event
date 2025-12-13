'use client';

import { useState } from 'react';
import { QrReader } from 'react-qr-reader';

interface QRScannerProps {
  onScan: (data: string | null) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result?.text) {
      setScanResult(result.text);
      onScan(result.text);
      onClose();
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scanner error:', err);
    setError('Camera access error. Please ensure you have granted camera permissions.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-4">
            Point your camera at the QR code to scan it
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <QrReader
              onResult={(result: any, error: any) => {
                if (result) {
                  handleScan(result);
                }
                
                if (error) {
                  handleError(error);
                }
              }}
              constraints={{ facingMode: 'environment' }}
              className="w-full"
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {scanResult && (
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-700">QR Code scanned successfully!</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}