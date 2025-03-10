import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    position: '',
    department: '',
    skills: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const response = await window.api.userProfile.getProfile(currentUser.id);
        
        if (response.success && response.data) {
          setProfileData(response.data);
          
          // Initialize form data
          setFormData({
            name: response.data.user.name || '',
            email: response.data.user.email || '',
            phone: response.data.profile?.phone || '',
            address: response.data.profile?.address || '',
            bio: response.data.profile?.bio || '',
            position: response.data.profile?.position || '',
            department: response.data.profile?.department || '',
            skills: response.data.profile?.skills || '',
          });
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        setError('Error loading profile data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [currentUser]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle photo file selection
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    if (!photoFile || !currentUser) return;
    
    setUploading(true);
    setError('');
    
    try {
      const response = await window.api.userProfile.uploadPhoto(currentUser.id, photoFile);
      
      if (response.success) {
        setSuccess('Profile photo updated successfully');
        
        // Update profile data with new photo URL
        if (profileData && profileData.user) {
          setProfileData({
            ...profileData,
            user: {
              ...profileData.user,
              photo_url: response.data?.photo_url || profileData.user.photo_url,
            },
          });
        }
        
        // Update current user in auth context
        if (updateProfile && response.data?.photo_url) {
          updateProfile(currentUser.id, { photo_url: response.data.photo_url });
        }
        
        // Reset photo file and preview
        setPhotoFile(null);
        setPhotoPreview(null);
      } else {
        setError(response.message || 'Failed to upload photo');
      }
    } catch (err) {
      setError('Error uploading photo: ' + (err.message || 'Unknown error'));
      console.error('Photo upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const profileUpdateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        position: formData.position,
        department: formData.department,
        skills: formData.skills,
      };
      
      console.log('Submitting profile update:', profileUpdateData);
      
      const response = await window.api.userProfile.updateProfile(currentUser.id, profileUpdateData);
      
      console.log('Profile update response:', response);
      
      if (response.success) {
        setSuccess('Profile updated successfully');
        
        // Update profile data
        if (profileData) {
          setProfileData({
            ...profileData,
            user: {
              ...profileData.user,
              name: formData.name,
              email: formData.email,
            },
            profile: {
              ...profileData.profile,
              phone: formData.phone,
              address: formData.address,
              bio: formData.bio,
              position: formData.position,
              department: formData.department,
              skills: formData.skills,
            },
          });
        }
        
        // Exit edit mode
        setEditMode(false);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Error updating profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form data to current profile data
    if (profileData) {
      setFormData({
        name: profileData.user.name || '',
        email: profileData.user.email || '',
        phone: profileData.profile?.phone || '',
        address: profileData.profile?.address || '',
        bio: profileData.profile?.bio || '',
        position: profileData.profile?.position || '',
        department: profileData.profile?.department || '',
        skills: profileData.profile?.skills || '',
      });
    }
    
    // Exit edit mode
    setEditMode(false);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
  };

  // Render loading state
  if (loading && !profileData) {
    return (
      <Layout title="My Profile" showBreadcrumbs={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile" showBreadcrumbs={false}>
      <PageHeader 
        title="My Profile" 
        subtitle="View and manage your profile information"
        actionButton={
          !editMode ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          )
        }
      />
      
      <Grid container spacing={3}>
        {/* Profile Photo and Basic Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, borderRadius: 2, overflow: 'visible' }}>
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              position: 'relative'
            }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={photoPreview || (profileData?.user?.photo_url ? `http://localhost:4005${profileData.user.photo_url}` : '')}
                  alt={profileData?.user?.name || 'User'}
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    mb: 2,
                    border: '4px solid white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                />
                <Tooltip title="Change profile photo">
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 0,
                      bgcolor: 'background.paper',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {photoFile && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handlePhotoUpload}
                    disabled={uploading}
                    startIcon={uploading ? <CircularProgress size={20} /> : null}
                  >
                    {uploading ? 'Uploading...' : 'Upload New Photo'}
                  </Button>
                </Box>
              )}
              
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                {profileData?.user?.name || 'User Name'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                {profileData?.user?.role || 'Role'}
              </Typography>
              
              {profileData?.profile?.position && (
                <Chip 
                  icon={<WorkIcon />} 
                  label={profileData.profile.position} 
                  sx={{ mt: 1 }} 
                  color="primary" 
                  variant="outlined" 
                />
              )}
            </Box>
            
            <Divider />
            
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {profileData?.user?.email || 'No email provided'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {profileData?.profile?.phone || 'No phone provided'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                <Typography variant="body1">
                  {profileData?.profile?.address || 'No address provided'}
                </Typography>
              </Box>
              
              {profileData?.profile?.department && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {profileData.profile.department}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <Typography variant="h6" sx={{ mb: 3 }}>Edit Profile Information</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="Separate skills with commas"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        multiline
                        rows={2}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                        placeholder="Tell us about yourself"
                      />
                    </Grid>
                  </Grid>
                </form>
              ) : (
                <>
                  <Typography variant="h6" sx={{ mb: 3 }}>About Me</Typography>
                  
                  <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                    {profileData?.profile?.bio || 'No bio provided'}
                  </Typography>
                  
                  {profileData?.profile?.skills && (
                    <>
                      <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>Skills</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {profileData.profile.skills.split(',').map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill.trim()} 
                            color="primary" 
                            variant="outlined" 
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Success and Error Messages */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Profile; 