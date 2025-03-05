import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProposalEmailSender = ({ proposalData, clientEmail, onClose, onSent }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailData, setEmailData] = useState({
    to: clientEmail || '',
    subject: `Proposal - ${proposalData?.proposal_reference || 'New Proposal'}`,
    message: `Dear ${proposalData?.attn_to || 'Valued Client'},\n\nPlease find attached our proposal for your review.\n\nBest regards,\n${proposalData?.prepared_by || 'FLN Services'}`
  });

  const handleChange = (field) => (event) => {
    setEmailData(prev => ({
      ...prev,
      [field]: event.target?.value || event // ReactQuill passes the value directly
    }));
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the existing PDF file
      const response = await window.api.document.getByProposal(proposalData.id);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch PDF');
      }

      // Send email with the PDF
      const result = await window.api.sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.message,
        attachments: [
          {
            filename: `${proposalData?.proposal_reference || 'proposal'}.pdf`,
            content: response.data.base64,
            encoding: 'base64'
          }
        ]
      });

      if (result.success) {
        onSent?.();
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Send Proposal</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <TextField
            fullWidth
            label="To"
            value={emailData.to}
            onChange={handleChange('to')}
            margin="normal"
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Subject"
            value={emailData.subject}
            onChange={handleChange('subject')}
            margin="normal"
            disabled={loading}
          />
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Message
            </Typography>
            <ReactQuill
              value={emailData.message}
              onChange={handleChange('message')}
              style={{ height: '200px', marginBottom: '50px' }}
              readOnly={loading}
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !emailData.to || !emailData.subject}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProposalEmailSender; 