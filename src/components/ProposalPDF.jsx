import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import logoPath from '../../assets/images/logo.jpg';
import defaultSignaturePath from '../../assets/images/default_signature.png';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  headerInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  companyTagline: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  companyDetails: {
    fontSize: 10,
    marginBottom: 2,
    color: '#7f8c8d',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  clientInfo: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientBox: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  clientName: {
    fontSize: 11,
    marginBottom: 3,
  },
  clientAddress: {
    fontSize: 10,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  infoTable: {
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: '40%',
    fontSize: 10,
    color: '#7f8c8d',
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  jobOrderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 5,
    paddingLeft: 20,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
  },
  colNo: {
    width: '8%',
    fontSize: 9,
    paddingLeft: 5,
  },
  colParticulars: {
    width: '52%',
    fontSize: 9,
    paddingLeft: 5,
  },
  colEstimatedFees: {
    width: '20%',
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 5,
  },
  colServiceFee: {
    width: '20%',
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 5,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalsContainer: {
    backgroundColor: '#fafafa',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
  },
  totals: {
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
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 10,
    width: 100,
    textAlign: 'right',
  },
  grandTotal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  notesSection: {
    marginTop: 15,
    marginBottom: 15,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  notesContent: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  paymentInstructions: {
    marginTop: 20,
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 10,
    marginLeft: 10,
    marginBottom: 3,
  },
  termsSection: {
    marginTop: 15,
    marginBottom: 15,
  },
  signatures: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signature: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    width: 150,
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    textAlign: 'center',
  },
  signatureImage: {
    width: 150,
    height: 50,
    objectFit: 'contain',
    marginBottom: 5,
  },
  userName: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
});

const ProposalPDF = ({
  companyInfo,
  proposalData,
  clientName,
  services,
  userSignature,
  userName,
}) => {
  // Format currency to Peso sign with 2 decimal places
  const formatCurrency = value => {
    // Using "P" instead of Unicode character which may not display correctly
    return `P ${parseFloat(value || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Calculate totals separately for estimated fees and service fees
  const calculateTotals = () => {
    if (!Array.isArray(services)) {
      return {
        totalEstimatedFees: 0,
        totalServiceFees: 0,
        netServiceFee: 0,
        vatAmount: 0,
        totalVatInvoice: 0,
      };
    }

    // Calculate total estimated fees from job orders
    const totalEstimatedFees = services.reduce((sum, service) => {
      return (
        sum +
        (Array.isArray(service.jobOrders)
          ? service.jobOrders.reduce((sumJO, jo) => sumJO + parseFloat(jo.estimated_fee || 0), 0)
          : 0)
      );
    }, 0);

    // Calculate total service fees from services
    const totalServiceFees = services.reduce((sum, service) => {
      return sum + parseFloat(service.price || 0);
    }, 0);

    // Calculate VAT and total
    const netServiceFee = totalServiceFees;
    const vatAmount = netServiceFee * 0.12;
    const totalVatInvoice = netServiceFee + vatAmount;

    return {
      totalEstimatedFees,
      totalServiceFees,
      netServiceFee,
      vatAmount,
      totalVatInvoice,
    };
  };

  const totals = calculateTotals();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logoPath} style={styles.logo} />
            <View style={styles.headerInfo}>
              <Text style={styles.companyName}>
                {companyInfo?.name || 'FLN Services Corporation'}
              </Text>
              {companyInfo?.tagline && (
                <Text style={styles.companyTagline}>{companyInfo.tagline}</Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            {companyInfo?.address && (
              <Text style={styles.companyDetails}>{companyInfo.address}</Text>
            )}
            {companyInfo?.phone && <Text style={styles.companyDetails}>{companyInfo.phone}</Text>}
            {companyInfo?.email && <Text style={styles.companyDetails}>{companyInfo.email}</Text>}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Proposal Title */}
        <Text style={styles.title}>PROPOSAL</Text>
        <Text style={styles.subtitle}>{proposalData?.proposal_reference || 'Reference'}</Text>

        {/* Client and Proposal Info */}
        <View style={styles.clientInfo}>
          <View style={styles.clientBox}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            <Text style={styles.clientName}>{clientName || 'Client Name'}</Text>
            {proposalData?.client_address && (
              <Text style={styles.clientAddress}>{proposalData.client_address}</Text>
            )}
            {proposalData?.client_email && (
              <Text style={styles.clientAddress}>{proposalData.client_email}</Text>
            )}
          </View>

          <View style={styles.infoTable}>
            <Text style={styles.sectionTitle}>PROPOSAL DETAILS</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {proposalData?.proposal_date
                  ? new Date(proposalData.proposal_date).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </Text>
            </View>
            {proposalData?.valid_until && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Valid Until:</Text>
                <Text style={styles.infoValue}>
                  {new Date(proposalData.valid_until).toLocaleDateString()}
                </Text>
              </View>
            )}
            {proposalData?.attn_to && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Attention To:</Text>
                <Text style={styles.infoValue}>{proposalData.attn_to}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Introduction/Notes */}
        {proposalData?.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>INTRODUCTION</Text>
            <Text style={styles.notesContent}>{proposalData.notes}</Text>
          </View>
        )}

        {/* Services and Job Orders Table */}
        <View>
          <Text style={styles.sectionTitle}>SERVICES</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colNo, styles.tableHeaderText]}>No</Text>
            <Text style={[styles.colParticulars, styles.tableHeaderText]}>Particulars</Text>
            <Text style={[styles.colEstimatedFees, styles.tableHeaderText]}>Estimated Fees</Text>
            <Text style={[styles.colServiceFee, styles.tableHeaderText]}>Service Fee</Text>
          </View>

          {/* Table Rows */}
          {Array.isArray(services) && services.length > 0 ? (
            services.map((service, index) => (
              <React.Fragment key={index}>
                {/* Service Row */}
                <View style={styles.tableRow}>
                  <Text style={styles.colNo}>{index + 1}</Text>
                  <View style={styles.colParticulars}>
                    <Text style={{ fontSize: 10, fontWeight: 'medium', color: '#2c3e50' }}>
                      {service.service_name || 'Service'}
                    </Text>
                    {service.description && (
                      <Text style={{ fontSize: 9, color: '#7f8c8d', marginTop: 2 }}>
                        {service.description}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.colEstimatedFees}></Text>
                  <Text style={styles.colServiceFee}>{formatCurrency(service.price)}</Text>
                </View>

                {/* Job Order Rows */}
                {Array.isArray(service.jobOrders) &&
                  service.jobOrders.map((jobOrder, joIndex) => (
                    <View key={`${index}-${joIndex}`} style={styles.jobOrderRow}>
                      <Text style={styles.colNo}></Text>
                      <View style={styles.colParticulars}>
                        <Text style={{ fontSize: 9 }}>• {jobOrder.description || 'Job Order'}</Text>
                      </View>
                      <Text style={styles.colEstimatedFees}>
                        {formatCurrency(jobOrder.estimated_fee)}
                      </Text>
                      <Text style={styles.colServiceFee}></Text>
                    </View>
                  ))}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.colNo}></Text>
              <Text style={styles.colParticulars}>No services added to this proposal.</Text>
              <Text style={styles.colEstimatedFees}></Text>
              <Text style={styles.colServiceFee}></Text>
            </View>
          )}

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Estimated Fees:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.totalEstimatedFees)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Service Fees:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.totalServiceFees)}</Text>
              </View>

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: '#EEEEEE',
                  marginTop: 5,
                  marginBottom: 5,
                  width: '100%',
                }}
              ></View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>NET SERVICE FEE:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.netServiceFee)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VAT 12%:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.vatAmount)}</Text>
              </View>

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: '#EEEEEE',
                  marginTop: 5,
                  marginBottom: 5,
                  width: '100%',
                }}
              ></View>

              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, styles.grandTotal]}>TOTAL VAT INVOICE:</Text>
                <Text style={[styles.totalValue, styles.grandTotal]}>
                  {formatCurrency(totals.totalVatInvoice)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.paymentInstructions}>
          <Text style={styles.sectionTitle}>PAYMENT INSTRUCTIONS</Text>
          <Text style={styles.notesContent}>
            Upon confirmation, a downpayment of 50% of the total service fee is required. The
            remaining balance and estimated fees shall be paid upon completion of the service.
          </Text>
          <Text style={{ ...styles.notesContent, marginTop: 5, marginBottom: 3 }}>
            Please deposit your payment to:
          </Text>
          <Text style={styles.bulletPoint}>Bank: BDO</Text>
          <Text style={styles.bulletPoint}>Account Name: FLN Business Consultancy Services</Text>
          <Text style={styles.bulletPoint}>Account Number: 1234567890</Text>
        </View>

        {/* Terms and Conditions */}
        {proposalData?.terms && (
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>TERMS AND CONDITIONS</Text>
            <Text style={styles.notesContent}>{proposalData.terms}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signature}>
            {userSignature && <Image src={userSignature} style={styles.signatureImage} />}
            <View style={styles.signatureLine} />
            <Text style={styles.userName}>{userName || 'User Name'}</Text>
            <Text style={styles.signatureText}>Prepared By</Text>
          </View>
          <View style={styles.signature}>
            <Image src={defaultSignaturePath} style={styles.signatureImage} />
            <View style={styles.signatureLine} />
            <Text style={styles.userName}>Administrator</Text>
            <Text style={styles.signatureText}>Approved By</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ProposalPDF;
