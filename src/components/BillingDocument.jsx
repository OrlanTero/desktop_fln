import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Paper, Divider, Grid } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { pdf } from '@react-pdf/renderer';
import BillingPDF from './BillingPDF';
import logoPath from '../../assets/images/logo.jpg';

const BillingDocument = ({
  companyInfo,
  project,
  services,
  onDocumentGenerated,
  userSignature,
  userName,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentGenerated, setDocumentGenerated] = useState(false);

  // Format currency to Peso sign with 2 decimal places
  const formatCurrency = amount => {
    return `₱${parseFloat(amount || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    let mounted = true;

    const generatePDF = async () => {
      if (documentGenerated || !mounted) return;

      try {
        setLoading(true);
        setError(null);

        // Make sure we have the required data
        const effectiveCompanyInfo = companyInfo || {
          name: 'FLN Business Consultancy Services',
          address: 'Philippines',
          email: 'contact@flnbusiness.com',
          phone: '+63 XXX XXX XXXX',
        };

        // Check if all required props are available
        if (!project || !Array.isArray(services)) {
          console.warn('Missing required props for PDF generation:', {
            hasCompanyInfo: !!effectiveCompanyInfo,
            hasProject: !!project,
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
          <BillingPDF
            companyInfo={effectiveCompanyInfo}
            project={project}
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
            try {
              // Upload the document if needed
              const uploadResponse = await window.api.document.upload(project.project_id, {
                base64: base64Data,
                name: `billing-statement-${project.project_name || 'document'}.pdf`,
              });

              if (!uploadResponse.success) {
                console.warn(`Document upload warning: ${uploadResponse.message}`);
              }

              onDocumentGenerated({
                base64: base64Data,
                name: `billing-statement-${project.project_name || 'document'}.pdf`,
              });
            } catch (uploadErr) {
              console.error('Error uploading document:', uploadErr);
            }
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

    generatePDF();

    return () => {
      mounted = false;
    };
  }, [
    companyInfo,
    project,
    services,
    documentGenerated,
    onDocumentGenerated,
    userSignature,
    userName,
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      // Generate PDF for download
      const effectiveCompanyInfo = companyInfo || {
        name: 'FLN Business Consultancy Services',
        address: 'Philippines',
        email: 'contact@flnbusiness.com',
        phone: '+63 XXX XXX XXXX',
      };

      // Generate PDF with the correctly structured data
      const doc = (
        <BillingPDF
          companyInfo={effectiveCompanyInfo}
          project={project}
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
      link.download = `billing-statement-${project?.project_name || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading:', err);
      setError('Error downloading: ' + err.message);
    }
  };

  // Get submitted price from job order submissions
  const getSubmittedPrice = jobOrder => {
    if (Array.isArray(jobOrder.submissions) && jobOrder.submissions.length > 0) {
      return jobOrder.submissions.reduce((total, submission) => {
        return total + parseFloat(submission.total_expenses || 0);
      }, 0);
    }
    return parseFloat(jobOrder.price || jobOrder.estimated_fee || 0);
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!Array.isArray(services)) {
      return {
        totalJobOrderPrices: 0,
        totalServiceFees: 0,
        subtotal: 0,
        totalDownpayments: 0,
        balanceDue: 0,
      };
    }

    const totalJobOrderPrices = services.reduce((sum, service) => {
      return (
        sum +
        (Array.isArray(service.jobOrders)
          ? service.jobOrders.reduce((sumJO, jo) => sumJO + getSubmittedPrice(jo), 0)
          : 0)
      );
    }, 0);

    const totalServiceFees = services.reduce((sum, service) => {
      return sum + parseFloat(service.price || 0);
    }, 0);

    const subtotal = totalServiceFees + totalJobOrderPrices;
    const totalDownpayments = project?.downpayment_amount
      ? parseFloat(project.downpayment_amount)
      : 0;
    const balanceDue = subtotal - totalDownpayments;

    return {
      totalJobOrderPrices,
      totalServiceFees,
      subtotal,
      totalDownpayments,
      balanceDue,
    };
  };

  const totals = calculateTotals();

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading || !!error}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={loading || !!error}
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
                    {companyInfo?.name || 'FLN Business Consultancy Services'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  {companyInfo?.address || 'Philippines'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {companyInfo?.phone || '+63 XXX XXX XXXX'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {companyInfo?.email || 'contact@flnbusiness.com'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Billing Title */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                BILLING STATEMENT
              </Typography>
              <Typography variant="h6" sx={{ color: '#2c3e50' }}>
                {project?.project_name || 'Project Name'}
              </Typography>
            </Box>

            {/* Client and Billing Info */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ width: '48%' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', mb: 1, color: '#2c3e50' }}
                >
                  CLIENT
                </Typography>
                <Typography variant="body1">{project?.client_name || 'Client Name'}</Typography>
                {project?.client_address && (
                  <Typography variant="body2" color="text.secondary">
                    {project.client_address}
                  </Typography>
                )}
                {project?.client_email && (
                  <Typography variant="body2" color="text.secondary">
                    {project.client_email}
                  </Typography>
                )}
              </Box>

              <Box sx={{ width: '48%' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', mb: 1, color: '#2c3e50' }}
                >
                  BILLING DETAILS
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {project?.billing_date
                        ? formatDate(project.billing_date)
                        : formatDate(new Date())}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Project ID:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{project?.project_id || 'N/A'}</Typography>
                  </Grid>

                  {project?.due_date && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Due Date:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{formatDate(project.due_date)}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Box>

            {/* Services and Job Orders */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                SERVICES AND JOB ORDERS
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
                    Price
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
                            {service.service_name || 'Uncategorized'}
                          </Typography>
                        </Box>
                        <Typography sx={{ width: '20%', textAlign: 'right' }}></Typography>
                        <Typography sx={{ width: '20%', textAlign: 'right' }}>
                          {formatCurrency(service.price)}
                        </Typography>
                      </Box>

                      {/* Job Orders */}
                      {Array.isArray(service.jobOrders) &&
                        service.jobOrders.map((jobOrder, joIndex) => (
                          <React.Fragment key={`${index}-${joIndex}`}>
                            <Box
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
                                {formatCurrency(getSubmittedPrice(jobOrder))}
                              </Typography>
                              <Typography sx={{ width: '20%', textAlign: 'right' }}></Typography>
                            </Box>
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  ))
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body1">No services added to this billing.</Typography>
                  </Box>
                )}

                {/* Totals */}
                <Box sx={{ backgroundColor: '#fafafa', p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', marginRight: 2 }}>
                      Total Job Order Expenses:
                    </Typography>
                    <Typography variant="body1" sx={{ width: '120px', textAlign: 'right' }}>
                      {formatCurrency(totals.totalJobOrderPrices)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', marginRight: 2 }}>
                      Total Service Fees:
                    </Typography>
                    <Typography variant="body1" sx={{ width: '120px', textAlign: 'right' }}>
                      {formatCurrency(totals.totalServiceFees)}
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
                      SUBTOTAL:
                    </Typography>
                    <Typography variant="body1" sx={{ width: '120px', textAlign: 'right' }}>
                      {formatCurrency(totals.subtotal)}
                    </Typography>
                  </Box>

                  {totals.totalDownpayments > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', marginRight: 2 }}>
                        Less: Downpayment:
                      </Typography>
                      <Typography variant="body1" sx={{ width: '120px', textAlign: 'right' }}>
                        -{formatCurrency(totals.totalDownpayments)}
                      </Typography>
                    </Box>
                  )}

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
                      BALANCE DUE:
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
                      {formatCurrency(totals.balanceDue)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Payment Instructions */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#2c3e50' }}>
                PAYMENT INSTRUCTIONS
              </Typography>
              <Typography variant="body2" paragraph>
                Please settle the balance due upon receipt of this billing statement.
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

            {/* Updated Signatures */}
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
              <Box
                sx={{
                  width: '45%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {userSignature && (
                  <Box
                    component="img"
                    src={userSignature}
                    alt="User Signature"
                    sx={{
                      height: 50,
                      maxWidth: 150,
                      objectFit: 'contain',
                      mb: 1,
                    }}
                  />
                )}
                <Divider sx={{ width: 150, mb: 1 }} />
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {userName || 'User Name'}
                </Typography>
                <Typography variant="body2">Prepared By</Typography>
              </Box>
              <Box
                sx={{
                  width: '45%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{ height: userSignature ? 50 : 0, width: 150, mb: userSignature ? 1 : 0 }}
                />
                <Divider sx={{ width: 150, mb: 1 }} />
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  &nbsp;
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

export default BillingDocument;
