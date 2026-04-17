const PDFDocument = require('pdfkit');
const prisma = require('../utils/db');

exports.generateCertificate = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      include: { analysis: true }
    });

    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-disposition', `attachment; filename=certificate_${farmId}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(25).text('AgroSense AWD Compliance Certificate', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(16).text('This is to certify that the farm located at:', { align: 'center' });
    doc.fontSize(14).text(`${farm.district}, ${farm.state}`, { align: 'center' });
    doc.text(`Lat: ${farm.lat}, Lng: ${farm.lng} | Area: ${farm.area} ha`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text(`AWD Status: ${farm.analysis.awdStatus}`, { align: 'center' });
    doc.fontSize(14).text(`Methane Saved: ${farm.analysis.methaneSaved.toFixed(2)} kg CH4`, { align: 'center' });
    doc.text(`CO2 Equivalent: ${farm.analysis.co2Equivalent.toFixed(2)} kg CO2e`, { align: 'center' });
    doc.text(`Compliance Score: ${farm.analysis.score.toFixed(2)}/100`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' });
    
    doc.moveDown(4);
    doc.text('_________________________', { align: 'right' });
    doc.text('Authorized Signature', { align: 'right' });

    // Fake QR Code placeholder
    doc.rect(400, 550, 100, 100).stroke();
    doc.fontSize(10).text('SCAN VERIFY', 420, 595);

    doc.end();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ error: "Internal server error generating certificate." });
  }
};
