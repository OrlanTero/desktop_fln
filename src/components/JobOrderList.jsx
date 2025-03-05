import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const JobOrderList = ({ serviceId, proposalId, serviceName, jobOrders, onUpdate }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingJobOrder, setEditingJobOrder] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    estimated_fee: ''
  });

  const handleOpenDialog = (jobOrder = null) => {
    if (jobOrder) {
      setEditingJobOrder(jobOrder);
      setFormData({
        description: jobOrder.description,
        estimated_fee: jobOrder.estimated_fee
      });
    } else {
      setEditingJobOrder(null);
      setFormData({
        description: '',
        estimated_fee: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingJobOrder(null);
    setFormData({
      description: '',
      estimated_fee: ''
    });
  };

  const handleSubmit = () => {
    const updatedJobOrders = [...jobOrders];
    
    if (editingJobOrder) {
      // Update existing job order
      const index = updatedJobOrders.findIndex(jo => jo.id === editingJobOrder.id);
      if (index !== -1) {
        updatedJobOrders[index] = {
          ...editingJobOrder,
          ...formData
        };
      }
    } else {
      // Add new job order
      const newJobOrder = {
        id: Date.now(), // Use timestamp as temporary ID
        service_id: serviceId,
        proposal_id: proposalId,
        ...formData
      };
      updatedJobOrders.push(newJobOrder);
    }
    
    onUpdate(updatedJobOrders);
    handleCloseDialog();
  };

  const handleDelete = (jobOrderId) => {
    const updatedJobOrders = jobOrders.filter(jo => jo.id !== jobOrderId);
    onUpdate(updatedJobOrders);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Job Orders - {serviceName}</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => handleOpenDialog()}
        >
          Add Job Order
        </Button>
      </Box>

      <Paper elevation={1}>
        <List>
          {jobOrders.map((jobOrder) => (
            <ListItem
              key={jobOrder.id}
              secondaryAction={
                <Box>
                  <IconButton edge="end" onClick={() => handleOpenDialog(jobOrder)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(jobOrder.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={jobOrder.description}
                secondary={`Estimated Fee: $${parseFloat(jobOrder.estimated_fee).toFixed(2)}`}
              />
            </ListItem>
          ))}
          {jobOrders.length === 0 && (
            <ListItem>
              <ListItemText primary="No job orders added yet" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingJobOrder ? 'Edit Job Order' : 'Add Job Order'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Estimated Fee"
            type="number"
            value={formData.estimated_fee}
            onChange={(e) => setFormData({ ...formData, estimated_fee: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingJobOrder ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobOrderList; 