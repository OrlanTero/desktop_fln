import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  Transform as ConvertIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import ProposalDocumentNew from '../components/ProposalDocumentNew';
import EmailProposalForm from '../components/EmailProposalForm';
import { useAuth } from '../contexts/AuthContext';

const ProposalView = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // State for proposal data
  const [proposalData, setProposalData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [showingEmail, setShowingEmail] = useState(false);
  const [documentBase64, setDocumentBase64] = useState(null);
  const [userSignature, setUserSignature] = useState(null);
  const [userName, setUserName] = useState(null);

  // Fetch proposal data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch proposal
        const proposalResponse = await window.api.proposal.getById(id);
        if (!proposalResponse.success) {
          throw new Error('Failed to load proposal: ' + proposalResponse.message);
        }

        const proposal = proposalResponse.data;
        setProposalData(proposal);

        // Fetch client
        if (proposal.client_id) {
          const clientResponse = await window.api.client.getById(proposal.client_id);
          if (clientResponse.success) {
            setClientData(clientResponse.data);
          }
        }

        // Fetch services
        const servicesResponse = await window.api.proService.getByProposal(id);
        if (servicesResponse.success) {
          const services = servicesResponse.data || [];

          // Fetch job orders for each service
          const servicesWithJobOrders = await Promise.all(
            services.map(async service => {
              // Fetch job orders for this service
              const jobOrdersResponse = await window.api.jobOrders.getByService(
                service.service_id,
                id
              );

              // Attach job orders to the service
              return {
                ...service,
                jobOrders: jobOrdersResponse.success ? jobOrdersResponse.data : [],
              };
            })
          );

          setServices(servicesWithJobOrders);
        }

        // Fetch company info
        const companyResponse = await window.api.companyInfo.get();
        if (companyResponse.success) {
          setCompanyInfo(companyResponse.data);
        }

        // Fetch document
        const documentResponse = await window.api.proposal.getDocument(id);
        if (documentResponse.success && documentResponse.data) {
          setDocumentBase64(documentResponse.data.base64);
        }

        // Fetch user profile to get signature
        if (currentUser && currentUser.id) {
          const userProfileResponse = await window.api.userProfile.getProfile(currentUser.id);
          if (
            userProfileResponse.success &&
            userProfileResponse.data &&
            userProfileResponse.data.user
          ) {
            const signatureUrl = userProfileResponse.data.user.signature_url;
            if (signatureUrl) {
              // Format the URL properly for use in the PDF
              const formattedSignatureUrl = window.api.utils.formatUploadUrl(signatureUrl);
              setUserSignature(formattedSignatureUrl);
            }
          }
        }

        // Fetch user name
        if (currentUser && currentUser.name) {
          setUserName(currentUser.name);
        }
      } catch (err) {
        setError('Error loading proposal: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get status chip color
  const getStatusColor = status => {
    switch (status?.toUpperCase()) {
      case 'DRAFT':
        return 'default';
      case 'SENT':
        return 'info';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'CONVERTED':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Handle actions
  const handleEditProposal = () => {
    navigate(`/proposals/edit/${id}`);
  };

  const handleConvertToProject = () => {
    if (proposalData.status.toLowerCase() !== 'accepted') {
      setError('Only accepted proposals can be converted to projects');
      return;
    }

    navigate('/projects/new', {
      state: {
        proposalData: proposalData,
        isConversion: true,
      },
    });
  };

  const handleBackToList = () => {
    navigate('/proposals');
  };

  const handleSendEmail = () => {
    setShowingEmail(true);
  };

  const handleEmailSent = () => {
    setSuccess('Email sent successfully');
    setShowingEmail(false);

    // Update proposal status to Sent
    const updateStatus = async () => {
      try {
        await window.api.proposal.updateStatus(id, { status: 'Sent' });
        // Refresh proposal data
        const response = await window.api.proposal.getById(id);
        if (response.success) {
          setProposalData(response.data);
        }
      } catch (err) {
        setError('Error updating proposal status: ' + err.message);
      }
    };

    updateStatus();
  };

  const handleContinueEditing = () => {
    // If the proposal is a draft, navigate to the edit page
    if (proposalData.status.toLowerCase() === 'draft') {
      handleEditProposal();
    } else {
      setError('Only draft proposals can be edited');
    }
  };

  const handlePrintDocument = () => {
    // Open the document in a new window and print
    if (documentBase64) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Proposal</title>
          </head>
          <body>
            <embed width="100%" height="100%" src="data:application/pdf;base64,${documentBase64}" type="application/pdf" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      setError('Document not available for printing');
    }
  };

  // Handle generate document
  const handleGenerateDocument = data => {
    setDocumentBase64(data.base64);
  };

  if (loading) {
    return (
      <Layout title="View Proposal" user={user} onLogout={onLogout}>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!proposalData) {
    return (
      <Layout title="View Proposal" user={user} onLogout={onLogout}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Proposal not found</Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
            sx={{ mt: 2 }}
          >
            Back to Proposals
          </Button>
        </Box>
      </Layout>
    );
  }

  // Calculate totals
  const calculateTotal = () => {
    return services.reduce((total, service) => {
      // Sum service fee
      const serviceTotal = parseFloat(service.price || 0);

      // Sum job order estimated fees
      const jobOrdersTotal = Array.isArray(service.jobOrders)
        ? service.jobOrders.reduce(
            (sum, jobOrder) => sum + parseFloat(jobOrder.estimated_fee || 0),
            0
          )
        : 0;

      return total + serviceTotal + jobOrdersTotal;
    }, 0);
  };

  return (
    <Layout title="View Proposal" user={user} onLogout={onLogout}>
      <PageHeader
        title="Proposal Details"
        subtitle={`Viewing proposal ${proposalData.proposal_reference}`}
      />

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
          Back to List
        </Button>

        {proposalData.status?.toLowerCase() === 'draft' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleContinueEditing}
          >
            Continue Editing
          </Button>
        )}

        {proposalData.status?.toLowerCase() === 'draft' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleSendEmail}
          >
            Send to Client
          </Button>
        )}

        {proposalData.status?.toLowerCase() === 'accepted' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<ConvertIcon />}
            onClick={handleConvertToProject}
          >
            Convert to Project
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrintDocument}
          disabled={!documentBase64}
        >
          Print
        </Button>
      </Box>

      {showingEmail ? (
        // Email Form
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Send Proposal via Email
          </Typography>
          <EmailProposalForm
            proposalData={{
              ...proposalData,
              documentBase64: documentBase64,
            }}
            onEmailSent={handleEmailSent}
            onCancel={() => setShowingEmail(false)}
          />
        </Paper>
      ) : proposalData.status.toLowerCase() === 'draft' ? (
        // Document generation form
        <Box sx={{ mt: 2 }}>
          <ProposalDocumentNew
            companyInfo={companyInfo}
            proposalData={proposalData}
            clientName={clientData ? clientData.client_name : ''}
            services={services}
            onDocumentGenerated={handleGenerateDocument}
            userSignature={userSignature}
            userName={userName}
            proposal_id={proposalData.id || proposalData.proposal_id}
          />
        </Box>
      ) : (
        // Proposal Details
        <>
          {/* Proposal Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Proposal Information</Typography>
                  <Chip label={proposalData.status} color={getStatusColor(proposalData.status)} />
                </Box>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Proposal Name
                </Typography>
                <Typography variant="body1">{proposalData.proposal_name}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reference
                </Typography>
                <Typography variant="body1">{proposalData.proposal_reference}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Client
                </Typography>
                <Typography variant="body1">{clientData?.client_name || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Attention To
                </Typography>
                <Typography variant="body1">{proposalData.attn_to || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created On
                </Typography>
                <Typography variant="body1">{formatDate(proposalData.created_at)}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Valid Until
                </Typography>
                <Typography variant="body1">{formatDate(proposalData.valid_until)}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Project Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Name
                </Typography>
                <Typography variant="body1">{proposalData.project_name}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Start
                </Typography>
                <Typography variant="body1">{formatDate(proposalData.project_start)}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project End
                </Typography>
                <Typography variant="body1">{formatDate(proposalData.project_end)}</Typography>
              </Grid>

              {proposalData.has_downpayment && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Downpayment Amount
                  </Typography>
                  <Typography variant="body1">
                    ₱{parseFloat(proposalData.downpayment_amount || 0).toFixed(2)}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1">{proposalData.notes || 'No notes provided'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Services */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Services
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {services.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Discount (%)</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((service, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>{service.service_name}</TableCell>
                          <TableCell align="right">{service.quantity}</TableCell>
                          <TableCell align="right">
                            ₱{parseFloat(service.unit_price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">{service.discount_percentage || 0}%</TableCell>
                          <TableCell align="right">
                            ₱{parseFloat(service.price || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        {/* Job Orders */}
                        {Array.isArray(service.jobOrders) && service.jobOrders.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ py: 0 }}>
                              <Box sx={{ pl: 4 }}>
                                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                                  Job Orders:
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Description</TableCell>
                                      <TableCell align="right">Estimated Fee</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {service.jobOrders.map((jobOrder, joIndex) => (
                                      <TableRow key={joIndex}>
                                        <TableCell>{jobOrder.description}</TableCell>
                                        <TableCell align="right">
                                          ₱{parseFloat(jobOrder.estimated_fee || 0).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                        Total:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ₱{calculateTotal().toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1">No services added to this proposal</Typography>
            )}
          </Paper>

          {/* Proposal Document Preview */}
          {documentBase64 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Document Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ width: '100%', height: '600px', overflow: 'hidden' }}>
                <iframe
                  src={`data:application/pdf;base64,${documentBase64}`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="Proposal Document"
                />
              </Box>
            </Paper>
          )}
        </>
      )}

      {/* Notifications */}
      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(success)} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ProposalView;
