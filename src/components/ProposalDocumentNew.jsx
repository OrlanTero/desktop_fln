import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Paper, Divider, Grid } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { pdf } from '@react-pdf/renderer';
import ProposalPDF from './ProposalPDF';
import logoPath from '../../assets/images/logo.jpg';
import defaultSignaturePath from '../../assets/images/default_signature.png';

const ProposalDocumentNew = ({
  companyInfo,
  proposalData,
  clientName,
  services,
  onDocumentGenerated,
  userSignature,
  userName,
  proposal_id,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentGenerated, setDocumentGenerated] = useState(false);

  // Format currency to Peso sign with 2 decimal places
  const formatCurrency = amount => {
    // Using "P" instead of Unicode character which may not display correctly
    return `P ${parseFloat(amount || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  useEffect(() => {
    let mounted = true;

    const generatePDF = async () => {
      if (documentGenerated || !mounted) return;

      try {
        setLoading(true);
        setError(null);

        // Check if all required props are available
        if (!companyInfo || !proposalData || !clientName || !Array.isArray(services)) {
          console.warn('Missing required props for PDF generation:', {
            hasCompanyInfo: !!companyInfo,
            hasProposalData: !!proposalData,
            hasClientName: !!clientName,
            hasServices: Array.isArray(services),
          });
          if (mounted) {
            setError('Missing required data for PDF generation');
            setLoading(false);
          }
          return;
        }

        // Generate PDF in background for download/print
        const doc = (
          <ProposalPDF
            companyInfo={companyInfo}
            proposalData={proposalData}
            clientName={clientName}
            services={services}
            userSignature={userSignature}
            userName={userName}
          />
        );

        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();

        if (!mounted) return;

        // Convert to base64 for API upload
        const reader = new FileReader();
        reader.onloadend = async () => {
          if (!mounted) return;

          const base64Data = reader.result;

          if (typeof onDocumentGenerated === 'function') {
            // Get the correct proposal ID - use explicit prop if available, otherwise get from proposalData
            const effectiveProposalId = proposal_id || proposalData.id || proposalData.proposal_id;

            if (!effectiveProposalId) {
              console.error('No proposal ID available for document upload');
              setError('Missing proposal ID for document upload');
              setDocumentGenerated(true);
              setLoading(false);
              return;
            }

            // Upload the document first
            const uploadResponse = await window.api.document.upload(effectiveProposalId, {
              base64: base64Data,
              name: `${proposalData.proposal_reference || 'proposal'}.pdf`,
            });

            if (!uploadResponse.success) {
              throw new Error(`Failed to upload document: ${uploadResponse.message}`);
            }

            onDocumentGenerated({
              base64: base64Data,
              name: `${proposalData.proposal_reference || 'proposal'}.pdf`,
            });
          }

          setDocumentGenerated(true);
          setLoading(false);
        };

        reader.onerror = error => {
          if (!mounted) return;
          console.error('Error reading blob as data URL:', error);
          setError('Failed to convert document to data URL');
          setDocumentGenerated(true);
          setLoading(false);
        };

        reader.readAsDataURL(blob);
      } catch (err) {
        if (!mounted) return;
        console.error('Error generating PDF:', err);
        setError('Failed to generate PDF: ' + err.message);
        setDocumentGenerated(true);
        setLoading(false);
      }
    };

    if (
      companyInfo &&
      proposalData &&
      clientName &&
      Array.isArray(services) &&
      !documentGenerated
    ) {
      generatePDF();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [
    companyInfo,
    proposalData,
    clientName,
    services,
    documentGenerated,
    onDocumentGenerated,
    userSignature,
    userName,
    proposal_id,
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      // Generate PDF for download with properly formatted company info
      const formattedCompanyInfo = {
        ...companyInfo,
        name: companyInfo?.name || 'FLN Services Corporation', // Ensure name is provided
      };

      // Generate PDF with the correctly structured data
      const doc = (
        <ProposalPDF
          companyInfo={formattedCompanyInfo}
          proposalData={proposalData}
          clientName={clientName}
          services={services}
          userSignature={userSignature}
          userName={userName}
        />
      );

      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);

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
      subtotal: subtotal,
      vat: vat,
      total: total,
    };
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading || error}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={loading || error}
        >
          Download PDF
        </Button>
      </Box>

      <Box
        sx={{
          height: 'calc(100vh - 200px)',
          border: '1px solid #ddd',
          backgroundColor: '#f5f5f5',
          overflow: 'auto',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Generating document...
            </Typography>
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'error.main',
            }}
          >
            <Typography variant="h6">Error</Typography>
            <Typography variant="body2">{error}</Typography>
          </Box>
        ) : (
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
            <Box
              sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  component="img"
                  src={logoPath}
                  alt="Company Logo"
                  sx={{
                    height: '60px',
                    width: 'auto',
                    marginRight: '16px',
                    objectFit: 'contain',
                  }}
                />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    {companyInfo?.name || 'FLN Services Corporation'}
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
              <Typography variant="h6" sx={{ color: '#2c3e50' }}>
                {proposalData?.proposal_reference || 'Reference'}
              </Typography>
            </Box>

            {/* Client and Proposal Info */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ width: '48%' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', mb: 1, color: '#2c3e50' }}
                >
                  CLIENT
                </Typography>
                <Typography variant="body1">{clientName || 'Client Name'}</Typography>
                {proposalData?.client_address && (
                  <Typography variant="body2" color="text.secondary">
                    {proposalData.client_address}
                  </Typography>
                )}
                {proposalData?.client_email && (
                  <Typography variant="body2" color="text.secondary">
                    {proposalData.client_email}
                  </Typography>
                )}
              </Box>

              <Box sx={{ width: '48%' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', mb: 1, color: '#2c3e50' }}
                >
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
                      {proposalData?.proposal_date
                        ? new Date(proposalData.proposal_date).toLocaleDateString()
                        : new Date().toLocaleDateString()}
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
                          {new Date(proposalData.valid_until).toLocaleDateString()}
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
                        <Typography variant="body2">{proposalData.attn_to}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Box>

            {/* Introduction/Notes */}
            {proposalData?.notes && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', mb: 1, color: '#2c3e50' }}
                >
                  INTRODUCTION
                </Typography>
                <Typography variant="body2" paragraph>
                  {proposalData.notes}
                </Typography>
              </Box>
            )}

            {/* Services and Job Orders */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                SERVICES
              </Typography>

              <Paper variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
                {/* Table Header */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ width: '8%', fontWeight: 'bold', color: '#2c3e50' }}
                  >
                    No
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ width: '52%', fontWeight: 'bold', color: '#2c3e50' }}
                  >
                    Particulars
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ width: '20%', fontWeight: 'bold', textAlign: 'right', color: '#2c3e50' }}
                  >
                    Estimated Fees
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ width: '20%', fontWeight: 'bold', textAlign: 'right', color: '#2c3e50' }}
                  >
                    Service Fee
                  </Typography>
                </Box>

                {/* Table Body */}
                {Array.isArray(services) && services.length > 0 ? (
                  services.map((service, index) => (
                    <React.Fragment key={index}>
                      {/* Service Row */}
                      <Box
                        sx={{
                          p: 2,
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          backgroundColor: '#fff',
                        }}
                      >
                        <Typography sx={{ width: '8%', color: '#2c3e50' }}>{index + 1}</Typography>
                        <Box sx={{ width: '52%' }}>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 'medium', color: '#2c3e50' }}
                          >
                            {service.service_name || 'Service'}
                          </Typography>
                          {service.description && (
                            <Typography variant="body2" color="text.secondary">
                              {service.description}
                            </Typography>
                          )}
                        </Box>
                        <Typography sx={{ width: '20%', textAlign: 'right' }}></Typography>
                        <Typography sx={{ width: '20%', textAlign: 'right' }}>
                          {formatCurrency(service.price)}
                        </Typography>
                      </Box>

                      {/* Job Order Rows */}
                      {Array.isArray(service.jobOrders) &&
                        service.jobOrders.map((jobOrder, joIndex) => (
                          <Box
                            key={`${index}-${joIndex}`}
                            sx={{
                              p: 2,
                              pl: 4,
                              borderBottom: '1px solid #eee',
                              display: 'flex',
                              backgroundColor: '#fafafa',
                            }}
                          >
                            <Typography sx={{ width: '8%' }}></Typography>
                            <Typography
                              sx={{ width: '52%', display: 'flex', alignItems: 'center' }}
                            >
                              <span style={{ marginRight: '8px' }}>•</span>
                              {jobOrder.description || 'Job Order'}
                            </Typography>
                            <Typography sx={{ width: '20%', textAlign: 'right' }}>
                              {formatCurrency(jobOrder.estimated_fee)}
                            </Typography>
                            <Typography sx={{ width: '20%', textAlign: 'right' }}></Typography>
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

                  // Calculate totals separately for estimated fees and service fees
                  const totalEstimatedFees = services.reduce((sum, service) => {
                    return (
                      sum +
                      (Array.isArray(service.jobOrders)
                        ? service.jobOrders.reduce(
                            (sum, jo) => sum + parseFloat(jo.estimated_fee || 0),
                            0
                          )
                        : 0)
                    );
                  }, 0);

                  const totalServiceFees = services.reduce((sum, service) => {
                    return sum + parseFloat(service.price || 0);
                  }, 0);

                  const netServiceFee = totalServiceFees;
                  const vatAmount = netServiceFee * 0.12;
                  const totalVatInvoice = netServiceFee + vatAmount;
                  const grandTotal = totalVatInvoice + totalEstimatedFees;

                  return (
                    <Box sx={{ backgroundColor: '#fafafa', p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', marginRight: 2 }}>
                          Total Estimated Fees:
                        </Typography>
                        <Typography variant="body1" sx={{ width: '120px', textAlign: 'right' }}>
                          {formatCurrency(totalEstimatedFees)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', marginRight: 2 }}>
                          Total Service Fees:
                        </Typography>
                        <Typography variant="body1" sx={{ width: '120px', textAlign: 'right' }}>
                          {formatCurrency(totalServiceFees)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          mb: 1,
                          mt: 2,
                          paddingTop: 1,
                          borderTop: '1px solid #eee',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 'bold', marginRight: 2 }}>
                          NET SERVICE FEE:
                        </Typography>
                        <Typography variant="body1" sx={{ width: '120px', textAlign: 'right' }}>
                          {formatCurrency(netServiceFee)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', marginRight: 2 }}>
                          VAT 12%:
                        </Typography>
                        <Typography variant="body1" sx={{ width: '120px', textAlign: 'right' }}>
                          {formatCurrency(vatAmount)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          mb: 1,
                          paddingTop: 1,
                          borderTop: '1px solid #eee',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 'bold', marginRight: 2, color: '#2c3e50' }}
                        >
                          TOTAL VAT INVOICE:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            width: '120px',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#2c3e50',
                          }}
                        >
                          {formatCurrency(totalVatInvoice)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })()}
              </Paper>
            </Box>

            {/* Payment Instructions */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#2c3e50' }}>
                PAYMENT INSTRUCTIONS
              </Typography>
              <Typography variant="body2" paragraph>
                Upon confirmation, a downpayment of 50% of the total service fee is required. The
                remaining balance and estimated fees shall be paid upon completion of the service.
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
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', mb: 1, color: '#2c3e50' }}
                >
                  TERMS AND CONDITIONS
                </Typography>
                <Typography variant="body2">{proposalData.terms}</Typography>
              </Box>
            )}

            {/* Signatures */}
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ width: '45%', textAlign: 'center' }}>
                {userSignature && (
                  <Box
                    component="img"
                    src={userSignature}
                    alt="User Signature"
                    sx={{
                      height: 58,
                      width: 150,
                      maxWidth: '100%',
                      objectFit: 'contain',
                      mb: 1,
                      display: 'block',
                      margin: '0 auto',
                    }}
                  />
                )}
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {userName || 'User Name'}
                </Typography>
                <Typography variant="body2">Prepared By</Typography>
              </Box>
              <Box sx={{ width: '45%', textAlign: 'center' }}>
                <Box
                  component="img"
                  src={defaultSignaturePath}
                  alt="Default Signature"
                  sx={{
                    height: 58,
                    width: 150,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    mb: 1,
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Administrator
                </Typography>
                <Typography variant="body2">Approved By</Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ProposalDocumentNew;
