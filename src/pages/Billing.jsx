import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  DialogActions,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import BillingDocument from '../components/BillingDocument';
import { useAuth } from '../contexts/AuthContext';

const Billing = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [userSignature, setUserSignature] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProjects(),
          fetchCompanyInfo(),
          fetchUserSignature(),
          fetchServiceCategories(),
        ]);
      } catch (err) {
        setError('Error loading billing data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await window.api.project.getAll();
      if (response.success) {
        // Filter projects that are ready for billing
        const billingProjects = response.data.filter(
          project => project.status === 'READY_FOR_BILLING'
        );
        setProjects(billingProjects);
      } else {
        setError('Failed to load projects: ' + response.message);
      }
    } catch (err) {
      setError('Error loading projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get service categories to include in services
  const fetchServiceCategories = async () => {
    try {
      const response = await window.api.serviceCategory.getAll();
      return response.success ? response.data : [];
    } catch (err) {
      console.error('Error fetching service categories:', err);
      return [];
    }
  };

  const handleViewDetails = async project => {
    setLoading(true);
    try {
      // Get the correct project ID
      const projectId = project.id || project.project_id;
      if (!projectId) {
        throw new Error('Project ID is missing');
      }

      console.log('1. Fetching details for project:', projectId);
      console.log('Project data:', project);

      // Fetch service categories
      const categories = await fetchServiceCategories();
      console.log('1.5. Service categories:', categories);

      // Fetch project services
      const servicesResponse = await window.api.proService.getByProject(projectId);
      console.log('2. Services response:', servicesResponse);

      if (servicesResponse.success) {
        // Add category names to services
        const servicesWithCategories = servicesResponse.data.map(service => {
          const category = categories.find(cat => cat.category_id === service.category_id);
          return {
            ...service,
            category_name: category ? category.category_name : 'Uncategorized',
          };
        });

        // Fetch all job orders for the project
        const jobOrdersResponse = await window.api.jobOrders.getByProject(projectId);
        console.log('3. Job orders response:', jobOrdersResponse);
        const jobOrders = jobOrdersResponse.success ? jobOrdersResponse.data : [];
        console.log('4. Job orders array:', jobOrders);

        // Fetch submissions for each job order
        const jobOrdersWithSubmissions = await Promise.all(
          jobOrders.map(async jobOrder => {
            console.log('5. Fetching submissions for job order:', jobOrder.job_order_id);
            const submissionsResponse = await window.api.jobOrders.getSubmissions(
              jobOrder.job_order_id
            );
            console.log('6. Submissions response:', submissionsResponse);
            return {
              ...jobOrder,
              submissions: submissionsResponse.success ? submissionsResponse.data : [],
            };
          })
        );

        console.log('7. Job orders with submissions:', jobOrdersWithSubmissions);

        // Group job orders by service_id
        const jobOrdersByService = jobOrdersWithSubmissions.reduce((acc, jobOrder) => {
          // Use the service_id from the job order to match with pro_service_id
          const serviceId = jobOrder.service_id;
          if (!acc[serviceId]) {
            acc[serviceId] = [];
          }
          acc[serviceId].push(jobOrder);
          return acc;
        }, {});

        console.log('8. Job orders by service:', jobOrdersByService);

        // Add job orders to each service
        const servicesWithJobOrders = servicesWithCategories.map(service => {
          // Match job orders using pro_service_id
          const serviceJobOrders = jobOrdersByService[service.pro_service_id] || [];
          console.log(
            `9. Service ${service.pro_service_id} has ${serviceJobOrders.length} job orders`
          );
          return {
            ...service,
            jobOrders: serviceJobOrders,
          };
        });

        console.log('10. Services with job orders:', servicesWithJobOrders);

        const updatedProject = {
          ...project,
          services: servicesWithJobOrders,
        };
        console.log('11. Updated project:', updatedProject);

        setSelectedProject(updatedProject);
        setDialogOpen(true);
      } else {
        setError('Failed to load project services: ' + servicesResponse.message);
      }
    } catch (err) {
      console.error('Error in handleViewDetails:', err);
      setError('Error loading project details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get submitted price from job order submissions
  const getSubmittedPrice = jobOrder => {
    // If job order has submissions, use the sum of submission expenses
    if (Array.isArray(jobOrder.submissions) && jobOrder.submissions.length > 0) {
      return jobOrder.submissions.reduce((total, submission) => {
        return total + parseFloat(submission.total_expenses || 0);
      }, 0);
    }

    // Fall back to job order price or estimated fee
    return parseFloat(jobOrder.price || jobOrder.estimated_fee || 0);
  };

  const calculateTotalExpenses = project => {
    if (!project.services) return 0;
    return project.services.reduce((total, service) => {
      const serviceTotal = parseFloat(service.price || 0);

      // Calculate job order expenses including submissions
      const jobOrderTotal = Array.isArray(service.jobOrders)
        ? service.jobOrders.reduce((sum, jo) => {
            // Use submitted prices instead of estimated fees
            return sum + getSubmittedPrice(jo);
          }, 0)
        : 0;

      return total + serviceTotal + jobOrderTotal;
    }, 0);
  };

  const formatCurrency = amount => {
    return `₱${parseFloat(amount || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const handleGeneratePDF = () => {
    setShowPDFPreview(true);
  };

  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
  };

  // Fetch company info
  const fetchCompanyInfo = async () => {
    try {
      const response = await window.api.companyInfo.get();
      if (response.success) {
        setCompanyInfo(response.data);
      }
    } catch (err) {
      console.error('Error fetching company info:', err);
    }
  };

  // Fetch user signature from profile
  const fetchUserSignature = async () => {
    if (!currentUser || !currentUser.id) return;

    try {
      const userProfileResponse = await window.api.userProfile.getProfile(currentUser.id);
      if (
        userProfileResponse.success &&
        userProfileResponse.data &&
        userProfileResponse.data.user &&
        userProfileResponse.data.user.signature_url
      ) {
        const signatureUrl = userProfileResponse.data.user.signature_url;
        // Format the URL properly for use in the PDF
        const formattedSignatureUrl = window.api.utils.formatUploadUrl(signatureUrl);
        setUserSignature(formattedSignatureUrl);
      }
    } catch (err) {
      console.error('Error fetching user signature:', err);
    }
  };

  if (loading) {
    return (
      <Layout title="Billing">
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Billing">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Projects Ready for Billing
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Paid Amount</TableCell>
                <TableCell>Remaining</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No projects ready for billing
                  </TableCell>
                </TableRow>
              ) : (
                projects.map(project => (
                  <TableRow key={project.project_id}>
                    <TableCell>{project.project_name}</TableCell>
                    <TableCell>{project.client_name}</TableCell>
                    <TableCell>{formatCurrency(project.total_amount)}</TableCell>
                    <TableCell>{formatCurrency(project.paid_amount)}</TableCell>
                    <TableCell>
                      {formatCurrency(project.total_amount - project.paid_amount)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(project)}
                        title="View Billing Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PDF Preview Dialog */}
        <Dialog open={showPDFPreview} onClose={handleClosePDFPreview} maxWidth="lg" fullWidth>
          <DialogTitle>
            Billing Statement Preview
            <IconButton
              onClick={handleClosePDFPreview}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <BillingDocument
              companyInfo={companyInfo}
              project={selectedProject}
              services={selectedProject?.services || []}
              userSignature={userSignature}
              userName={currentUser?.name}
            />
          </DialogContent>
        </Dialog>

        {/* Billing Details Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Billing Details
            <IconButton
              onClick={() => setDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedProject && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {selectedProject.project_name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Client: {selectedProject.client_name}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Job Orders & Expenses</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {selectedProject.services?.map((service, index) => (
                            <React.Fragment key={service.service_id}>
                              <ListItem>
                                <ListItemText
                                  primary={
                                    <Typography variant="subtitle1" color="primary">
                                      {service.service_name}
                                    </Typography>
                                  }
                                  secondary={
                                    <>
                                      <Typography variant="body2">
                                        Category: {service.category_name || 'Uncategorized'}
                                      </Typography>
                                      <Typography variant="body2">
                                        Service Fee: {formatCurrency(service.price)}
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                              {Array.isArray(service.jobOrders) &&
                                service.jobOrders.map((jobOrder, joIndex) => (
                                  <ListItem key={jobOrder.job_order_id} sx={{ pl: 4 }}>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body1">
                                          {jobOrder.description || 'No description'}
                                        </Typography>
                                      }
                                      secondary={
                                        <>
                                          <Typography
                                            component="div"
                                            variant="body2"
                                            display="block"
                                          >
                                            Service: {service.service_name}
                                          </Typography>
                                          <Typography
                                            component="div"
                                            variant="body2"
                                            display="block"
                                          >
                                            Category: {service.category_name || 'Uncategorized'}
                                          </Typography>
                                          <Typography
                                            component="div"
                                            variant="body2"
                                            display="block"
                                          >
                                            Estimated Fee: {formatCurrency(jobOrder.estimated_fee)}
                                          </Typography>
                                          {Array.isArray(jobOrder.submissions) &&
                                            jobOrder.submissions.length > 0 && (
                                              <Typography
                                                component="div"
                                                variant="body2"
                                                display="block"
                                              >
                                                Actual Price:{' '}
                                                {formatCurrency(getSubmittedPrice(jobOrder))}
                                              </Typography>
                                            )}
                                          <Typography
                                            component="div"
                                            variant="body2"
                                            display="block"
                                          >
                                            Status: {jobOrder.status}
                                          </Typography>
                                          {Array.isArray(jobOrder.submissions) &&
                                            jobOrder.submissions.length > 0 && (
                                              <Box sx={{ mt: 1 }}>
                                                <Typography
                                                  component="div"
                                                  variant="body2"
                                                  sx={{ fontWeight: 'bold' }}
                                                  display="block"
                                                >
                                                  Submissions:
                                                </Typography>
                                                {jobOrder.submissions.map(
                                                  (submission, subIndex) => (
                                                    <Box key={subIndex} sx={{ pl: 2, mt: 1 }}>
                                                      <Typography
                                                        component="div"
                                                        variant="body2"
                                                        display="block"
                                                      >
                                                        • {submission.liaison_name} -{' '}
                                                        {submission.status}
                                                      </Typography>
                                                      {submission.notes && (
                                                        <Typography
                                                          component="div"
                                                          variant="body2"
                                                          sx={{ pl: 2 }}
                                                          display="block"
                                                        >
                                                          Notes: {submission.notes}
                                                        </Typography>
                                                      )}
                                                      {submission.total_expenses && (
                                                        <Typography
                                                          component="div"
                                                          variant="body2"
                                                          sx={{ pl: 2 }}
                                                          display="block"
                                                        >
                                                          Total Expenses:{' '}
                                                          {formatCurrency(
                                                            submission.total_expenses
                                                          )}
                                                        </Typography>
                                                      )}
                                                      {Array.isArray(submission.expenses) &&
                                                        submission.expenses.length > 0 && (
                                                          <Box sx={{ pl: 2 }}>
                                                            <Typography
                                                              component="div"
                                                              variant="body2"
                                                              sx={{ fontWeight: 'bold' }}
                                                              display="block"
                                                            >
                                                              Expenses:
                                                            </Typography>
                                                            {submission.expenses.map(
                                                              (expense, expIndex) => (
                                                                <Typography
                                                                  key={expIndex}
                                                                  component="div"
                                                                  variant="body2"
                                                                  sx={{ pl: 2 }}
                                                                  display="block"
                                                                >
                                                                  • {expense.description}:{' '}
                                                                  {formatCurrency(expense.amount)}
                                                                </Typography>
                                                              )
                                                            )}
                                                          </Box>
                                                        )}
                                                      {Array.isArray(submission.attachments) &&
                                                        submission.attachments.length > 0 && (
                                                          <Box sx={{ pl: 2 }}>
                                                            <Typography
                                                              component="div"
                                                              variant="body2"
                                                              sx={{ fontWeight: 'bold' }}
                                                              display="block"
                                                            >
                                                              Attachments:
                                                            </Typography>
                                                            {submission.attachments.map(
                                                              (attachment, attIndex) => (
                                                                <Typography
                                                                  key={attIndex}
                                                                  component="div"
                                                                  variant="body2"
                                                                  sx={{ pl: 2 }}
                                                                  display="block"
                                                                >
                                                                  • {attachment.file_name}
                                                                </Typography>
                                                              )
                                                            )}
                                                          </Box>
                                                        )}
                                                      {submission.submitted_at && (
                                                        <Typography
                                                          component="div"
                                                          variant="body2"
                                                          sx={{ pl: 2, mt: 1, fontStyle: 'italic' }}
                                                          display="block"
                                                        >
                                                          Submitted:{' '}
                                                          {format(
                                                            new Date(submission.submitted_at),
                                                            'MMM d, yyyy'
                                                          )}
                                                        </Typography>
                                                      )}
                                                    </Box>
                                                  )
                                                )}
                                              </Box>
                                            )}
                                        </>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              {index < selectedProject.services.length - 1 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">Total Service Fees:</Typography>
                          <Typography variant="h6">
                            {formatCurrency(
                              selectedProject.services?.reduce(
                                (sum, service) => sum + parseFloat(service.price || 0),
                                0
                              )
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">Total Job Order Expenses:</Typography>
                          <Typography variant="h6">
                            {formatCurrency(
                              selectedProject.services?.reduce(
                                (sum, service) =>
                                  sum +
                                  (service.jobOrders?.reduce((joSum, jo) => {
                                    // Use submitted prices
                                    return joSum + getSubmittedPrice(jo);
                                  }, 0) || 0),
                                0
                              )
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1">Grand Total:</Typography>
                          <Typography variant="h5" color="primary">
                            {formatCurrency(calculateTotalExpenses(selectedProject))}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
            <Button variant="contained" color="primary" onClick={handleGeneratePDF}>
              Generate PDF
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Billing;
