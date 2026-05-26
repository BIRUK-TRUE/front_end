export async function exportReportCardAsPDF(
  elementId: string,
  filename: string,
  options?: { scale?: number }
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Report card element not found');
  }

  const [{ toPng }, { default: jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
  ]);

  const scale = options?.scale || 2;

  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: scale,
    backgroundColor: '#ffffff',
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = 297;

  pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}

export async function exportReportCardsAsZip(
  _elements: Array<{ id: string; filename: string }>,
  _zipFilename: string
): Promise<void> {
  throw new Error('Batch export not yet implemented');
}
