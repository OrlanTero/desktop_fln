import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font,
  Image 
} from '@react-pdf/renderer';
import logoPath from '../../assets/images/logo.jpg';

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
    padding: 40,
    fontFamily: 'Roboto',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 10,
    color: '#666',
  },
  contactInfo: {
    alignItems: 'flex-end',
  },
  contactText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 30,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  proposalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  reference: {
    fontSize: 14,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  clientSection: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailLabel: {
    width: '40%',
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    width: '60%',
    fontSize: 10,
    marginBottom: 4,
  },
  servicesSection: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderService: {
    flex: 3,
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableHeaderPrice: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  serviceInfo: {
    flex: 3,
  },
  serviceName: {
    fontSize: 11,
    fontWeight: 'medium',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 10,
    color: '#666',
  },
  servicePrice: {
    flex: 1,
    fontSize: 11,
    textAlign: 'right',
  },
  totalsSection: {
    borderTopWidth: 2,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
    padding: 10,
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  totalLabel: {
    flex: 3,
    fontSize: 11,
    textAlign: 'right',
    paddingRight: 16,
  },
  totalValue: {
    flex: 1,
    fontSize: 11,
    textAlign: 'right',
  },
  totalBold: {
    fontWeight: 'bold',
  },
  notes: {
    marginTop: 30,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  terms: {
    marginTop: 30,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 10,
    lineHeight: 1.4,
  }
});

const ProposalPDF = ({ companyInfo, proposalData, clientName, services }) => {
  const calculateTotals = () => {
    const subtotal = services.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
    const vat = subtotal * 0.12; // 12% VAT
    const total = subtotal + vat;
    
    return {
      subtotal: subtotal.toFixed(2),
      vat: vat.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const { subtotal, vat, total } = calculateTotals();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            <Image src={logoPath} style={styles.logo} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{companyInfo.name}</Text>
              {companyInfo.tagline && (
                <Text style={styles.companyTagline}>{companyInfo.tagline}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.contactInfo}>
            {companyInfo.address && (
              <Text style={styles.contactText}>{companyInfo.address}</Text>
            )}
            {companyInfo.phone && (
              <Text style={styles.contactText}>{companyInfo.phone}</Text>
            )}
            {companyInfo.email && (
              <Text style={styles.contactText}>{companyInfo.email}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.proposalTitle}>PROPOSAL</Text>
          <Text style={styles.reference}>{proposalData.proposal_reference}</Text>
        </View>

        {/* Client and Proposal Info */}
        <View style={styles.infoSection}>
          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            <Text style={styles.detailValue}>{clientName}</Text>
            {proposalData.client_address && (
              <Text style={styles.detailValue}>{proposalData.client_address}</Text>
            )}
            {proposalData.client_email && (
              <Text style={styles.detailValue}>{proposalData.client_email}</Text>
            )}
          </View>

          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>PROPOSAL DETAILS</Text>
            <View style={styles.detailsGrid}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {proposalData.proposal_date || new Date().toLocaleDateString()}
              </Text>

              {proposalData.valid_until && (
                <>
                  <Text style={styles.detailLabel}>Valid Until:</Text>
                  <Text style={styles.detailValue}>{proposalData.valid_until}</Text>
                </>
              )}

              {proposalData.status && (
                <>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>{proposalData.status}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Introduction/Notes */}
        {proposalData.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>INTRODUCTION</Text>
            <Text style={styles.notesText}>{proposalData.notes}</Text>
          </View>
        )}

        {/* Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>SERVICES</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderService}>Service</Text>
            <Text style={styles.tableHeaderPrice}>Price</Text>
          </View>

          {/* Table Rows */}
          {services.map((service, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.service_name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
              <Text style={styles.servicePrice}>
                ${parseFloat(service.price || 0).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>${subtotal}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT (12%):</Text>
              <Text style={styles.totalValue}>${vat}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, styles.totalBold]}>Total:</Text>
              <Text style={[styles.totalValue, styles.totalBold]}>${total}</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        {proposalData.terms && (
          <View style={styles.terms}>
            <Text style={styles.termsTitle}>TERMS AND CONDITIONS</Text>
            <Text style={styles.termsText}>{proposalData.terms}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ProposalPDF; 