import React, { useState, useEffect, useMemo } from 'react';
import apiService from '../services/apiService';
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingCart, 
  Users, 
  Package, 
  Star,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  FileText,
  Filter,
  RefreshCw,
  AlertCircle,
  Target,
  Activity,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  UserPlus,
  Repeat,
  Award,
  GanttChart,
  Calendar,
  DollarSign,
  User,
  FolderOpen,
  ClipboardList,
  FileBarChart
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import '../styles/Reports.css';

const Reports = ({ filters }) => {
  const [reportsData, setReportsData] = useState({
    customerWiseOrders: [],
    categoryWiseSales: [],
    customerWiseFeedback: [],
    dateRangeWiseSales: [],
    inventoryDetails: [],
    customerContacts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReport, setActiveReport] = useState('customer-orders'); // Default to customer-wise orders
  
  // Use only global filters - no individual filters needed

  useEffect(() => {
    // Fetch all reports when global filters change
    fetchAllReports();
  }, [filters?.dateFrom, filters?.dateTo]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use global filters directly
      const dateFrom = filters?.dateFrom;
      const dateTo = filters?.dateTo;
      
      // Fetch all report data concurrently
      const [customerOrdersRes, categorySalesRes, customerFeedbackRes, dateRangeSalesRes, inventoryRes, customerContactsRes] = await Promise.all([
        apiService.getCustomerWiseOrders({ 
          date_from: dateFrom, 
          date_to: dateTo 
        }),
        apiService.getCategoryWiseSales({ 
          date_from: dateFrom, 
          date_to: dateTo 
        }),
        apiService.getCustomerWiseFeedback({ 
          date_from: dateFrom, 
          date_to: dateTo 
        }),
        apiService.getDateRangeWiseSales({ 
          date_from: dateFrom, 
          date_to: dateTo 
        }),
        apiService.getInventoryDetails(),
        apiService.getCustomerContacts({ 
          date_from: dateFrom, 
          date_to: dateTo 
        })
      ]);

      setReportsData({
        customerWiseOrders: (customerOrdersRes && customerOrdersRes.data) || [],
        categoryWiseSales: (categorySalesRes && categorySalesRes.data) || [],
        customerWiseFeedback: (customerFeedbackRes && customerFeedbackRes.data) || [],
        dateRangeWiseSales: (dateRangeSalesRes && dateRangeSalesRes.data) || [],
        inventoryDetails: (inventoryRes && inventoryRes.data) || [],
        customerContacts: (customerContactsRes && customerContactsRes.data) || []
      });
      console.log('Customer feedback data:', customerFeedbackRes?.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleReport = async (reportType) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use global filters for all reports
      const dateFrom = filters?.dateFrom;
      const dateTo = filters?.dateTo;
      
      let reportResponse;
      
      switch (reportType) {
        case 'customer-orders':
          reportResponse = await apiService.getCustomerWiseOrders({ 
            date_from: dateFrom, 
            date_to: dateTo 
          });
          setReportsData(prev => ({
            ...prev,
            customerWiseOrders: reportResponse?.data || []
          }));
          break;
        case 'category-sales':
          reportResponse = await apiService.getCategoryWiseSales({ 
            date_from: dateFrom, 
            date_to: dateTo 
          });
          setReportsData(prev => ({
            ...prev,
            categoryWiseSales: reportResponse?.data || []
          }));
          break;
        case 'customer-feedback':
          reportResponse = await apiService.getCustomerWiseFeedback({ 
            date_from: dateFrom, 
            date_to: dateTo 
          });
          setReportsData(prev => ({
            ...prev,
            customerWiseFeedback: reportResponse?.data || []
          }));
          break;
        case 'date-range-sales':
          reportResponse = await apiService.getDateRangeWiseSales({ 
            date_from: dateFrom, 
            date_to: dateTo 
          });
          setReportsData(prev => ({
            ...prev,
            dateRangeWiseSales: reportResponse?.data || []
          }));
          break;
        case 'customer-contacts':
          reportResponse = await apiService.getCustomerContacts({ 
            date_from: dateFrom, 
            date_to: dateTo 
          });
          setReportsData(prev => ({
            ...prev,
            customerContacts: reportResponse?.data || []
          }));
          break;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching single report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, [filters?.dateFrom, filters?.dateTo]); // Initial load when global filters change

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const calculateGrandTotal = (salesData) => {
    return salesData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  };

  const exportReport = (reportType, format) => {
    let reportData;
    
    switch(reportType) {
      case 'customer-orders':
        reportData = reportsData.customerWiseOrders;
        break;
      case 'category-sales':
        reportData = reportsData.categoryWiseSales;
        break;
      case 'customer-feedback':
        reportData = reportsData.customerWiseFeedback;
        break;
      case 'date-range-sales':
        reportData = reportsData.dateRangeWiseSales;
        break;
      case 'inventory':
        reportData = reportsData.inventoryDetails;
        break;
      case 'customer-contacts':
        reportData = reportsData.customerContacts;
        break;
      default:
        reportData = [];
    }

    // Create export based on format
    switch(format) {
      case 'csv':
        exportToCSV(reportData, reportType);
        break;
      case 'excel':
        exportToExcel(reportData, reportType);
        break;
      case 'pdf':
        exportToPDF(reportData, reportType);
        break;
      default:
        exportToCSV(reportData, reportType);
    }
  };
  
  const exportToCSV = (data, reportType) => {
    const exportTime = new Date();
    const formattedTime = exportTime.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    let csvContent = '';
    let reportTitle = '';
    
    switch(reportType) {
      case 'customer-orders':
        csvContent = `"Digital Menu Card System"\n`;
        reportTitle = 'Customer Wise Order Report';
        csvContent += `"${reportTitle}"\n`;
        csvContent += `"Generated on","${formattedTime}"\n`;
        csvContent += `"Date Range","${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}"\n\n`;
        
        csvContent += '"Customer Name","Customer Email","Total Orders","Total Amount"\n';
        data.forEach(item => {
          csvContent += `"${item.customerName || 'N/A'}","${item.customerEmail || 'N/A'}","${item.totalOrders}","${item.totalAmount || 0}"\n`;
        });
        break;
        
      case 'category-sales':
        csvContent = `"Digital Menu Card System"\n`;
        reportTitle = 'Category Wise Sales Report';
        csvContent += `"${reportTitle}"\n`;
        csvContent += `"Generated on","${formattedTime}"\n`;
        csvContent += `"Date Range","${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}"\n\n`;
        
        csvContent += '"Category","Total Quantity","Total Revenue"\n';
        data.forEach(item => {
          csvContent += `"${item.category || 'N/A'}","${item.totalQuantity}","${item.totalRevenue || 0}"\n`;
        });
        break;
        
      case 'customer-feedback':
        csvContent = `"Digital Menu Card System"\n`;
        reportTitle = 'Customer Wise Feedback Report';
        csvContent += `"${reportTitle}"\n`;
        csvContent += `"Generated on","${formattedTime}"\n`;
        csvContent += `"Date Range","${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}"\n\n`;
        
        csvContent += '"Customer","Avg Rating","Food","Service","Ambience","Total Reviews"\n';
        data.forEach(item => {
          csvContent += `"${item.customer || 'N/A'}","${item.avgRating}","${item.food}","${item.service}","${item.ambience}","${item.totalReviews}"\n`;
        });
        break;
        
      case 'date-range-sales':
        csvContent = `"Digital Menu Card System"\n`;
        reportTitle = 'Date Wise Sales Report';
        csvContent += `"${reportTitle}"\n`;
        csvContent += `"Generated on","${formattedTime}"\n`;
        csvContent += `"Date Range","${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}"\n\n`;
        
        csvContent += '"Date","Total Orders","Total Revenue"\n';
        data.forEach(item => {
          csvContent += `"${item.date || 'N/A'}","${item.totalOrders}","${item.totalRevenue || 0}"\n`;
        });
        csvContent += `\n\n"GRAND TOTAL REVENUE","${formatCurrency(calculateGrandTotal(data))}"`;
        break;
        
      case 'inventory':
        csvContent = `"Digital Menu Card System"\n`;
        reportTitle = 'Inventory Details Report';
        csvContent += `"${reportTitle}"\n`;
        csvContent += `"Generated on","${formattedTime}"\n\n`;
        
        csvContent += '"Item Name","Category","Stock Quantity","Price","Status"\n';
        data.forEach(item => {
          csvContent += `"${item.name || 'N/A'}","${item.category || 'N/A'}","${item.stock_quantity}","${item.price}","${item.status || 'N/A'}"\n`;
        });
        break;
        
      case 'customer-contacts':
        csvContent = `"Digital Menu Card System"\n`;
        reportTitle = 'Customer wise contact report';
        csvContent += `"${reportTitle}"\n`;
        csvContent += `"Generated on","${formattedTime}"\n`;
        csvContent += `"Date Range","${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}"\n\n`;
        
        csvContent += '"Name","Email","Phone","Subject","Message","Date"\n';
        data.forEach(item => {
          csvContent += `"${item.name || 'N/A'}","${item.email || 'N/A'}","${item.phone || 'N/A'}","${item.subject || 'N/A'}","${item.message || 'N/A'}","${new Date(item.createdAt).toLocaleString()}"\n`;
        });
        break;
        
      default:
        reportTitle = 'Report Data';
        csvContent = `"${reportTitle}"\n`;
        csvContent += `"Generated on","${formattedTime}"\n\n`;
        data.forEach(item => {
          csvContent += JSON.stringify(item) + '\n';
        });
    }
    
    // Create and download file with proper naming
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvLink = document.createElement('a');
    const csvUrl = URL.createObjectURL(csvBlob);
    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${exportTime.toISOString().split('T')[0]}_${exportTime.getHours().toString().padStart(2, '0')}${exportTime.getMinutes().toString().padStart(2, '0')}.csv`;
    csvLink.setAttribute('href', csvUrl);
    csvLink.setAttribute('download', fileName);
    csvLink.style.visibility = 'hidden';
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
  };

  // Helper function to format currency for PDF (removing special symbols that cause encoding issues)
  const formatCurrencyForPDF = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0).replace('₹', 'Rs.'); // Replace rupee symbol with text to avoid PDF encoding issues
  };
  
  const exportToExcel = (data, reportType) => {
    const exportTime = new Date();
    const formattedTime = exportTime.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    let worksheetData = [];
    let reportTitle = '';
    
    switch(reportType) {
      case 'customer-orders':
        // Add system name
        worksheetData.push(['Digital Menu Card System']);
        reportTitle = 'Customer Wise Order Report';
        
        // Add header information
        worksheetData.push([reportTitle]);
        worksheetData.push(['Generated on', formattedTime]);
        worksheetData.push(['Date Range', `${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`]);
        worksheetData.push([]); // Empty row
        
        // Add table headers
        worksheetData.push(['Customer Name', 'Customer Email', 'Total Orders', 'Total Amount']);
        
        // Add data rows
        data.forEach(item => {
          worksheetData.push([
            item.customerName || 'N/A',
            item.customerEmail || 'N/A',
            item.totalOrders,
            item.totalAmount || 0
          ]);
        });
        break;
        
      case 'category-sales':
        // Add system name
        worksheetData.push(['Digital Menu Card System']);
        reportTitle = 'Category Wise Sales Report';
        
        // Add header information
        worksheetData.push([reportTitle]);
        worksheetData.push(['Generated on', formattedTime]);
        worksheetData.push(['Date Range', `${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`]);
        worksheetData.push([]); // Empty row
        
        // Add table headers
        worksheetData.push(['Category', 'Total Quantity', 'Total Revenue']);
        
        // Add data rows
        data.forEach(item => {
          worksheetData.push([
            item.category || 'N/A',
            item.totalQuantity,
            item.totalRevenue || 0
          ]);
        });
        break;
        
      case 'customer-feedback':
        // Add system name
        worksheetData.push(['Digital Menu Card System']);
        reportTitle = 'Customer Wise Feedback Report';
        
        // Add header information
        worksheetData.push([reportTitle]);
        worksheetData.push(['Generated on', formattedTime]);
        worksheetData.push(['Date Range', `${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`]);
        worksheetData.push([]); // Empty row
        
        // Add table headers
        worksheetData.push(['Customer', 'Avg Rating', 'Food', 'Service', 'Ambience', 'Total Reviews']);
        
        // Add data rows
        data.forEach(item => {
          worksheetData.push([
            item.customer || 'N/A',
            item.avgRating,
            item.food,
            item.service,
            item.ambience,
            item.totalReviews
          ]);
        });
        break;
        
      case 'date-range-sales':
        // Add system name
        worksheetData.push(['Digital Menu Card System']);
        reportTitle = 'Date Wise Sales Report';
        
        // Add header information
        worksheetData.push([reportTitle]);
        worksheetData.push(['Generated on', formattedTime]);
        worksheetData.push(['Date Range', `${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`]);
        worksheetData.push([]); // Empty row
        
        // Add table headers
        worksheetData.push(['Date', 'Total Orders', 'Total Revenue']);
        
        // Add data rows
        data.forEach(item => {
          worksheetData.push([
            item.date || 'N/A',
            item.totalOrders,
            item.totalRevenue || 0
          ]);
        });
        
        // Add grand total
        worksheetData.push([]); // Empty row
        worksheetData.push(['GRAND TOTAL REVENUE', '', formatCurrency(calculateGrandTotal(data))]);
        break;
        
      case 'inventory':
        // Add system name
        worksheetData.push(['Digital Menu Card System']);
        reportTitle = 'Inventory Details Report';
        
        // Add header information
        worksheetData.push([reportTitle]);
        worksheetData.push(['Generated on', formattedTime]);
        worksheetData.push([]); // Empty row
        
        // Add table headers
        worksheetData.push(['Item Name', 'Category', 'Stock Quantity', 'Price', 'Status']);
        
        // Add data rows
        data.forEach(item => {
          worksheetData.push([
            item.name || 'N/A',
            item.category || 'N/A',
            item.stock_quantity,
            item.price,
            item.status || 'N/A'
          ]);
        });
        break;
        
      case 'customer-contacts':
        // Add system name
        worksheetData.push(['Digital Menu Card System']);
        reportTitle = 'Customer wise contact report';
        
        // Add header information
        worksheetData.push([reportTitle]);
        worksheetData.push(['Generated on', formattedTime]);
        worksheetData.push(['Date Range', `${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`]);
        worksheetData.push([]); // Empty row
        
        // Add table headers
        worksheetData.push(['Name', 'Email', 'Phone', 'Subject', 'Message', 'Date']);
        
        // Add data rows
        data.forEach(item => {
          worksheetData.push([
            item.name || 'N/A',
            item.email || 'N/A',
            item.phone || 'N/A',
            item.subject || 'N/A',
            item.message || 'N/A',
            new Date(item.createdAt).toLocaleString()
          ]);
        });
        break;
        
      default:
        reportTitle = 'Report Data';
        worksheetData.push([reportTitle]);
        worksheetData.push(['Generated on', formattedTime]);
        worksheetData.push([]); // Empty row
        worksheetData.push(['No data available']);
    }
    
    // Create worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle.substring(0, 31)); // Sheet name limit
    
    // Generate Excel file and trigger download
    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${exportTime.toISOString().split('T')[0]}_${exportTime.getHours().toString().padStart(2, '0')}${exportTime.getMinutes().toString().padStart(2, '0')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  
  const exportToPDF = (data, reportType) => {
    const exportTime = new Date();
    const formattedTime = exportTime.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    const doc = new jsPDF();
    let reportTitle = '';
    
    // Set font and size
    doc.setFontSize(12);
    
    switch(reportType) {
      case 'customer-orders':
        // Add system name at the top
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Digital Menu Card System', 105, 10, null, null, 'center');
        
        reportTitle = 'CUSTOMER WISE ORDER REPORT';
        doc.setFontSize(16);
        doc.text(reportTitle, 105, 20, null, null, 'center');
        doc.setFontSize(10);
        
        doc.text(`Generated on: ${formattedTime}`, 14, 35);
        doc.text(`Date Range: ${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`, 14, 40);
        
        // Define table headers and positions
        const headers = ['Customer Name', 'Customer Email', 'Total Orders', 'Total Amount'];
        const colWidths = [45, 65, 25, 30]; // Reduced Total Amount width, increased Email width
        const startX = 14;
        let yPos = 50; // Increased from 40 to 50 to avoid overlap with date info
        
        // Draw table header with borders
        let currentX = startX;
        headers.forEach((header, index) => {
          doc.setFillColor(240, 240, 240); // Light gray background for header
          doc.rect(currentX, yPos - 6, colWidths[index], 10, 'FD'); // Fill and stroke
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'bold');
          doc.text(header, currentX + 2, yPos, { maxWidth: colWidths[index] - 4 });
          currentX += colWidths[index];
        });
        
        // Minimal space after header row
        yPos += 6;
        
        // Add data rows with borders
        data.forEach(item => {
          if (yPos > 270) { // Add new page if needed
            doc.addPage();
            yPos = 20;
            
            // Redraw headers on new page
            doc.setFontSize(10);
            let currentX = startX;
            headers.forEach((header, index) => {
              doc.setFillColor(240, 240, 240); // Light gray background for header
              doc.rect(currentX, yPos - 6, colWidths[index], 10, 'FD'); // Fill and stroke
              doc.setTextColor(0, 0, 0);
              doc.setFont(undefined, 'bold');
              doc.text(header, currentX + 2, yPos, { maxWidth: colWidths[index] - 4 });
              currentX += colWidths[index];
            });
            yPos += 4; // Balanced space after header
          }
          
          currentX = startX;
          const rowData = [
            (item.customerName || 'N/A').toString(),
            (item.customerEmail || 'N/A').toString(),
            item.totalOrders.toString(),
            formatCurrencyForPDF(item.totalAmount || 0)
          ];
          
          // Calculate row height based on text wrapping needs
          let rowHeight = 10;
          
          // Calculate the height needed for each cell based on text wrapping
          let cellHeights = [];
          rowData.forEach((cell, index) => {
            // Use splitTextToSize to determine how many lines the text will take
            let wrappedText = doc.splitTextToSize(cell, colWidths[index] - 4);
            let linesCount = wrappedText.length;
            cellHeights.push(linesCount * 6); // 6 units per line height
          });
          
          // Use the maximum height needed for the row
          rowHeight = Math.max(rowHeight, ...cellHeights);
          if (rowHeight < 10) rowHeight = 10; // Minimum row height
          
          // Reset font to normal for data rows
          doc.setFont(undefined, 'normal');
          rowData.forEach((cell, index) => {
            // Set different colors based on column index
            if (index === 0) { // Customer Name - Primary color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 1) { // Customer Email - Secondary color
              doc.setTextColor(127, 140, 141); // Gray (#7F8C8D)
            } else if (index === 2) { // Total Orders - Info color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 3) { // Total Amount - Success color
              doc.setTextColor(39, 174, 96); // Green (#27AE60)
            } else {
              doc.setTextColor(0, 0, 0); // Default black
            }
            
            doc.setFillColor(255, 255, 255); // White background for data
            doc.rect(currentX, yPos, colWidths[index], rowHeight, 'D'); // Stroke only
            
            // Wrap text to fit in the cell
            let wrappedText = doc.splitTextToSize(cell, colWidths[index] - 4);
            
            // Center the text vertically in the cell
            let lineHeight = 6;
            let textHeight = wrappedText.length * lineHeight;
            let startY = yPos + (rowHeight - textHeight) / 2 + lineHeight;
            
            // Draw each line of wrapped text
            wrappedText.forEach((line, lineIndex) => {
              doc.text(line, currentX + 2, startY + (lineIndex * lineHeight));
            });
            
            currentX += colWidths[index];
          });
          yPos += rowHeight;
        });
        break;
        
      case 'category-sales':
        // Add system name at the top
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Digital Menu Card System', 105, 10, null, null, 'center');
        
        reportTitle = 'CATEGORY WISE SALES REPORT';
        doc.setFontSize(16);
        doc.text(reportTitle, 105, 20, null, null, 'center');
        doc.setFontSize(10);
        
        doc.text(`Generated on: ${formattedTime}`, 14, 35);
        doc.text(`Date Range: ${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`, 14, 40);
        
        // Define table headers and positions
        const headersCat = ['Category', 'Total Quantity', 'Total Revenue'];
        const colWidthsCat = [60, 40, 40];
        const startXCat = 14;
        let yPosCat = 50; // Increased from 40 to 50 to avoid overlap with date info
        
        // Draw table header with borders
        let currentXCat = startXCat;
        headersCat.forEach((header, index) => {
          doc.setFillColor(240, 240, 240); // Light gray background for header
          doc.rect(currentXCat, yPosCat - 6, colWidthsCat[index], 10, 'FD'); // Fill and stroke
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'bold');
          doc.text(header, currentXCat + 2, yPosCat, { maxWidth: colWidthsCat[index] - 4 });
          currentXCat += colWidthsCat[index];
        });
        
        // Minimal space after header row
        yPosCat += 6;
        
        // Add data rows with borders
        data.forEach(item => {
          if (yPosCat > 270) { // Add new page if needed
            doc.addPage();
            yPosCat = 20;
            
            // Redraw headers on new page
            doc.setFontSize(10);
            let currentXCat = startXCat;
            headersCat.forEach((header, index) => {
              doc.setFillColor(240, 240, 240); // Light gray background for header
              doc.rect(currentXCat, yPosCat - 6, colWidthsCat[index], 10, 'FD'); // Fill and stroke
              doc.setTextColor(0, 0, 0);
              doc.setFont(undefined, 'bold');
              doc.text(header, currentXCat + 2, yPosCat, { maxWidth: colWidthsCat[index] - 4 });
              currentXCat += colWidthsCat[index];
            });
            yPosCat += 4; // Balanced space after header
          }
          
          currentXCat = startXCat;
          const rowDataCat = [
            (item.category || 'N/A').toString(),
            item.totalQuantity.toString(),
            formatCurrencyForPDF(item.totalRevenue || 0)
          ];
          
          // Calculate row height based on text wrapping needs
          let rowHeight = 10;
          
          // Calculate the height needed for each cell based on text wrapping
          let cellHeights = [];
          rowDataCat.forEach((cell, index) => {
            // Use splitTextToSize to determine how many lines the text will take
            let wrappedText = doc.splitTextToSize(cell, colWidthsCat[index] - 4);
            let linesCount = wrappedText.length;
            cellHeights.push(linesCount * 6); // 6 units per line height
          });
          
          // Use the maximum height needed for the row
          rowHeight = Math.max(rowHeight, ...cellHeights);
          if (rowHeight < 10) rowHeight = 10; // Minimum row height
          
          // Reset font to normal for data rows
          doc.setFont(undefined, 'normal');
          rowDataCat.forEach((cell, index) => {
            // Set different colors based on column index
            if (index === 0) { // Category - Primary color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 1) { // Total Quantity - Info color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 2) { // Total Revenue - Success color
              doc.setTextColor(39, 174, 96); // Green (#27AE60)
            } else {
              doc.setTextColor(0, 0, 0); // Default black
            }
            
            doc.setFillColor(255, 255, 255); // White background for data
            doc.rect(currentXCat, yPosCat, colWidthsCat[index], rowHeight, 'D'); // Stroke only
            
            // Wrap text to fit in the cell
            let wrappedText = doc.splitTextToSize(cell, colWidthsCat[index] - 4);
            
            // Center the text vertically in the cell
            let lineHeight = 6;
            let textHeight = wrappedText.length * lineHeight;
            let startY = yPosCat + (rowHeight - textHeight) / 2 + lineHeight;
            
            // Draw each line of wrapped text
            wrappedText.forEach((line, lineIndex) => {
              doc.text(line, currentXCat + 2, startY + (lineIndex * lineHeight));
            });
            
            currentXCat += colWidthsCat[index];
          });
          yPosCat += rowHeight;
        });
        break;
        
      case 'customer-feedback':
        // Add system name at the top
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Digital Menu Card System', 105, 10, null, null, 'center');
        
        reportTitle = 'CUSTOMER WISE FEEDBACK REPORT';
        doc.setFontSize(16);
        doc.text(reportTitle, 105, 20, null, null, 'center');
        doc.setFontSize(10);
        
        doc.text(`Generated on: ${formattedTime}`, 14, 35);
        doc.text(`Date Range: ${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`, 14, 40);
        
        // Define table headers and positions
        const headersFeedback = ['Customer', 'Avg Rating', 'Food', 'Service', 'Ambience', 'Total Reviews'];
        const colWidthsFeedback = [35, 20, 20, 20, 25, 25];
        const startXFeedback = 14;
        let yPosFeedback = 50; // Increased from 40 to 50 to avoid overlap with date info
        
        // Draw table header with borders - increased height for two-line text capability
        let currentXFeedback = startXFeedback;
        headersFeedback.forEach((header, index) => {
          doc.setFillColor(240, 240, 240); // Light gray background for header
          // Increase header height to accommodate two lines of text
          doc.rect(currentXFeedback, yPosFeedback - 8, colWidthsFeedback[index], 14, 'FD'); // Fill and stroke with increased height
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'bold');
          // Split text to handle potential two-line headers
          let wrappedHeaderText = doc.splitTextToSize(header, colWidthsFeedback[index] - 4);
          // Center the text vertically in the header cell
          let lineHeight = 6;
          let textHeight = wrappedHeaderText.length * lineHeight;
          let startY = yPosFeedback - 8 + (14 - textHeight) / 2 + lineHeight;
          
          // Draw each line of wrapped header text
          wrappedHeaderText.forEach((line, lineIndex) => {
            doc.text(line, currentXFeedback + 2, startY + (lineIndex * lineHeight));
          });
          
          currentXFeedback += colWidthsFeedback[index];
        });
        
        // Space after header row
        yPosFeedback += 8;
        
        // Add data rows with borders
        data.forEach(item => {
          if (yPosFeedback > 270) { // Add new page if needed
            doc.addPage();
            yPosFeedback = 20;
            
            // Redraw headers on new page
            doc.setFontSize(10);
            let currentXFeedback = startXFeedback;
            headersFeedback.forEach((header, index) => {
              doc.setFillColor(240, 240, 240); // Light gray background for header
              doc.rect(currentXFeedback, yPosFeedback - 6, colWidthsFeedback[index], 10, 'FD'); // Fill and stroke
              doc.setTextColor(0, 0, 0);
              doc.setFont(undefined, 'bold');
              doc.text(header, currentXFeedback + 2, yPosFeedback, { maxWidth: colWidthsFeedback[index] - 4 });
              currentXFeedback += colWidthsFeedback[index];
            });
            yPosFeedback += 4; // Balanced space after header
          }
          
          currentXFeedback = startXFeedback;
          const rowDataFeedback = [
            (item.customer || 'N/A').toString(),
            item.avgRating.toString(),
            item.food.toString(),
            item.service.toString(),
            item.ambience.toString(),
            item.totalReviews.toString()
          ];
          
          // Calculate row height based on text wrapping needs
          let rowHeight = 10;
          
          // Calculate the height needed for each cell based on text wrapping
          let cellHeights = [];
          rowDataFeedback.forEach((cell, index) => {
            // Use splitTextToSize to determine how many lines the text will take
            let wrappedText = doc.splitTextToSize(cell, colWidthsFeedback[index] - 4);
            let linesCount = wrappedText.length;
            cellHeights.push(linesCount * 6); // 6 units per line height
          });
          
          // Use the maximum height needed for the row
          rowHeight = Math.max(rowHeight, ...cellHeights);
          if (rowHeight < 12) rowHeight = 12; // Increased minimum row height to accommodate 2-line content
          
          // Reset font to normal for data rows
          doc.setFont(undefined, 'normal');
          rowDataFeedback.forEach((cell, index) => {
            // Set different colors based on column index
            if (index === 0) { // Customer - Primary color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index >= 1 && index <= 5) { // Rating columns - Info color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else {
              doc.setTextColor(0, 0, 0); // Default black
            }
            
            doc.setFillColor(255, 255, 255); // White background for data
            doc.rect(currentXFeedback, yPosFeedback, colWidthsFeedback[index], rowHeight, 'D'); // Stroke only
            
            // Wrap text to fit in the cell
            let wrappedText = doc.splitTextToSize(cell, colWidthsFeedback[index] - 4);
            
            // Center the text vertically in the cell
            let lineHeight = 6;
            let textHeight = wrappedText.length * lineHeight;
            let startY = yPosFeedback + (rowHeight - textHeight) / 2 + lineHeight;
            
            // Draw each line of wrapped text
            wrappedText.forEach((line, lineIndex) => {
              doc.text(line, currentXFeedback + 2, startY + (lineIndex * lineHeight));
            });
            
            currentXFeedback += colWidthsFeedback[index];
          });
          yPosFeedback += rowHeight;
        });
        break;
        
      case 'date-range-sales':
        // Add system name at the top
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Digital Menu Card System', 105, 10, null, null, 'center');
        
        reportTitle = 'DATE WISE SALES REPORT';
        doc.setFontSize(16);
        doc.text(reportTitle, 105, 20, null, null, 'center');
        doc.setFontSize(10);
        
        doc.text(`Generated on: ${formattedTime}`, 14, 35);
        doc.text(`Date Range: ${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`, 14, 40);
        
        // Define table headers and positions
        const headersSales = ['Date', 'Total Orders', 'Total Revenue'];
        const colWidthsSales = [45, 40, 55];
        const startYSales = 14;
        let yPosSales = 50; // Increased from 40 to 50 to avoid overlap with date info
        
        // Draw table header with borders
        let currentXSales = startYSales;
        headersSales.forEach((header, index) => {
          doc.setFillColor(240, 240, 240); // Light gray background for header
          doc.rect(currentXSales, yPosSales - 6, colWidthsSales[index], 10, 'FD'); // Fill and stroke
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'bold');
          doc.text(header, currentXSales + 2, yPosSales, { maxWidth: colWidthsSales[index] - 4 });
          currentXSales += colWidthsSales[index];
        });
        
        // Minimal space after header row
        yPosSales += 6;
        
        // Add data rows with borders
        data.forEach(item => {
          if (yPosSales > 270) { // Add new page if needed
            doc.addPage();
            yPosSales = 20;
            
            // Redraw headers on new page
            doc.setFontSize(10);
            let currentXSales = startYSales;
            headersSales.forEach((header, index) => {
              doc.setFillColor(240, 240, 240); // Light gray background for header
              doc.rect(currentXSales, yPosSales - 6, colWidthsSales[index], 10, 'FD'); // Fill and stroke
              doc.setTextColor(0, 0, 0);
              doc.setFont(undefined, 'bold');
              doc.text(header, currentXSales + 2, yPosSales, { maxWidth: colWidthsSales[index] - 4 });
              currentXSales += colWidthsSales[index];
            });
            yPosSales += 4; // Balanced space after header
          }
          
          currentXSales = startYSales;
          const rowDataSales = [
            (item.date || 'N/A').toString(),
            item.totalOrders.toString(),
            formatCurrencyForPDF(item.totalRevenue || 0)
          ];
          
          // Calculate row height based on text wrapping needs
          let rowHeight = 10;
          
          // Calculate the height needed for each cell based on text wrapping
          let cellHeights = [];
          rowDataSales.forEach((cell, index) => {
            // Use splitTextToSize to determine how many lines the text will take
            let wrappedText = doc.splitTextToSize(cell, colWidthsSales[index] - 4);
            let linesCount = wrappedText.length;
            cellHeights.push(linesCount * 6); // 6 units per line height
          });
          
          // Use the maximum height needed for the row
          rowHeight = Math.max(rowHeight, ...cellHeights);
          if (rowHeight < 10) rowHeight = 10; // Minimum row height
          
          // Reset font to normal for data rows
          doc.setFont(undefined, 'normal');
          rowDataSales.forEach((cell, index) => {
            // Set different colors based on column index
            if (index === 0) { // Date - Primary color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 1) { // Total Orders - Info color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 2) { // Total Revenue - Success color
              doc.setTextColor(39, 174, 96); // Green (#27AE60)
            } else {
              doc.setTextColor(0, 0, 0); // Default black
            }
            
            doc.setFillColor(255, 255, 255); // White background for data
            doc.rect(currentXSales, yPosSales, colWidthsSales[index], rowHeight, 'D'); // Stroke only
            
            // Wrap text to fit in the cell
            let wrappedText = doc.splitTextToSize(cell, colWidthsSales[index] - 4);
            
            // Center the text vertically in the cell
            let lineHeight = 6;
            let textHeight = wrappedText.length * lineHeight;
            let startY = yPosSales + (rowHeight - textHeight) / 2 + lineHeight;
            
            // Draw each line of wrapped text
            wrappedText.forEach((line, lineIndex) => {
              doc.text(line, currentXSales + 2, startY + (lineIndex * lineHeight));
            });
            
            currentXSales += colWidthsSales[index];
          });
          yPosSales += rowHeight;
        });
        
        // Add grand total
        yPosSales += 10;
        doc.text(`GRAND TOTAL REVENUE: ${formatCurrencyForPDF(calculateGrandTotal(data))}`, 14, yPosSales);
        break;
        
      case 'inventory':
        // Add system name at the top
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Digital Menu Card System', 105, 10, null, null, 'center');
        
        reportTitle = 'INVENTORY DETAILS REPORT';
        doc.setFontSize(16);
        doc.text(reportTitle, 105, 20, null, null, 'center');
        doc.setFontSize(10);
        
        doc.text(`Generated on: ${formattedTime}`, 14, 35);
        
        // Define table headers and positions
        const headersInv = ['Item Name', 'Category', 'Stock Qty', 'Price', 'Status'];
        const colWidthsInv = [40, 40, 25, 35, 30];
        const startXInv = 14;
        let yPosInv = 50; // Increased from 40 to 50 to avoid overlap with date info
        
        // Draw table header with borders
        let currentXInv = startXInv;
        headersInv.forEach((header, index) => {
          doc.setFillColor(240, 240, 240); // Light gray background for header
          doc.rect(currentXInv, yPosInv - 6, colWidthsInv[index], 10, 'FD'); // Fill and stroke
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'bold');
          doc.text(header, currentXInv + 2, yPosInv, { maxWidth: colWidthsInv[index] - 4 });
          currentXInv += colWidthsInv[index];
        });
        
        // Minimal space after header row
        yPosInv += 6;
        
        // Add data rows with borders
        data.forEach(item => {
          if (yPosInv > 270) { // Add new page if needed
            doc.addPage();
            yPosInv = 20;
            
            // Redraw headers on new page
            doc.setFontSize(10);
            let currentXInv = startXInv;
            headersInv.forEach((header, index) => {
              doc.setFillColor(240, 240, 240); // Light gray background for header
              doc.rect(currentXInv, yPosInv - 6, colWidthsInv[index], 10, 'FD'); // Fill and stroke
              doc.setTextColor(0, 0, 0);
              doc.setFont(undefined, 'bold');
              doc.text(header, currentXInv + 2, yPosInv, { maxWidth: colWidthsInv[index] - 4 });
              currentXInv += colWidthsInv[index];
            });
            yPosInv += 4; // Balanced space after header
          }
          
          currentXInv = startXInv;
          const rowDataInv = [
            (item.name || 'N/A').toString(),
            (item.category || 'N/A').toString(),
            item.stock_quantity.toString(),
            formatCurrencyForPDF(item.price),
            (item.status || 'N/A').toString()
          ];
          
          // Calculate row height based on text wrapping needs
          let rowHeight = 10;
          
          // Calculate the height needed for each cell based on text wrapping
          let cellHeights = [];
          rowDataInv.forEach((cell, index) => {
            // Use splitTextToSize to determine how many lines the text will take
            let wrappedText = doc.splitTextToSize(cell, colWidthsInv[index] - 4);
            let linesCount = wrappedText.length;
            cellHeights.push(linesCount * 6); // 6 units per line height
          });
          
          // Use the maximum height needed for the row
          rowHeight = Math.max(rowHeight, ...cellHeights);
          if (rowHeight < 10) rowHeight = 10; // Minimum row height
          
          // Reset font to normal for data rows
          doc.setFont(undefined, 'normal');
          rowDataInv.forEach((cell, index) => {
            // Set different colors based on column index
            if (index === 0) { // Item Name - Primary color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 1) { // Category - Primary color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 2) { // Stock Quantity - Info color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 3) { // Price - Success color
              doc.setTextColor(39, 174, 96); // Green (#27AE60)
            } else if (index === 4) { // Status - Warning color
              doc.setTextColor(243, 156, 18); // Orange (#F39C12)
            } else {
              doc.setTextColor(0, 0, 0); // Default black
            }
            
            doc.setFillColor(255, 255, 255); // White background for data
            doc.rect(currentXInv, yPosInv, colWidthsInv[index], rowHeight, 'D'); // Stroke only
            
            // Wrap text to fit in the cell
            let wrappedText = doc.splitTextToSize(cell, colWidthsInv[index] - 4);
            
            // Center the text vertically in the cell
            let lineHeight = 6;
            let textHeight = wrappedText.length * lineHeight;
            let startY = yPosInv + (rowHeight - textHeight) / 2 + lineHeight;
            
            // Draw each line of wrapped text
            wrappedText.forEach((line, lineIndex) => {
              doc.text(line, currentXInv + 2, startY + (lineIndex * lineHeight));
            });
            
            currentXInv += colWidthsInv[index];
          });
          yPosInv += rowHeight;
        });
        break;
        
      case 'customer-contacts':
        // Add system name at the top
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Digital Menu Card System', 105, 10, null, null, 'center');
        
        reportTitle = 'CUSTOMER WISE CONTACT REPORT';
        doc.setFontSize(16);
        doc.text(reportTitle, 105, 20, null, null, 'center');
        doc.setFontSize(10);
        
        doc.text(`Generated on: ${formattedTime}`, 14, 35);
        doc.text(`Date Range: ${filters?.dateFrom || 'All Time'} to ${filters?.dateTo || 'All Time'}`, 14, 40);
        
        // Define table headers and positions - adjusted column widths
        const headersContact = ['Name', 'Email', 'Phone', 'Subject', 'Date'];
        const colWidthsContact = [40, 60, 30, 30, 30]; // Increased Email column significantly, adjusted others for balance
        const startXContact = 14;
        let yPosContact = 50; // Increased from 40 to 50 to avoid overlap with date info
        
        // Draw table header with borders
        let currentXContact = startXContact;
        headersContact.forEach((header, index) => {
          doc.setFillColor(240, 240, 240); // Light gray background for header
          doc.rect(currentXContact, yPosContact - 6, colWidthsContact[index], 10, 'FD'); // Fill and stroke
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'bold');
          doc.text(header, currentXContact + 2, yPosContact, { maxWidth: colWidthsContact[index] - 4 });
          currentXContact += colWidthsContact[index];
        });
        
        // Minimal space after header row
        yPosContact += 6;
        
        // Add data rows with borders
        data.forEach(item => {
          if (yPosContact > 270) { // Add new page if needed
            doc.addPage();
            yPosContact = 20;
            
            // Redraw headers on new page
            doc.setFontSize(10);
            let currentXContact = startXContact;
            headersContact.forEach((header, index) => {
              doc.setFillColor(240, 240, 240); // Light gray background for header
              doc.rect(currentXContact, yPosContact - 6, colWidthsContact[index], 10, 'FD'); // Fill and stroke
              doc.setTextColor(0, 0, 0);
              doc.setFont(undefined, 'bold');
              doc.text(header, currentXContact + 2, yPosContact, { maxWidth: colWidthsContact[index] - 4 });
              currentXContact += colWidthsContact[index];
            });
            yPosContact += 4; // Balanced space after header
          }
          
          currentXContact = startXContact;
          const rowDataContact = [
            (item.name || 'N/A').toString(),
            (item.email || 'N/A').toString(),
            (item.phone || 'N/A').toString(),
            (item.subject || 'N/A').toString(),
            new Date(item.createdAt).toLocaleDateString()
          ];
          
          // Calculate row height based on text wrapping needs
          let rowHeight = 10;
          
          // Calculate the height needed for each cell based on text wrapping
          let cellHeights = [];
          rowDataContact.forEach((cell, index) => {
            // Use splitTextToSize to determine how many lines the text will take
            let wrappedText = doc.splitTextToSize(cell, colWidthsContact[index] - 4);
            let linesCount = wrappedText.length;
            cellHeights.push(linesCount * 6); // 6 units per line height
          });
          
          // Use the maximum height needed for the row
          rowHeight = Math.max(rowHeight, ...cellHeights);
          if (rowHeight < 12) rowHeight = 12; // Increased minimum row height to accommodate 2-line content
          
          // Reset font to normal for data rows
          doc.setFont(undefined, 'normal');
          rowDataContact.forEach((cell, index) => {
            // Set different colors based on column index
            if (index === 0) { // Name - Primary color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 1) { // Email - Secondary color
              doc.setTextColor(127, 140, 141); // Gray (#7F8C8D)
            } else if (index === 2) { // Phone - Info color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 3) { // Subject - Primary color
              doc.setTextColor(52, 152, 219); // Blue (#3498DB)
            } else if (index === 4) { // Date - Success color
              doc.setTextColor(39, 174, 96); // Green (#27AE60)
            } else {
              doc.setTextColor(0, 0, 0); // Default black
            }
            
            doc.setFillColor(255, 255, 255); // White background for data
            doc.rect(currentXContact, yPosContact, colWidthsContact[index], rowHeight, 'D'); // Stroke only
            
            // Wrap text to fit in the cell
            let wrappedText = doc.splitTextToSize(cell, colWidthsContact[index] - 4);
            
            // Center the text vertically in the cell
            let lineHeight = 6;
            let textHeight = wrappedText.length * lineHeight;
            let startY = yPosContact + (rowHeight - textHeight) / 2 + lineHeight;
            
            // Draw each line of wrapped text
            wrappedText.forEach((line, lineIndex) => {
              doc.text(line, currentXContact + 2, startY + (lineIndex * lineHeight));
            });
            
            currentXContact += colWidthsContact[index];
          });
          yPosContact += rowHeight;
        });
        break;
        
      default:
        reportTitle = 'REPORT DATA';
        doc.setFontSize(16);
        doc.text(reportTitle, 105, 15, null, null, 'center');
        doc.setFontSize(12);
        doc.text(`Generated on: ${formattedTime}`, 14, 25);
        doc.text('No data available', 14, 40);
    }
    
    // Save the PDF
    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${exportTime.toISOString().split('T')[0]}_${exportTime.getHours().toString().padStart(2, '0')}${exportTime.getMinutes().toString().padStart(2, '0')}.pdf`;
    doc.save(fileName);
  };

  if (error) {
    return (
      <div className="reports-error">
        <AlertCircle size={48} className="error-icon" />
        <h3>Error Loading Reports</h3>
        <p>{error}</p>
        <button onClick={fetchReportsData} className="retry-button">
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports">
      {/* Report Navigation */}
      <div className="reports-navigation">
        <button 
          className={`nav-btn ${activeReport === 'customer-orders' ? 'active' : ''}`}
          onClick={() => setActiveReport('customer-orders')}
        >
          <User size={16} />
          Customer Orders
        </button>
        <button 
          className={`nav-btn ${activeReport === 'category-sales' ? 'active' : ''}`}
          onClick={() => setActiveReport('category-sales')}
        >
          <FolderOpen size={16} />
          Category Sales
        </button>
        <button 
          className={`nav-btn ${activeReport === 'customer-feedback' ? 'active' : ''}`}
          onClick={() => setActiveReport('customer-feedback')}
        >
          <MessageSquare size={16} />
          Customer Feedback
        </button>
        <button 
          className={`nav-btn ${activeReport === 'date-range-sales' ? 'active' : ''}`}
          onClick={() => setActiveReport('date-range-sales')}
        >
          <Calendar size={16} />
          Sales
        </button>
        <button 
          className={`nav-btn ${activeReport === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveReport('inventory')}
        >
          <Package size={16} />
          Inventory
        </button>
        <button 
          className={`nav-btn ${activeReport === 'customer-contacts' ? 'active' : ''}`}
          onClick={() => setActiveReport('customer-contacts')}
        >
          <UserPlus size={16} />
          Customer Contacts
        </button>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {/* Customer Wise Orders Report */}
        {activeReport === 'customer-orders' && (
          <div className="report-section">
            <div className="report-header">
              <div className="report-title-section">
                <div className="report-system-name">Digital Menu Card System</div>
                <h3>Customer Wise Order Details</h3>
              </div>
              <div className="report-filters-actions">
                <div className="report-actions">
                  <button className="export-btn" onClick={() => exportReport('customer-orders', 'pdf')}>
                    <FileText size={16} />
                    PDF
                  </button>
                  <button className="export-btn" onClick={() => exportReport('customer-orders', 'csv')}>
                    <Download size={16} />
                    CSV
                  </button>
                  <button className="export-btn" onClick={() => exportReport('customer-orders', 'excel')}>
                    <Download size={16} />
                    Excel
                  </button>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Customer Email</th>
                    <th>Total Orders</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.customerWiseOrders.length > 0 ? (
                    reportsData.customerWiseOrders.map((item, index) => (
                      <tr key={index}>
                        <td className="name-field">{item.customerName || 'N/A'}</td>
                        <td className="email-field">{item.customerEmail || 'N/A'}</td>
                        <td className="quantity-field">{item.totalOrders || 0}</td>
                        <td className="amount-field">{formatCurrency(item.totalAmount || 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No customer order data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Wise Sales Report */}
        {activeReport === 'category-sales' && (
          <div className="report-section">
            <div className="report-header">
              <div className="report-title-section">
                <div className="report-system-name">Digital Menu Card System</div>
                <h3>Category Wise Sales Details</h3>
              </div>
              <div className="report-filters-actions">
                <div className="report-actions">
                  <button className="export-btn" onClick={() => exportReport('category-sales', 'pdf')}>
                    <FileText size={16} />
                    PDF
                  </button>
                  <button className="export-btn" onClick={() => exportReport('category-sales', 'csv')}>
                    <Download size={16} />
                    CSV
                  </button>
                  <button className="export-btn" onClick={() => exportReport('category-sales', 'excel')}>
                    <Download size={16} />
                    Excel
                  </button>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Quantity</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.categoryWiseSales.length > 0 ? (
                    reportsData.categoryWiseSales.map((item, index) => (
                      <tr key={index}>
                        <td className="name-field">{item.category || 'N/A'}</td>
                        <td className="quantity-field">{item.totalQuantity || 0}</td>
                        <td className="amount-field">{formatCurrency(item.totalRevenue || 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No category sales data available for the selected period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Wise Feedback Report */}
        {activeReport === 'customer-feedback' && (
          <div className="report-section">
            <div className="report-header">
              <div className="report-title-section">
                <div className="report-system-name">Digital Menu Card System</div>
                <h3>Customer Wise Feedback Details</h3>
              </div>
              <div className="report-filters-actions">
                <div className="report-actions">
                  <button className="export-btn" onClick={() => exportReport('customer-feedback', 'pdf')}>
                    <FileText size={16} />
                    PDF
                  </button>
                  <button className="export-btn" onClick={() => exportReport('customer-feedback', 'csv')}>
                    <Download size={16} />
                    CSV
                  </button>
                  <button className="export-btn" onClick={() => exportReport('customer-feedback', 'excel')}>
                    <Download size={16} />
                    Excel
                  </button>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Avg Rating</th>
                    <th>Food</th>
                    <th>Service</th>
                    <th>Ambience</th>
                    <th>Total Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.customerWiseFeedback.length > 0 ? (
                    reportsData.customerWiseFeedback.map((item, index) => (
                      <tr key={index}>
                        <td className="name-field">{item.customer || 'N/A'}</td>
                        <td className="quantity-field">{item.avgRating ? item.avgRating.toFixed(1) : 0}</td>
                        <td className="quantity-field">{item.food ? item.food.toFixed(1) : 0}</td>
                        <td className="quantity-field">{item.service ? item.service.toFixed(1) : 0}</td>
                        <td className="quantity-field">{item.ambience ? item.ambience.toFixed(1) : 0}</td>
                        <td className="quantity-field">{item.totalReviews || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No customer feedback data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Date Range Wise Sales Report */}
        {activeReport === 'date-range-sales' && (
          <div className="report-section">
            <div className="report-header">
              <div className="report-title-section">
                <div className="report-system-name">Digital Menu Card System</div>
                <h3>Date Wise Sales Report</h3>
                <p className="report-subtitle">Showing date wise sales data across all dates</p>
              </div>
              <div className="report-filters-actions">
                <div className="report-actions">
                  <button className="export-btn" onClick={() => exportReport('date-range-sales', 'pdf')}>
                    <FileText size={16} />
                    PDF
                  </button>
                  <button className="export-btn" onClick={() => exportReport('date-range-sales', 'csv')}>
                    <Download size={16} />
                    CSV
                  </button>
                  <button className="export-btn" onClick={() => exportReport('date-range-sales', 'excel')}>
                    <Download size={16} />
                    Excel
                  </button>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Orders</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.dateRangeWiseSales.length > 0 ? (
                    <>
                      {reportsData.dateRangeWiseSales.map((item, index) => (
                        <tr key={index}>
                          <td className="name-field">{item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A'}</td>
                          <td className="quantity-field">{item.totalOrders || 0}</td>
                          <td className="amount-field">{formatCurrency(item.totalRevenue || 0)}</td>
                        </tr>
                      ))}
                      {/* Grand Total Row */}
                      <tr className="grand-total-row">
                        <td><strong>Grand Total</strong></td>
                        <td><strong>
                          {reportsData.dateRangeWiseSales.reduce((sum, item) => sum + (item.totalOrders || 0), 0)}
                        </strong></td>
                        <td><strong>
                          {formatCurrency(reportsData.dateRangeWiseSales.reduce((sum, item) => sum + (item.totalRevenue || 0), 0))}
                        </strong></td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan="3">No sales data available in the system</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Details Report */}
        {activeReport === 'inventory' && (
          <div className="report-section">
            <div className="report-header">
              <div className="report-title-section">
                <div className="report-system-name">Digital Menu Card System</div>
                <h3>Inventory Details</h3>
              </div>
              <div className="report-actions">
                <button className="export-btn" onClick={() => exportReport('inventory', 'pdf')}>
                  <FileText size={16} />
                  PDF
                </button>
                <button className="export-btn" onClick={() => exportReport('inventory', 'csv')}>
                  <Download size={16} />
                  CSV
                </button>
                <button className="export-btn" onClick={() => exportReport('inventory', 'excel')}>
                  <Download size={16} />
                  Excel
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Stock Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.inventoryDetails.length > 0 ? (
                    reportsData.inventoryDetails.map((item, index) => (
                      <tr key={index}>
                        <td className="name-field">{item.name || 'N/A'}</td>
                        <td className="name-field">{item.category || 'N/A'}</td>
                        <td className="quantity-field">{item.stock_quantity || 0}</td>
                        <td className="amount-field">{formatCurrency(item.price || 0)}</td>
                        <td>
                          <span className={`status-field ${item.status?.toLowerCase()}`}>
                            {item.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No inventory data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Customer Contacts Report */}
        {activeReport === 'customer-contacts' && (
          <div className="report-section">
            <div className="report-header">
              <div className="report-title-section">
                <div className="report-system-name">Digital Menu Card System</div>
                <h3>Customer wise contact report</h3>
              </div>
              <div className="report-filters-actions">
                <div className="report-actions">
                  <button className="export-btn" onClick={() => exportReport('customer-contacts', 'pdf')}>
                    <FileText size={16} />
                    PDF
                  </button>
                  <button className="export-btn" onClick={() => exportReport('customer-contacts', 'csv')}>
                    <Download size={16} />
                    CSV
                  </button>
                  <button className="export-btn" onClick={() => exportReport('customer-contacts', 'excel')}>
                    <Download size={16} />
                    Excel
                  </button>
                </div>
              </div>
            </div>
                    
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.customerContacts.length > 0 ? (
                    reportsData.customerContacts.map((item, index) => (
                      <tr key={index}>
                        <td className="name-field">{item.name || 'N/A'}</td>
                        <td className="email-field">{item.email || 'N/A'}</td>
                        <td className="quantity-field">{item.phone || 'N/A'}</td>
                        <td className="name-field">{item.subject || 'N/A'}</td>
                        <td>{item.message || 'N/A'}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No customer contacts data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;