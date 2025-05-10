/*
Documents Page Component

This page displays all attachments per client and per project, with the ability to create folders and upload files.

When integrating into the navigation menu, use the following properties:
- name: 'Documents'
- icon: <Description /> (from @mui/icons-material)
- path: '/documents'
- position: alongside other main navigation items like Dashboard, Projects, etc.
*/

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

// Mock data for clients with projects and documents
const mockClients = [
  {
    id: 1,
    name: 'ABC Corporation',
    projects: [
      {
        id: 101,
        name: 'Website Redesign',
        folders: [
          {
            id: 1001,
            name: 'Proposals',
            files: [
              { id: 10001, name: 'Initial Proposal.pdf', type: 'pdf', size: '2.3 MB', date: '2023-12-10', uploadedBy: 'Admin User' },
              { id: 10002, name: 'Revised Proposal.pdf', type: 'pdf', size: '2.5 MB', date: '2023-12-15', uploadedBy: 'Admin User' },
            ]
          },
          {
            id: 1002,
            name: 'Contracts',
            files: [
              { id: 10003, name: 'Service Agreement.pdf', type: 'pdf', size: '1.8 MB', date: '2023-12-20', uploadedBy: 'Admin User' },
            ]
          },
          {
            id: 1003,
            name: 'Deliverables',
            files: [
              { id: 10004, name: 'Homepage Mockup.jpg', type: 'image', size: '5.2 MB', date: '2024-01-05', uploadedBy: 'Designer' },
              { id: 10005, name: 'Logo Design.png', type: 'image', size: '1.3 MB', date: '2024-01-06', uploadedBy: 'Designer' },
              { id: 10006, name: 'Website Assets.zip', type: 'zip', size: '15.7 MB', date: '2024-01-15', uploadedBy: 'Designer' },
            ]
          },
          {
            id: 1004,
            name: 'Invoices',
            files: [
              { id: 10007, name: 'Invoice-Jan2024.pdf', type: 'pdf', size: '0.8 MB', date: '2024-01-30', uploadedBy: 'Admin User' },
            ]
          }
        ]
      },
      {
        id: 102,
        name: 'Marketing Campaign',
        folders: [
          {
            id: 1005,
            name: 'Strategy Documents',
            files: [
              { id: 10008, name: 'Marketing Strategy.docx', type: 'word', size: '1.5 MB', date: '2024-02-05', uploadedBy: 'Marketing Specialist' },
              { id: 10009, name: 'Target Audience Analysis.pdf', type: 'pdf', size: '3.2 MB', date: '2024-02-06', uploadedBy: 'Marketing Specialist' },
            ]
          },
          {
            id: 1006,
            name: 'Campaign Assets',
            files: [
              { id: 10010, name: 'Social Media Visuals.zip', type: 'zip', size: '8.5 MB', date: '2024-02-15', uploadedBy: 'Designer' },
              { id: 10011, name: 'Email Template.html', type: 'html', size: '0.3 MB', date: '2024-02-16', uploadedBy: 'Developer' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'XYZ Industries',
    projects: [
      {
        id: 201,
        name: 'Mobile App Development',
        folders: [
          {
            id: 2001,
            name: 'Requirements',
            files: [
              { id: 20001, name: 'App Requirements.pdf', type: 'pdf', size: '4.2 MB', date: '2024-01-10', uploadedBy: 'Project Manager' },
              { id: 20002, name: 'User Stories.xlsx', type: 'excel', size: '1.1 MB', date: '2024-01-11', uploadedBy: 'Project Manager' },
            ]
          },
          {
            id: 2002,
            name: 'Design',
            files: [
              { id: 20003, name: 'UI Design.fig', type: 'figma', size: '6.5 MB', date: '2024-01-25', uploadedBy: 'Designer' },
              { id: 20004, name: 'App Screens.jpg', type: 'image', size: '3.8 MB', date: '2024-01-26', uploadedBy: 'Designer' },
            ]
          },
          {
            id: 2003,
            name: 'Development',
            files: [
              { id: 20005, name: 'API Documentation.pdf', type: 'pdf', size: '2.3 MB', date: '2024-02-05', uploadedBy: 'Developer' },
              { id: 20006, name: 'Backend Code Docs.md', type: 'markdown', size: '0.5 MB', date: '2024-02-10', uploadedBy: 'Developer' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Global Solutions',
    projects: [
      {
        id: 301,
        name: 'IT Infrastructure Audit',
        folders: [
          {
            id: 3001,
            name: 'Audit Reports',
            files: [
              { id: 30001, name: 'Security Audit Report.pdf', type: 'pdf', size: '5.7 MB', date: '2024-02-20', uploadedBy: 'IT Specialist' },
              { id: 30002, name: 'Network Assessment.pdf', type: 'pdf', size: '4.3 MB', date: '2024-02-21', uploadedBy: 'IT Specialist' },
            ]
          },
          {
            id: 3002,
            name: 'Recommendations',
            files: [
              { id: 30003, name: 'Improvement Recommendations.pptx', type: 'powerpoint', size: '8.2 MB', date: '2024-03-01', uploadedBy: 'Project Manager' },
              { id: 30004, name: 'Budget Proposal.xlsx', type: 'excel', size: '1.5 MB', date: '2024-03-02', uploadedBy: 'Finance Analyst' },
            ]
          }
        ]
      }
    ]
  }
];

// Function to get file icon based on type
const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'pdf':
      return <FileIcon style={{ color: '#e74c3c' }} />;
    case 'word':
    case 'docx':
      return <FileIcon style={{ color: '#3498db' }} />;
    case 'excel':
    case 'xlsx':
      return <FileIcon style={{ color: '#2ecc71' }} />;
    case 'powerpoint':
    case 'pptx':
      return <FileIcon style={{ color: '#e67e22' }} />;
    case 'image':
    case 'jpg':
    case 'png':
      return <FileIcon style={{ color: '#9b59b6' }} />;
    case 'zip':
      return <FileIcon style={{ color: '#f1c40f' }} />;
    default:
      return <FileIcon style={{ color: '#95a5a6' }} />;
  }
};

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`documents-tabpanel-${index}`}
      aria-labelledby={`documents-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Documents = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentClient, setCurrentClient] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'All Clients', path: null }]);
  const [tabValue, setTabValue] = useState(0);
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [uploadFileDialog, setUploadFileDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to handle navigation
  const navigateTo = (type, item) => {
    if (type === 'client') {
      setCurrentClient(item);
      setCurrentProject(null);
      setCurrentFolder(null);
      setBreadcrumbs([
        { name: 'All Clients', path: null },
        { name: item.name, path: 'client' }
      ]);
    } else if (type === 'project') {
      setCurrentProject(item);
      setCurrentFolder(null);
      setBreadcrumbs([
        { name: 'All Clients', path: null },
        { name: currentClient.name, path: 'client' },
        { name: item.name, path: 'project' }
      ]);
    } else if (type === 'folder') {
      setCurrentFolder(item);
      setBreadcrumbs([
        { name: 'All Clients', path: null },
        { name: currentClient.name, path: 'client' },
        { name: currentProject.name, path: 'project' },
        { name: item.name, path: 'folder' }
      ]);
    } else if (type === 'back') {
      if (currentFolder) {
        setCurrentFolder(null);
        setBreadcrumbs(breadcrumbs.slice(0, -1));
      } else if (currentProject) {
        setCurrentProject(null);
        setBreadcrumbs(breadcrumbs.slice(0, -1));
      } else if (currentClient) {
        setCurrentClient(null);
        setBreadcrumbs([{ name: 'All Clients', path: null }]);
      }
    }
  };

  // Function to handle breadcrumb navigation
  const handleBreadcrumbClick = (path) => {
    if (path === null) {
      setCurrentClient(null);
      setCurrentProject(null);
      setCurrentFolder(null);
      setBreadcrumbs([{ name: 'All Clients', path: null }]);
    } else if (path === 'client') {
      setCurrentProject(null);
      setCurrentFolder(null);
      setBreadcrumbs(breadcrumbs.slice(0, 2));
    } else if (path === 'project') {
      setCurrentFolder(null);
      setBreadcrumbs(breadcrumbs.slice(0, 3));
    }
  };

  // Filter data based on search term
  const filterData = (data) => {
    if (!searchTerm) return data;

    const term = searchTerm.toLowerCase();
    if (Array.isArray(data)) {
      return data.filter(item => 
        item.name.toLowerCase().includes(term)
      );
    }
    return data;
  };

  // Function to handle right-click context menu
  const handleContextMenu = (event, item) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY });
    setSelectedItem(item);
  };

  // Function to handle close context menu
  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setSelectedItem(null);
  };

  // Function to open new folder dialog
  const handleOpenNewFolderDialog = () => {
    setNewFolderName('');
    setNewFolderDialog(true);
  };

  // Function to create new folder
  const handleCreateNewFolder = () => {
    if (newFolderName.trim() === '') return;
    
    // In a real app, this would send an API request to create a folder
    console.log('Creating new folder:', newFolderName);
    
    setNewFolderDialog(false);
    setNewFolderName('');
  };

  // Function to open upload file dialog
  const handleOpenUploadDialog = () => {
    setSelectedFile(null);
    setUploadFileDialog(true);
  };

  // Function to handle file selection for upload
  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Function to upload file
  const handleUploadFile = () => {
    if (!selectedFile) return;
    
    // In a real app, this would send an API request to upload the file
    console.log('Uploading file:', selectedFile.name);
    
    setUploadFileDialog(false);
    setSelectedFile(null);
  };

  return (
    <Layout title="Documents">
      <PageHeader
        title="Documents"
        subtitle="Manage and view all client and project documents"
        actionButton={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(currentClient && currentProject) && (
              <>
                <Button
                  variant="contained"
                  startIcon={<CreateNewFolderIcon />}
                  onClick={handleOpenNewFolderDialog}
                >
                  New Folder
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<UploadIcon />}
                  onClick={handleOpenUploadDialog}
                >
                  Upload File
                </Button>
              </>
            )}
          </Box>
        }
      />

      {/* Search and Breadcrumbs */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs>
          {breadcrumbs.map((breadcrumb, index) => (
            <Link
              key={index}
              color="inherit"
              sx={{ cursor: 'pointer' }}
              onClick={() => handleBreadcrumbClick(breadcrumb.path)}
            >
              {breadcrumb.name}
            </Link>
          ))}
        </Breadcrumbs>

        <TextField
          placeholder="Search files and folders..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Back Button */}
      {(currentClient || currentProject || currentFolder) && (
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigateTo('back')}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      )}

      {/* Main Content */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Clients View */}
            {!currentClient && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Clients
                </Typography>
                <Grid container spacing={2}>
                  {filterData(mockClients).map(client => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={client.id}>
                      <Paper
                        sx={{
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 3,
                          }
                        }}
                        onClick={() => navigateTo('client', client)}
                        onContextMenu={(e) => handleContextMenu(e, client)}
                      >
                        <BusinessIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {client.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {client.projects.length} {client.projects.length === 1 ? 'Project' : 'Projects'}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Projects View */}
            {currentClient && !currentProject && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Projects for {currentClient.name}
                </Typography>
                <Grid container spacing={2}>
                  {filterData(currentClient.projects).map(project => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                      <Paper
                        sx={{
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 3,
                          }
                        }}
                        onClick={() => navigateTo('project', project)}
                        onContextMenu={(e) => handleContextMenu(e, project)}
                      >
                        <AssignmentIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.folders.length} {project.folders.length === 1 ? 'Folder' : 'Folders'}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Folders and Files View */}
            {currentProject && (
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="All Files" />
                    <Tab label="Documents" />
                    <Tab label="Images" />
                    <Tab label="Other Files" />
                  </Tabs>
                </Box>
              
                <TabPanel value={tabValue} index={0}>
                  {!currentFolder ? (
                    <Grid container spacing={2}>
                      {filterData(currentProject.folders).map(folder => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
                          <Paper
                            sx={{
                              p: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 3,
                              }
                            }}
                            onClick={() => navigateTo('folder', folder)}
                            onContextMenu={(e) => handleContextMenu(e, folder)}
                          >
                            <FolderIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                              {folder.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {folder.files.length} {folder.files.length === 1 ? 'File' : 'Files'}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <List>
                      {filterData(currentFolder.files).map(file => (
                        <ListItem
                          key={file.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={(e) => handleContextMenu(e, file)}>
                              <MoreVertIcon />
                            </IconButton>
                          }
                          onContextMenu={(e) => handleContextMenu(e, file)}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            }
                          }}
                        >
                          <ListItemIcon>
                            {getFileIcon(file.type)}
                          </ListItemIcon>
                          <ListItemText 
                            primary={file.name} 
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip size="small" label={`Size: ${file.size}`} />
                                <Chip size="small" label={`Uploaded: ${file.date}`} />
                                <Chip size="small" label={`By: ${file.uploadedBy}`} />
                              </Box>
                            }
                          />
                          <IconButton>
                            <DownloadIcon />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </TabPanel>
              
                <TabPanel value={tabValue} index={1}>
                  <Typography variant="body1">Documents section content (PDF, Word, etc.)</Typography>
                </TabPanel>
              
                <TabPanel value={tabValue} index={2}>
                  <Typography variant="body1">Images section content (JPG, PNG, etc.)</Typography>
                </TabPanel>
              
                <TabPanel value={tabValue} index={3}>
                  <Typography variant="body1">Other files section content (ZIP, etc.)</Typography>
                </TabPanel>
              </>
            )}
          </>
        )}
      </Paper>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog} onClose={() => setNewFolderDialog(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateNewFolder} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={uploadFileDialog} onClose={() => setUploadFileDialog(false)}>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ height: 100, borderStyle: 'dashed' }}
            >
              {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
              <input
                type="file"
                hidden
                onChange={handleFileSelect}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadFileDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUploadFile} 
            variant="contained" 
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Documents; 