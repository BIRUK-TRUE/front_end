import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportReportCardAsPDF(
  elementId: string,
  filename: string,
  options?: { scale?: number }
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Report card element not found');
  }

  const scale = options?.scale || 2;
  
  try {
    // Convert HTML to PNG image
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
    });

    // Create PDF (A4 size: 210mm x 297mm)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = 297;

    // Add image to PDF
    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Save PDF
    pdf.save(filename);
  } catch (error) {
    throw new Error('Failed to generate PDF');
  }
}

export async function exportReportCardsAsZip(
  elements: Array<{ id: string; filename: string }>,
  zipFilename: string
): Promise<void> {
  // For batch export, we'd need JSZip
  // This is a placeholder for future implementation
  throw new Error('Batch export not yet implemented');
}
