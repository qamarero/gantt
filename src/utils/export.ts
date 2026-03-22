import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportAsPng(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#161b22',
    scale: 2,
    scrollX: 0,
    scrollY: 0,
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  const link = document.createElement('a');
  link.download = `gantt-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportAsPdf(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#161b22',
    scale: 2,
    scrollX: 0,
    scrollY: 0,
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Landscape A4
  const pdf = new jsPDF({
    orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [imgWidth / 2, imgHeight / 2],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth / 2, imgHeight / 2);
  pdf.save(`gantt-${new Date().toISOString().slice(0, 10)}.pdf`);
}
