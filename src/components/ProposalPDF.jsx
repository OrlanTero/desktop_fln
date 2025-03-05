import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font 
} from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 15,
    marginBottom: 15,
    textAlign: 'center',
  },
  infoTable: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: 100,
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1976d2',
    borderBottomStyle: 'solid',
    backgroundColor: '#f5f5f5',
    paddingTop: 5,
    paddingBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
    paddingTop: 5,
    paddingBottom: 5,
  },
  tableCol1: {
    width: '40%',
    fontSize: 9,
    paddingLeft: 5,
  },
  tableCol2: {
    width: '10%',
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 5,
  },
  tableCol3: {
    width: '15%',
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 5,
  },
  tableCol4: {
    width: '15%',
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 5,
  },
  tableCol5: {
    width: '20%',
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 5,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 10,
    width: 80,
    textAlign: 'right',
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notes: {
    marginTop: 30,
    fontSize: 10,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 10,
  },
  signature: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
    width: 200,
    paddingTop: 5,
  },
  signatureText: {
    fontSize: 10,
  }
});

// Create PDF Document component
const ProposalPDF = ({ companyInfo, proposalData, clientName, services }) => {
  // Calculate totals
  const calculateSubtotal = () => {
    return services.reduce((sum, service) => sum + service.price, 0);
  };

  const formatCurrency = (value) => {
    return `₱${parseFloat(value).toFixed(2)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{companyInfo.company_name}</Text>
          <Text style={styles.companyDetails}>{companyInfo.address}</Text>
          <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
          <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>PROPOSAL</Text>

        {/* Info Table */}
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reference No:</Text>
            <Text style={styles.infoValue}>{proposalData.proposal_reference}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valid Until:</Text>
            <Text style={styles.infoValue}>
              {proposalData.valid_until ? new Date(proposalData.valid_until).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client:</Text>
            <Text style={styles.infoValue}>{clientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Project:</Text>
            <Text style={styles.infoValue}>{proposalData.project_name}</Text>
          </View>
        </View>

        {/* Services Table */}
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol1, styles.tableHeaderText]}>Service</Text>
            <Text style={[styles.tableCol2, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.tableCol3, styles.tableHeaderText]}>Unit Price</Text>
            <Text style={[styles.tableCol4, styles.tableHeaderText]}>Discount</Text>
            <Text style={[styles.tableCol5, styles.tableHeaderText]}>Total</Text>
          </View>

          {/* Table Rows */}
          {services.map((service, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCol1}>{service.service_name}</Text>
              <Text style={styles.tableCol2}>{service.quantity}</Text>
              <Text style={styles.tableCol3}>{formatCurrency(service.unit_price)}</Text>
              <Text style={styles.tableCol4}>{service.discount_percentage}%</Text>
              <Text style={styles.tableCol5}>{formatCurrency(service.price)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(calculateSubtotal())}</Text>
          </View>
          
          {proposalData.has_downpayment && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Required Downpayment:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(proposalData.downpayment_amount)}
              </Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>Total Amount:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatCurrency(calculateSubtotal())}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {proposalData.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{proposalData.notes}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureText}>Authorized Signature</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProposalPDF; 