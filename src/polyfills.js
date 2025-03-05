// Polyfills for PDF generation
import { Buffer } from 'buffer';
import process from 'process/browser';

window.Buffer = Buffer;
window.process = process;

// Fix for jsPDF and html2canvas
if (typeof window !== 'undefined' && !window.HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {
      const dataURL = this.toDataURL(type, quality);
      const binStr = atob(dataURL.split(',')[1]);
      const len = binStr.length;
      const arr = new Uint8Array(len);
      
      for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }
      
      callback(new Blob([arr], { type: type || 'image/png' }));
    }
  });
}

// Fix for URL.createObjectURL and revokeObjectURL
if (typeof window !== 'undefined') {
  window.URL = window.URL || window.webkitURL;
}

export default {}; 