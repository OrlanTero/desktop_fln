import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoPath from '../../assets/images/logo.jpg';

// Create styles that match the preview exactly
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    maxWidth: 300,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    wordBreak: 'break-word',
  },
  companyDetails: {
    fontSize: 10,
    marginBottom: 2,
    color: '#666',
  },
  rightAligned: {
    textAlign: 'right',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 20,
    marginTop: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    marginTop: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  twoColumnSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    width: '48%',
  },
  clientName: {
    fontSize: 11,
    marginBottom: 3,
  },
  clientDetail: {
    fontSize: 10,
    marginBottom: 2,
    color: '#666',
  },
  row: {
    marginBottom: 5,
    flexDirection: 'row',
  },
  labelColumn: {
    width: '40%',
    color: '#666',
    fontSize: 10,
  },
  valueColumn: {
    width: '60%',
    fontSize: 10,
  },
  tableContainer: {
    border: '1px solid #ddd',
    marginTop: 10,
  },
  tableHeader: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tableRow: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
  },
  tableRowLabel: {
    fontSize: 10,
    marginBottom: 2,
    flex: 1,
  },
  tableRowDetail: {
    fontSize: 9,
    marginBottom: 1,
    paddingLeft: 10,
  },
  tableRowAmount: {
    fontSize: 10,
    textAlign: 'right',
  },
  jobOrderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    flexDirection: 'row',
    padding: 8,
    paddingLeft: 18,
  },
  idColumn: {
    width: '8%',
    fontSize: 10,
  },
  descriptionColumn: {
    width: '62%',
    fontSize: 10,
  },
  amountColumn: {
    width: '30%',
    fontSize: 10,
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    width: '70%',
    textAlign: 'right',
    paddingRight: 5,
  },
  totalValue: {
    fontSize: 10,
    width: '30%',
    textAlign: 'right',
  },
  grandTotal: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginTop: 5,
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
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
    marginBottom: 3,
  },
  paymentInstructions: {
    marginTop: 5,
  },
  paymentDetail: {
    fontSize: 10,
    marginLeft: 10,
    marginTop: 1,
  },
});

const BillingPDF = ({ companyInfo, project, services, userSignature, userName }) => {
  // Safely format currency with PHP format - try a different approach
  const formatCurrency = value => {
    // Try using a plain "P" prefix since some PDF renderers may have issues with special characters
    return `P ${parseFloat(value || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Format date safely
  const formatDate = dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Get submitted price from job order submissions
  const getSubmittedPrice = jobOrder => {
    if (Array.isArray(jobOrder.submissions) && jobOrder.submissions.length > 0) {
      return jobOrder.submissions.reduce((total, submission) => {
        return total + parseFloat(submission.total_expenses || 0);
      }, 0);
    }
    return parseFloat(jobOrder.price || jobOrder.estimated_fee || 0);
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!Array.isArray(services)) {
      return {
        totalJobOrderPrices: 0,
        totalServiceFees: 0,
        subtotal: 0,
        totalDownpayments: 0,
        balanceDue: 0,
      };
    }

    const totalJobOrderPrices = services.reduce((sum, service) => {
      return (
        sum +
        (Array.isArray(service.jobOrders)
          ? service.jobOrders.reduce((sumJO, jo) => sumJO + getSubmittedPrice(jo), 0)
          : 0)
      );
    }, 0);

    const totalServiceFees = services.reduce((sum, service) => {
      return sum + parseFloat(service.price || 0);
    }, 0);

    const subtotal = totalServiceFees + totalJobOrderPrices;
    const totalDownpayments = project?.downpayment_amount
      ? parseFloat(project.downpayment_amount)
      : 0;
    const balanceDue = subtotal - totalDownpayments;

    return {
      totalJobOrderPrices,
      totalServiceFees,
      subtotal,
      totalDownpayments,
      balanceDue,
    };
  };

  const totals = calculateTotals();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo - Matching the preview */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image style={styles.logo} src={logoPath} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {companyInfo?.name || 'FLN Business Consultancy Services'}
              </Text>
            </View>
          </View>

          <View>
            <Text style={[styles.companyDetails, styles.rightAligned]}>
              {companyInfo?.address || 'Philippines'}
            </Text>
            <Text style={[styles.companyDetails, styles.rightAligned]}>
              {companyInfo?.phone || '+63 XXX XXX XXXX'}
            </Text>
            <Text style={[styles.companyDetails, styles.rightAligned]}>
              {companyInfo?.email || 'contact@flnbusiness.com'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Billing Title */}
        <Text style={styles.title}>BILLING STATEMENT</Text>
        <Text style={styles.subtitle}>{project?.project_name || 'Project Name'}</Text>

        {/* Client and Billing Info in 2 columns */}
        <View style={styles.twoColumnSection}>
          {/* Left Column - Client Info */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            <Text style={styles.clientName}>{project?.client_name || 'Client Name'}</Text>
            {project?.client_address && (
              <Text style={styles.clientDetail}>{project.client_address}</Text>
            )}
            {project?.client_email && (
              <Text style={styles.clientDetail}>{project.client_email}</Text>
            )}
          </View>

          {/* Right Column - Billing Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>BILLING DETAILS</Text>
            <View style={styles.row}>
              <Text style={styles.labelColumn}>Date:</Text>
              <Text style={styles.valueColumn}>
                {project?.billing_date ? formatDate(project.billing_date) : formatDate(new Date())}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.labelColumn}>Project ID:</Text>
              <Text style={styles.valueColumn}>{project?.project_id || 'N/A'}</Text>
            </View>
            {project?.due_date && (
              <View style={styles.row}>
                <Text style={styles.labelColumn}>Due Date:</Text>
                <Text style={styles.valueColumn}>{formatDate(project.due_date)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Services and Job Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SERVICES AND JOB ORDERS</Text>

          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.idColumn]}>No</Text>
              <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>Particulars</Text>
              <Text style={[styles.tableHeaderText, styles.amountColumn]}>Price</Text>
            </View>

            {Array.isArray(services) && services.length > 0 ? (
              services.map((service, index) => (
                <React.Fragment key={index}>
                  {/* Service Row */}
                  <View style={styles.tableRow}>
                    <Text style={styles.idColumn}>{index + 1}</Text>
                    <Text style={styles.descriptionColumn}>
                      {service.service_name || 'Uncategorized'}
                    </Text>
                    <Text style={styles.amountColumn}>{formatCurrency(service.price)}</Text>
                  </View>

                  {/* Job Orders */}
                  {Array.isArray(service.jobOrders) &&
                    service.jobOrders.map((jobOrder, joIndex) => (
                      <View key={`jo-${joIndex}`} style={styles.jobOrderRow}>
                        <Text style={styles.idColumn}></Text>
                        <Text style={styles.descriptionColumn}>
                          • {jobOrder.description || 'Job Order'}
                        </Text>
                        <Text style={styles.amountColumn}>
                          {formatCurrency(getSubmittedPrice(jobOrder))}
                        </Text>
                      </View>
                    ))}
                </React.Fragment>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text>No services added to this billing.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Job Order Expenses:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.totalJobOrderPrices)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Service Fees:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.totalServiceFees)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SUBTOTAL:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.subtotal)}</Text>
          </View>
          {totals.totalDownpayments > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Less: Downpayment:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(totals.totalDownpayments)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>BALANCE DUE:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatCurrency(totals.balanceDue)}
            </Text>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.footer}>
          <Text style={styles.sectionTitle}>PAYMENT INSTRUCTIONS</Text>
          <Text>Please settle the balance due upon receipt of this billing statement.</Text>
          <View style={styles.paymentInstructions}>
            <Text>Please deposit your payment to:</Text>
            <Text style={styles.paymentDetail}>Bank: BDO</Text>
            <Text style={styles.paymentDetail}>
              Account Name: FLN Business Consultancy Services
            </Text>
            <Text style={styles.paymentDetail}>Account Number: 1234567890</Text>
          </View>
        </View>

        {/* Updated signature section */}
        <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '45%', alignItems: 'center' }}>
            {userSignature && <Image src={userSignature} style={styles.signatureImage} />}
            <View style={styles.signatureLine} />
            <Text style={styles.userName}>{userName || 'User Name'}</Text>
            <Text style={styles.signatureText}>Prepared By</Text>
          </View>
          <View style={{ width: '45%', alignItems: 'center' }}>
            <View style={{ height: userSignature ? 58 : 0 }} />
            <View style={styles.signatureLine} />
            <Text style={styles.userName}>&nbsp;</Text>
            <Text style={styles.signatureText}>Approved By</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BillingPDF;
