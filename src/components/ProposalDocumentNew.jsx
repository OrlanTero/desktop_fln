import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Paper, Divider, Grid } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import ProposalEmailSender from './ProposalEmailSender';
import logoPath from '../../assets/images/logo.jpg';

const ProposalDocumentNew = ({ companyInfo, proposalData, clientName, services, onDocumentGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const response = await window.api.document.getByProposal(proposalData.id);
      if (response.success && response.data) {
        const base64Data = response.data.base64;
        const blob = await fetch(`data:application/pdf;base64,${base64Data}`).then(res => res.blob());
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${proposalData.proposal_reference || 'proposal'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to fetch PDF');
      }
    } catch (err) {
      console.error('Error downloading:', err);
      setError('Error downloading: ' + err.message);
    }
  };

  const handleEmailClick = () => {
    setShowEmailDialog(true);
  };

  const handleEmailClose = () => {
    setShowEmailDialog(false);
  };

  const handleEmailSent = () => {
    setShowEmailDialog(false);
  };

  // Calculate VAT and totals
  const calculateTotals = () => {
    if (!proposalData || !services || !Array.isArray(services)) {
      return { subtotal: 0, vat: 0, total: 0 };
    }
    
    const subtotal = services.reduce((sum, service) => {
      const serviceTotal = parseFloat(service.price || 0);
      const jobOrderTotal = Array.isArray(service.jobOrders) 
        ? service.jobOrders.reduce((sum, jo) => sum + parseFloat(jo.estimated_fee || 0), 0)
        : 0;
      return sum + serviceTotal + jobOrderTotal;
    }, 0);
    
    const vat = subtotal * 0.12; // 12% VAT
    const total = subtotal + vat;
    
    return {
      subtotal: subtotal.toFixed(2),
      vat: vat.toFixed(2),
      total: total.toFixed(2)
    };
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<EmailIcon />}
          onClick={handleEmailClick}
        >
          Send Email
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      <Box sx={{ height: 'calc(100vh - 200px)', border: '1px solid #ddd', backgroundColor: '#f5f5f5', overflow: 'auto' }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            mx: 'auto',
            my: 2,
            maxWidth: '800px',
            backgroundColor: '#fff',
          }}
        >
          {/* Header with Logo */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src={logoPath}
                alt="Company Logo"
                sx={{
                  height: '60px',
                  marginRight: '16px',
                  objectFit: 'contain'
                }}
              />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {companyInfo?.name || 'Company Name'}
                </Typography>
                {companyInfo?.tagline && (
                  <Typography variant="subtitle2" color="text.secondary">
                    {companyInfo.tagline}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              {companyInfo?.address && (
                <Typography variant="body2" color="text.secondary">
                  {companyInfo.address}
                </Typography>
              )}
              {companyInfo?.phone && (
                <Typography variant="body2" color="text.secondary">
                  {companyInfo.phone}
                </Typography>
              )}
              {companyInfo?.email && (
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
              {proposalData?.proposal_reference || 'Reference'}
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
              {proposalData?.client_address && (
                <Typography variant="body2">
                  {proposalData.client_address}
                </Typography>
              )}
              {proposalData?.client_email && (
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
                    {proposalData?.proposal_date || new Date().toLocaleDateString()}
                  </Typography>
                </Grid>

                {proposalData?.valid_until && (
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

                {proposalData?.attn_to && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Attention To:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {proposalData.attn_to}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Box>

          {/* Introduction/Notes */}
          {proposalData?.notes && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                INTRODUCTION
              </Typography>
              <Typography variant="body2" paragraph>
                {proposalData.notes}
              </Typography>
            </Box>
          )}

          {/* Services and Job Orders */}
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
                  Description
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1, textAlign: 'right' }}>
                  Amount
                </Typography>
              </Box>

              {/* Table Body */}
              {Array.isArray(services) && services.length > 0 ? (
                services.map((service, index) => (
                  <React.Fragment key={index}>
                    {/* Service Row */}
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      backgroundColor: '#fff'
                    }}>
                      <Box sx={{ flex: 3 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {service.service_name || 'Service'}
                        </Typography>
                        {service.description && (
                          <Typography variant="body2" color="text.secondary">
                            {service.description}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'right' }}>
                        <Typography variant="body1">
                          ${parseFloat(service.price || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Job Order Rows */}
                    {Array.isArray(service.jobOrders) && service.jobOrders.map((jobOrder, joIndex) => (
                      <Box 
                        key={`${index}-${joIndex}`}
                        sx={{ 
                          p: 2,
                          pl: 4, // Extra padding for indentation
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <Box sx={{ flex: 3 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '8px' }}>•</span>
                            {jobOrder.description || 'Job Order'}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>
                          <Typography variant="body2">
                            ${parseFloat(jobOrder.estimated_fee || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1">No services added to this proposal.</Typography>
                </Box>
              )}

              {/* Totals */}
              {(() => {
                const { subtotal, vat, total } = calculateTotals();
                return (
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
                );
              })()}
            </Paper>
          </Box>

          {/* Payment Instructions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              PAYMENT INSTRUCTIONS
            </Typography>
            <Typography variant="body2" paragraph>
              Upon confirmation, a downpayment of 50% of the total service fee is required.
              The remaining balance and estimated fees shall be paid upon completion of the service.
            </Typography>
            <Typography variant="body2" paragraph>
              Please deposit your payment to:
            </Typography>
            <Typography variant="body2" sx={{ pl: 2 }}>
              Bank: BDO
            </Typography>
            <Typography variant="body2" sx={{ pl: 2 }}>
              Account Name: FLN Business Consultancy Services
            </Typography>
            <Typography variant="body2" sx={{ pl: 2 }}>
              Account Number: 1234567890
            </Typography>
          </Box>

          {/* Terms and Conditions */}
          {proposalData?.terms && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                TERMS AND CONDITIONS
              </Typography>
              <Typography variant="body2">
                {proposalData.terms}
              </Typography>
            </Box>
          )}

          {/* Signatures */}
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ width: '45%', textAlign: 'center' }}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">Prepared By</Typography>
            </Box>
            <Box sx={{ width: '45%', textAlign: 'center' }}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">Approved By</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {showEmailDialog && (
        <ProposalEmailSender
          proposalData={proposalData}
          clientEmail={proposalData?.client_email}
          onClose={handleEmailClose}
          onSent={handleEmailSent}
        />
      )}
    </Box>
  );
};

export default ProposalDocumentNew; 