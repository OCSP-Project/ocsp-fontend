'use client';

import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  onSave: (signatureBase64: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  disabled = false,
  width = 500,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Debug: log coordinates
    console.log('Canvas click:', { 
      clientX: e.clientX, 
      clientY: e.clientY, 
      rectLeft: rect.left, 
      rectTop: rect.top,
      rectWidth: rect.width,
      canvasWidth: canvas.width,
      scaleX,
      x, 
      y 
    });
    
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset drawing style to ensure it's applied
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
    
    console.log('Started drawing at:', x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath(); // Start a new path from current position
    ctx.moveTo(x, y); // Move to current position for smooth drawing
    
    console.log('Drawing to:', x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    
    if (onClear) {
      onClear();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    // Convert canvas to base64
    const signatureBase64 = canvas.toDataURL('image/png');
    onSave(signatureBase64);
  };

  return (
    <div className="flex flex-col gap-3 relative z-50" style={{ isolation: 'isolate' }}>
      <div 
        className="border-2 border-stone-700 rounded-lg overflow-visible bg-white relative z-50"
        style={{ 
          position: 'relative',
          isolation: 'isolate'
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ 
            touchAction: 'none', 
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 99999,
            cursor: 'crosshair !important'
          }}
          className={`${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-crosshair'} block w-full h-full`}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={clearCanvas}
          disabled={disabled || isEmpty}
          className="px-4 py-2 bg-stone-600 hover:bg-stone-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Xóa
        </button>
        
        <button
          type="button"
          onClick={saveSignature}
          disabled={disabled || isEmpty}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Xác nhận chữ ký
        </button>
      </div>
      
      <p className="text-xs text-stone-500">
        Vui lòng vẽ chữ ký của bạn trong khung trên bằng chuột
      </p>
    </div>
  );
};

