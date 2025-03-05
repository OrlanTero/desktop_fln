import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SendIcon from '@mui/icons-material/Send';

const EmailProposalForm = ({ proposalData, onEmailSent }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState(`Proposal - ${proposalData?.proposal_reference || ''}`);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (proposalData?.proposal_id) {
        try {
          const response = await window.api.document.getByProposal(proposalData.proposal_id);

          console.log(response)
          if (response.success && response.data) {
            setDocumentContent(response.data.base64);
          } else {
            throw new Error('Failed to fetch document');
          }
        } catch (err) {
          setError('Failed to load proposal document: ' + err.message);
        }
      }
    };

    fetchDocument();
  }, [proposalData]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!documentContent) {
      setError('Document content is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Gmail API configuration
      const emailData = {
        to: recipient,
        subject: subject,
        message: message,
        proposalData: proposalData,
        clientName: proposalData.client_name,
        attachments: [{
          filename: `${proposalData.proposal_reference || 'proposal'}.pdf`,
          content: documentContent,
          encoding: 'base64',
          mimeType: 'application/pdf'
        }],
        credentials: {
          email: 'flnservicescorporation1@gmail.com',
          password: 'lqsolhpcdlwopzik'
        }
      };

      // Send email
      const emailResponse = await window.api.email.send(emailData);

      if (!emailResponse.success) {
        throw new Error(emailResponse.message || 'Failed to send email');
      }

     

      // Update proposal status to Pending
      const updateResponse = await window.api.proposal.updateOnlyStatus(proposalData.proposal_id, 'Sent');

      console.log(updateResponse)

      if (!updateResponse.success) {
        throw new Error('Email sent but failed to update proposal status');
      }

      if (onEmailSent) {
        onEmailSent();
      }
     
    } catch (err) {
      setError(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Send Proposal via Email
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Recipient Email"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            fullWidth
          />

          <Box sx={{ 
            '.ql-container': {
              height: '250px',
              fontSize: '1rem',
              fontFamily: 'inherit'
            },
            '.ql-editor': {
              minHeight: '200px'
            }
          }}>
            <ReactQuill
              value={message}
              onChange={setMessage}
              modules={modules}
              formats={formats}
              placeholder="Compose your email..."
            />
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !documentContent}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Send Email
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default EmailProposalForm; 