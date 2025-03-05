import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Paper, Divider, Grid } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { pdf } from '@react-pdf/renderer';
import ProposalPDF from './ProposalPDF';
import logoPath from '../../assets/images/logo.jpg';

// Import the react-pdf-viewer components
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Import worker from pdfjs-dist
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

const ProposalDocumentNew = ({ companyInfo, proposalData, clientName, services, onDocumentGenerated }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [documentGenerated, setDocumentGenerated] = useState(false);

  useEffect(() => {
    const generatePDF = async () => {
      // If document has already been generated, don't generate it again
      if (documentGenerated) {
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        console.log('Starting PDF generation with data:', {
          companyInfo: !!companyInfo,
          proposalData: !!proposalData,
          clientName: !!clientName,
          services: Array.isArray(services) ? services.length : 0
        });

        // Generate PDF blob
        const doc = <ProposalPDF 
          companyInfo={companyInfo} 
          proposalData={proposalData} 
          clientName={clientName} 
          services={services} 
        />;
        
        try {
          const asPdf = pdf();
          asPdf.updateContainer(doc);
          const blob = await asPdf.toBlob();
          
          console.log('PDF blob generated successfully:', {
            size: blob.size,
            type: blob.type
          });
          
          // Create blob URL for download only (not for preview)
          const blobUrl = URL.createObjectURL(blob);
          console.log('Created blob URL for download:', blobUrl);
          setPdfUrl(blobUrl);
          
          // Also convert to base64 for API upload
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result;
            console.log('Generated PDF data for upload, length:', base64Data.length);
            
            // Check if proposal_id exists before calling onDocumentGenerated
            if (!proposalData.proposal_id) {
              console.warn('Warning: No proposal_id available in proposalData. Document may not be saved properly.');
            } else {
              console.log('Generating document for proposal ID:', proposalData.proposal_id);
            }
            
            // Call the callback with the data
            if (onDocumentGenerated) {
              onDocumentGenerated({
                base64: base64Data,
                name: `${proposalData.proposal_reference || 'proposal'}.pdf`
              });
            }
            
            // Mark document as generated to prevent infinite loop
            setDocumentGenerated(true);
            setLoading(false);
          };
          
          reader.onerror = (error) => {
            console.error('Error reading blob as data URL:', error);
            setError('Failed to convert document to data URL');
            setDocumentGenerated(true);
            setLoading(false);
          };
          
          reader.readAsDataURL(blob);
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError);
          setError('Failed to generate PDF: ' + pdfError.message);
          setDocumentGenerated(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in generatePDF:', err);
        setError('Failed to generate document: ' + (err.message || 'Unknown error'));
        setDocumentGenerated(true);
        setLoading(false);
      }
    };

    if (companyInfo && proposalData && clientName && services && !documentGenerated) {
      generatePDF();
    }
    
    return () => {
      // Clean up URL when component unmounts
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [companyInfo, proposalData, clientName, services, documentGenerated]);

  const handlePrint = () => {
    if (!pdfUrl) return;
    
    try {
      // Open the PDF in a new tab for printing
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('Error printing:', err);
      setError('Error printing: ' + err.message);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${proposalData.proposal_reference || 'proposal'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading:', err);
      setError('Error downloading: ' + err.message);
    }
  };

  // Calculate VAT and totals
  const calculateTotals = () => {
    if (!proposalData || !services || !Array.isArray(services)) {
      return { subtotal: 0, vat: 0, total: 0 };
    }
    
    const subtotal = services.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
    const vat = subtotal * 0.12; // 12% VAT
    const total = subtotal + vat;
    
    return {
      subtotal: subtotal.toFixed(2),
      vat: vat.toFixed(2),
      total: total.toFixed(2)
    };
  };

  // Render the proposal content as HTML
  const renderProposalContent = () => {
    if (!proposalData || !companyInfo) return null;
    
    const { subtotal, vat, total } = calculateTotals();
    
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          p: 4, 
          height: '100%', 
          overflow: 'auto',
          backgroundColor: '#fff',
          maxWidth: '800px',
          mx: 'auto'
        }}
      >
        {/* Header with Logo */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
          component="img"
          src={logoPath}
          alt="FLN Logo"
          sx={{
            height: '60px', 
              marginRight: '16px',
              objectFit: 'contain'
          }}
        />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {companyInfo.name || 'Company Name'}
              </Typography>
              
              {companyInfo.tagline && (
                <Typography variant="subtitle2" color="text.secondary">
                  {companyInfo.tagline}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            {companyInfo.address && (
              <Typography variant="body2" color="text.secondary">
                {companyInfo.address}
              </Typography>
            )}
            
            {companyInfo.phone && (
              <Typography variant="body2" color="text.secondary">
                {companyInfo.phone}
              </Typography>
            )}
            
            {companyInfo.email && (
              <Typography variant="body2" color="text.secondary">
                {companyInfo.email}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Proposal Title */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            PROPOSAL
          </Typography>
          <Typography variant="h6">
            {proposalData.proposal_reference || 'Reference'}
          </Typography>
        </Box>
        
        {/* Client and Proposal Info */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ width: '48%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              CLIENT
            </Typography>
            <Typography variant="body1">
              {clientName || 'Client Name'}
            </Typography>
            {proposalData.client_address && (
              <Typography variant="body2">
                {proposalData.client_address}
              </Typography>
            )}
            {proposalData.client_email && (
              <Typography variant="body2">
                {proposalData.client_email}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ width: '48%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              PROPOSAL DETAILS
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Date:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {proposalData.proposal_date || new Date().toLocaleDateString()}
                </Typography>
              </Grid>
              
              {proposalData.valid_until && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Valid Until:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {proposalData.valid_until}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {proposalData.status && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {proposalData.status}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Box>
        
        {/* Introduction/Notes */}
        {proposalData.notes && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              INTRODUCTION
            </Typography>
            <Typography variant="body2" paragraph>
              {proposalData.notes}
            </Typography>
          </Box>
        )}
        
        {/* Services */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            SERVICES
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
            {/* Table Header */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f5f5f5', 
              borderBottom: '1px solid #ddd',
              display: 'flex'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 3 }}>
                Service
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1, textAlign: 'right' }}>
                Price
              </Typography>
            </Box>
            
            {/* Table Body */}
            {Array.isArray(services) && services.length > 0 ? (
              services.map((service, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    borderBottom: index < services.length - 1 ? '1px solid #eee' : 'none',
                    display: 'flex'
                  }}
                >
                  <Box sx={{ flex: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {service.service_name || 'Service'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description || 'No description'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Typography variant="body1">
                      ${parseFloat(service.price || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1">No services added to this proposal.</Typography>
              </Box>
            )}
            
            {/* Totals */}
            <Box sx={{ p: 2, borderTop: '2px solid #eee', backgroundColor: '#fafafa' }}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Typography variant="body1" sx={{ flex: 3, textAlign: 'right', pr: 2 }}>
                  Subtotal:
                </Typography>
                <Typography variant="body1" sx={{ flex: 1, textAlign: 'right' }}>
                  ${subtotal}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Typography variant="body1" sx={{ flex: 3, textAlign: 'right', pr: 2 }}>
                  VAT (12%):
                </Typography>
                <Typography variant="body1" sx={{ flex: 1, textAlign: 'right' }}>
                  ${vat}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex' }}>
                <Typography variant="subtitle1" sx={{ flex: 3, textAlign: 'right', pr: 2, fontWeight: 'bold' }}>
                  Total:
                </Typography>
                <Typography variant="subtitle1" sx={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
                  ${total}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
        
        {/* Terms and Conditions */}
        {proposalData.terms && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              TERMS AND CONDITIONS
            </Typography>
            <Typography variant="body2">
              {proposalData.terms}
            </Typography>
          </Box>
        )}
        
        {/* Footer */}
        <Box sx={{ mt: 6, pt: 2, borderTop: '1px solid #eee', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            This is a preview of your proposal. Use the buttons above to print or download the PDF version.
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading || error || !pdfUrl}
        >
          Print PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={loading || error || !pdfUrl}
        >
          Download PDF
        </Button>
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)', border: '1px solid #ddd', backgroundColor: '#f5f5f5', overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%' 
          }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Generating document...</Typography>
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
          renderProposalContent()
        )}
      </Box>
    </Box>
  );
};

export default ProposalDocumentNew; 