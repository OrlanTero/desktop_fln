import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import logoPath from '../../assets/images/logo.jpg';

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
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 15,
  },
  summaryContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryLabel: {
    width: '50%',
    fontSize: 10,
    color: '#7f8c8d',
  },
  summaryValue: {
    width: '50%',
    fontSize: 10,
    fontWeight: 'bold',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 10,
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: 'bold',
    padding: 5,
  },
  cell: {
    fontSize: 9,
    padding: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#7f8c8d',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: '#f8f9fa',
    marginVertical: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 9,
    color: '#7f8c8d',
  },
});

// Helper function to get current date in formatted string
const formatDate = () => {
  const date = new Date();
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// Summary Generator Component
const SummarySection = ({ data, type }) => {
  // Calculate summary data based on type
  const generateSummary = () => {
    switch (type.toLowerCase()) {
      case 'project report':
        return [
          { label: 'Total Projects', value: data.length },
          { label: 'In Progress', value: data.filter(d => d.status === 'In Progress').length },
          { label: 'Completed', value: data.filter(d => d.status === 'Completed').length },
          { label: 'Not Started', value: data.filter(d => d.status === 'Not Started' || d.status === 'Planning').length },
          { label: 'Total Budget', value: `$${data.reduce((sum, d) => sum + (d.budget || 0), 0).toLocaleString()}` },
        ];
      case 'client report':
        return [
          { label: 'Total Clients', value: data.length },
          { label: 'Corporate Clients', value: data.filter(d => d.type === 'Corporate').length },
          { label: 'Retail Clients', value: data.filter(d => d.type === 'Retail').length },
          { label: 'Service Clients', value: data.filter(d => d.type === 'Service').length },
          { label: 'Marketing Clients', value: data.filter(d => d.type === 'Marketing').length },
        ];
      case 'account report':
        return [
          { label: 'Total Accounts', value: data.length },
          { label: 'Administrators', value: data.filter(d => d.role === 'Administrator').length },
          { label: 'Managers', value: data.filter(d => d.role === 'Manager').length },
          { label: 'Staff', value: data.filter(d => d.role === 'Staff').length },
          { label: 'Active Accounts', value: data.filter(d => d.status === 'Active').length },
        ];
      case 'liaison report':
        return [
          { label: 'Total Liaisons', value: data.length },
          { label: 'By Position: IT Director', value: data.filter(d => d.position === 'IT Director').length },
          { label: 'By Position: Project Manager', value: data.filter(d => d.position === 'Project Manager').length },
          { label: 'By Position: CTO', value: data.filter(d => d.position === 'CTO').length },
          { label: 'By Position: CMO', value: data.filter(d => d.position === 'CMO').length },
        ];
      case 'proposal report':
        return [
          { label: 'Total Proposals', value: data.length },
          { label: 'Approved', value: data.filter(d => d.status === 'Approved').length },
          { label: 'Pending', value: data.filter(d => d.status === 'Pending').length },
          { label: 'Rejected', value: data.filter(d => d.status === 'Rejected').length },
          { label: 'Total Value', value: `$${data.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}` },
        ];
      case 'job order report':
        return [
          { label: 'Total Job Orders', value: data.length },
          { label: 'Completed', value: data.filter(d => d.status === 'Completed').length },
          { label: 'In Progress', value: data.filter(d => d.status === 'In Progress').length },
          { label: 'Not Started', value: data.filter(d => d.status === 'Not Started').length },
          { label: 'Past Deadline', value: data.filter(d => new Date(d.deadline) < new Date() && d.status !== 'Completed').length },
        ];
      case 'task report':
        return [
          { label: 'Total Tasks', value: data.length },
          { label: 'Completed', value: data.filter(d => d.status === 'Completed').length },
          { label: 'In Progress', value: data.filter(d => d.status === 'In Progress').length },
          { label: 'Not Started', value: data.filter(d => d.status === 'Not Started').length },
          { label: 'Past Deadline', value: data.filter(d => new Date(d.deadline) < new Date() && d.status !== 'Completed').length },
        ];
      default:
        return [
          { label: 'Total Items', value: data.length },
        ];
    }
  };

  const summaryData = generateSummary();

  return (
    <View style={styles.summaryContainer}>
      {summaryData.map((item, index) => (
        <View style={styles.summaryItem} key={`summary-${index}`}>
          <Text style={styles.summaryLabel}>{item.label}:</Text>
          <Text style={styles.summaryValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

// Table Generator Component
const TableSection = ({ data, type }) => {
  // Define columns based on report type
  const getColumns = () => {
    switch (type.toLowerCase()) {
      case 'project report':
        return [
          { id: 'name', header: 'Project Name', width: '25%' },
          { id: 'client', header: 'Client', width: '20%' },
          { id: 'status', header: 'Status', width: '15%' },
          { id: 'startDate', header: 'Start Date', width: '15%' },
          { id: 'endDate', header: 'End Date', width: '15%' },
          { id: 'budget', header: 'Budget', width: '10%', formatter: (val) => `$${val.toLocaleString()}` },
        ];
      case 'client report':
        return [
          { id: 'name', header: 'Client Name', width: '25%' },
          { id: 'type', header: 'Type', width: '15%' },
          { id: 'contact', header: 'Contact', width: '20%' },
          { id: 'email', header: 'Email', width: '25%' },
          { id: 'phone', header: 'Phone', width: '15%' },
        ];
      case 'account report':
        return [
          { id: 'name', header: 'Name', width: '25%' },
          { id: 'role', header: 'Role', width: '20%' },
          { id: 'email', header: 'Email', width: '30%' },
          { id: 'lastLogin', header: 'Last Login', width: '15%' },
          { id: 'status', header: 'Status', width: '10%' },
        ];
      case 'liaison report':
        return [
          { id: 'name', header: 'Name', width: '25%' },
          { id: 'client', header: 'Client', width: '20%' },
          { id: 'position', header: 'Position', width: '20%' },
          { id: 'email', header: 'Email', width: '20%' },
          { id: 'phone', header: 'Phone', width: '15%' },
        ];
      case 'proposal report':
        return [
          { id: 'title', header: 'Title', width: '30%' },
          { id: 'client', header: 'Client', width: '20%' },
          { id: 'status', header: 'Status', width: '15%' },
          { id: 'date', header: 'Date', width: '15%' },
          { id: 'amount', header: 'Amount', width: '20%', formatter: (val) => `$${val.toLocaleString()}` },
        ];
      case 'job order report':
        return [
          { id: 'title', header: 'Title', width: '30%' },
          { id: 'project', header: 'Project', width: '25%' },
          { id: 'assignee', header: 'Assignee', width: '15%' },
          { id: 'status', header: 'Status', width: '15%' },
          { id: 'deadline', header: 'Deadline', width: '15%' },
        ];
      case 'task report':
        return [
          { id: 'title', header: 'Title', width: '30%' },
          { id: 'jobOrder', header: 'Job Order', width: '25%' },
          { id: 'assignee', header: 'Assignee', width: '15%' },
          { id: 'status', header: 'Status', width: '15%' },
          { id: 'deadline', header: 'Deadline', width: '15%' },
        ];
      default:
        return [
          { id: 'name', header: 'Name', width: '100%' },
        ];
    }
  };

  const columns = getColumns();

  return (
    <View style={styles.table}>
      {/* Table Header */}
      <View style={[styles.tableRow, styles.tableHeader]}>
        {columns.map((col, index) => (
          <View key={`header-${index}`} style={[styles.tableCell, { width: col.width }]}>
            <Text style={styles.headerCell}>{col.header}</Text>
          </View>
        ))}
      </View>

      {/* Table Body */}
      {data.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.tableRow}>
          {columns.map((col, colIndex) => (
            <View key={`cell-${rowIndex}-${colIndex}`} style={[styles.tableCell, { width: col.width }]}>
              <Text style={styles.cell}>
                {col.formatter ? col.formatter(row[col.id]) : row[col.id] || ''}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// Chart Placeholder Component
const ChartSection = ({ type }) => {
  return (
    <View style={styles.chartPlaceholder}>
      <Text style={styles.chartPlaceholderText}>
        {type} Data Visualization Chart
      </Text>
    </View>
  );
};

// Main ReportPDF Component
const ReportPDF = ({ title, data, options, dateRange, user }) => {
  // Company information
  const companyInfo = {
    name: 'FLN Services Corporation',
    tagline: 'Excellence in Corporate Services',
    address: '123 Business District, Metro City',
    phone: '+1 (555) 123-4567',
    email: 'info@flnservices.com',
    website: 'www.flnservices.com',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image style={styles.logo} src={logoPath} />
            <View style={styles.headerInfo}>
              <Text style={styles.companyName}>{companyInfo.name}</Text>
              <Text style={styles.companyTagline}>{companyInfo.tagline}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyDetails}>{companyInfo.address}</Text>
            <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
            <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
            <Text style={styles.companyDetails}>Web: {companyInfo.website}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Report Title */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Generated on {formatDate()} | Date Range: {dateRange} | Generated by: {user?.name || 'System'}
        </Text>

        {/* Charts Section (if enabled) */}
        {options.includeCharts && (
          <>
            <Text style={styles.sectionTitle}>Data Visualization</Text>
            <ChartSection type={title} />
          </>
        )}

        {/* Summary Section (if enabled) */}
        {options.includeSummary && (
          <>
            <Text style={styles.sectionTitle}>Summary</Text>
            <SummarySection data={data} type={title} />
          </>
        )}

        {/* Details Section (if enabled) */}
        {options.includeDetails && (
          <>
            <Text style={styles.sectionTitle}>Detailed Information</Text>
            <TableSection data={data} type={title} />
          </>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          This report is generated automatically by FLN Services Corporation Management System.
          The information contained herein is confidential and intended for internal use only.
        </Text>

        {/* Page Numbers */}
        <Text 
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
          fixed
        />
      </Page>
    </Document>
  );
};

export default ReportPDF; 