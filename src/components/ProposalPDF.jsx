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
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
    paddingVertical: 6,
  },
  jobOrderRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingLeft: 20,
    backgroundColor: '#fafafa',
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
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingTop: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 10,
    width: 100,
    textAlign: 'right',
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bankDetails: {
    marginTop: 30,
    fontSize: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  signatures: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signature: {
    width: 200,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    marginTop: 40,
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    textAlign: 'center',
  }
});

const ProposalPDF = ({ companyInfo, proposalData, clientName, services }) => {
  // Calculate totals
  const calculateTotals = () => {
    let totalEstimatedFees = 0;
    let totalServiceFees = 0;

    services.forEach(service => {
      totalServiceFees += parseFloat(service.price || 0);
      if (service.jobOrders) {
        totalEstimatedFees += service.jobOrders.reduce((sum, job) => 
          sum + parseFloat(job.estimated_fee || 0), 0);
      }
    });

    const netServiceFee = totalServiceFees;
    const vat = netServiceFee * 0.12;
    const totalVatInvoice = netServiceFee + vat;
    const downpayment = proposalData.has_downpayment ? (netServiceFee * 0.5) : 0;
    const grandTotal = totalVatInvoice + totalEstimatedFees;

    return {
      totalEstimatedFees,
      totalServiceFees,
      netServiceFee,
      vat,
      totalVatInvoice,
      downpayment,
      grandTotal
    };
  };

  const formatCurrency = (value) => {
    return `₱${parseFloat(value).toFixed(2)}`;
  };

  const totals = calculateTotals();

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
            <Text style={styles.infoLabel}>Client:</Text>
            <Text style={styles.infoValue}>{clientName}</Text>
          </View>
        </View>

        {/* Services and Job Orders Table */}
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colNo, styles.tableHeaderText]}>No</Text>
            <Text style={[styles.colParticulars, styles.tableHeaderText]}>Particulars</Text>
            <Text style={[styles.colEstimatedFees, styles.tableHeaderText]}>Estimated Fees</Text>
            <Text style={[styles.colServiceFee, styles.tableHeaderText]}>Service Fee</Text>
          </View>

          {/* Table Rows */}
          {services.map((service, index) => (
            <React.Fragment key={index}>
              {/* Service Row */}
              <View style={styles.tableRow}>
                <Text style={styles.colNo}>{index + 1}</Text>
                <Text style={styles.colParticulars}>{service.service_name}</Text>
                <Text style={styles.colEstimatedFees}></Text>
                <Text style={styles.colServiceFee}>{formatCurrency(service.price)}</Text>
              </View>
              
              {/* Job Order Rows */}
              {service.jobOrders && service.jobOrders.map((job, jobIndex) => (
                <View key={`job-${jobIndex}`} style={styles.jobOrderRow}>
                  <Text style={styles.colNo}></Text>
                  <Text style={styles.colParticulars}>- {job.description}</Text>
                  <Text style={styles.colEstimatedFees}>{formatCurrency(job.estimated_fee)}</Text>
                  <Text style={styles.colServiceFee}></Text>
                </View>
              ))}
            </React.Fragment>
          ))}

          {/* Totals Section */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Estimated Fees:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.totalEstimatedFees)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Service Fees:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.totalServiceFees)}</Text>
            </View>
            <View style={[styles.totalRow, { marginTop: 10 }]}>
              <Text style={styles.totalLabel}>NET SERVICE FEE:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.netServiceFee)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT 12%:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.vat)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, styles.grandTotal]}>TOTAL VAT INVOICE:</Text>
              <Text style={[styles.totalValue, styles.grandTotal]}>{formatCurrency(totals.totalVatInvoice)}</Text>
            </View>
          </View>

          {/* Payment Details */}
          {proposalData.has_downpayment && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 10, marginBottom: 5 }}>Upon Confirmation please pay:</Text>
              <Text style={{ fontSize: 10, marginLeft: 20 }}>
                50% on Service Fee: {formatCurrency(totals.downpayment)}
              </Text>
              <Text style={{ fontSize: 10, marginLeft: 20 }}>
                Estimated Fees (subject for liquidation): {formatCurrency(totals.totalEstimatedFees)}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 5 }}>
                GRAND TOTAL: {formatCurrency(totals.grandTotal)}
              </Text>
            </View>
          )}

          {/* Bank Details */}
          <View style={styles.bankDetails}>
            <Text style={{ fontSize: 10, marginBottom: 5 }}>Please deposit payment to:</Text>
            <Text style={{ fontSize: 10 }}>China Bank</Text>
            <Text style={{ fontSize: 10 }}>FLN SERVICES CORPORATION</Text>
            <Text style={{ fontSize: 10 }}>10580009592</Text>
          </View>

          {/* Signatures */}
          <View style={styles.signatures}>
            <View style={styles.signature}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Prepared By</Text>
            </View>
            <View style={styles.signature}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Approved By</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ProposalPDF; 