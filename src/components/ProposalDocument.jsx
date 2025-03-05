import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import ProposalPDF from './ProposalPDF';

const ProposalDocument = ({ companyInfo, proposalData, clientName, services, onDocumentGenerated }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
  const generatePDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate PDF blob
        const doc = <ProposalPDF 
          companyInfo={companyInfo} 
          proposalData={proposalData} 
          clientName={clientName} 
          services={services} 
        />;
        
        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();
        setPdfBlob(blob);

        // If callback is provided, convert blob to base64 and call it
        if (onDocumentGenerated) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onDocumentGenerated({
            base64: reader.result,
              name: `${proposalData.proposal_reference || 'proposal'}.pdf`
          });
        };
        reader.readAsDataURL(blob);
      }

        setLoading(false);
      } catch (err) {
        console.error('Error generating PDF:', err);
        setError('Failed to generate PDF: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    if (companyInfo && proposalData && clientName && services) {
      generatePDF();
    }
  }, [companyInfo, proposalData, clientName, services, onDocumentGenerated]);

  const handlePrint = async () => {
    if (!pdfBlob) return;
    
    try {
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.print();
        }, 100);
      };
    } catch (err) {
      console.error('Error printing:', err);
      setError('Error printing: ' + err.message);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${proposalData.proposal_reference || 'proposal'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading:', err);
      setError('Error downloading: ' + err.message);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading || error || !pdfBlob}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={loading || error || !pdfBlob}
        >
          Download PDF
        </Button>
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)', border: '1px solid #ddd' }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%' 
          }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Generating PDF preview...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'error.main'
          }}>
            <Typography variant="h6">Error</Typography>
            <Typography variant="body2">{error}</Typography>
          </Box>
        ) : (
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            <ProposalPDF 
              companyInfo={companyInfo} 
              proposalData={proposalData} 
              clientName={clientName} 
              services={services} 
            />
          </PDFViewer>
        )}
      </Box>
    </Box>
  );
};

export default ProposalDocument; 