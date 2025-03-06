import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function LoanCalculator() {
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState(10);
  const [duration, setDuration] = useState('');
  const [results, setResults] = useState([]);
  const [totalPrincipal, setTotalPrincipal] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const tableRef = useRef(null);
  const resultsRef = useRef(null);

  const calculateLoan = () => {
    if (!principal || !duration) {
      alert('Please fill all fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate calculation time for better UX
    setTimeout(() => {
      const principalValue = parseInt(principal);
      const interestRateValue = parseInt(interestRate);
      const durationValue = parseInt(duration);
      
      if (isNaN(principalValue) || isNaN(interestRateValue) || isNaN(durationValue)) {
        alert('Please enter valid numbers');
        setIsLoading(false);
        return;
      }
      
      const monthlyPrincipal = Math.floor(principalValue / durationValue); // No decimals
      let remainingPrincipal = principalValue;
      const calculationResults = [];
      let totalInterestSum = 0;
      
      for (let month = 1; month <= durationValue; month++) {
        // Calculate interest on remaining principal
        const monthlyInterest = Math.floor((remainingPrincipal * interestRateValue) / 100);
        const monthlyAmount = monthlyPrincipal + monthlyInterest;
        
        calculationResults.push({
          month,
          principal: monthlyPrincipal,
          interest: monthlyInterest,
          amount: monthlyAmount,
          remainingPrincipal
        });
        
        // Update remaining principal for next iteration
        remainingPrincipal -= monthlyPrincipal;
        totalInterestSum += monthlyInterest;
      }
      
      setResults(calculationResults);
      setTotalPrincipal(principalValue);
      setTotalInterest(totalInterestSum);
      setTotalAmount(principalValue + totalInterestSum);
      setIsLoading(false);
      
      // Scroll to results
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 800);
  };

  // Prepare elements for printing by adding print-friendly classes
  const prepareForPrinting = (printMode = true) => {
    const resultSection = document.getElementById('results-section');
    const originalStyles = {};
    
    // Store original classes to restore later
    if (printMode) {
      // Convert colorful cards to black and white
      const cards = resultSection.querySelectorAll('.bg-gradient-to-br');
      cards.forEach((card, index) => {
        originalStyles[`card-${index}`] = card.className;
        card.className = 'bg-white p-6 rounded-xl shadow-md border border-gray-400 print-friendly';
      });
      
      // Convert headers
      const headers = resultSection.querySelectorAll('th');
      headers.forEach((header, index) => {
        originalStyles[`header-${index}`] = header.className;
        header.className = 'px-6 py-4 bg-gray-800 text-xs font-medium text-white uppercase tracking-wider ' + 
          (header.className.includes('text-right') ? 'text-right' : 'text-left');
      });
      
      // Convert info box
      const infoBox = resultSection.querySelector('.bg-blue-50');
      if (infoBox) {
        originalStyles['info-box'] = infoBox.className;
        infoBox.className = 'mt-8 p-6 bg-gray-100 rounded-xl border border-gray-300';
      }
      
      // Convert icons - SVG elements don't have className, they have classList or attributes
      const iconContainers = resultSection.querySelectorAll('svg');
      iconContainers.forEach((icon, index) => {
        if (icon.getAttribute('class')) {
          originalStyles[`icon-${index}`] = icon.getAttribute('class');
          let newClass = icon.getAttribute('class');
          // Replace any text-color classes with text-gray-700
          if (newClass.includes('text-')) {
            newClass = newClass.split(' ')
              .map(cls => cls.startsWith('text-') && !cls.includes('text-gray-700') ? 'text-gray-700' : cls)
              .join(' ');
          }
          icon.setAttribute('class', newClass);
        }
        
        if (icon.parentElement && 
            icon.parentElement.className && 
            icon.parentElement.className.includes('rounded-full')) {
          originalStyles[`icon-parent-${index}`] = icon.parentElement.className;
          icon.parentElement.className = 'p-2 bg-gray-200 rounded-full mr-4';
        }
      });
      
      // Convert colored text
      const coloredTexts = resultSection.querySelectorAll('[class*="text-blue-"], [class*="text-purple-"], [class*="text-indigo-"]');
      coloredTexts.forEach((text, index) => {
        if (text.className && !text.classList.contains('print-friendly')) {
          originalStyles[`text-${index}`] = text.className;
          // Replace text color classes with text-gray-800
          let newClass = text.className;
          newClass = newClass.split(' ')
            .map(cls => {
              if (cls.startsWith('text-blue-') || 
                  cls.startsWith('text-purple-') || 
                  cls.startsWith('text-indigo-')) {
                return 'text-gray-800';
              }
              return cls;
            })
            .join(' ');
          text.className = newClass;
        }
      });
    }
    
    return () => {
      // Restore original styles
      if (printMode) {
        // Restore cards
        const cards = resultSection.querySelectorAll('.print-friendly');
        cards.forEach((card, index) => {
          if (originalStyles[`card-${index}`]) {
            card.className = originalStyles[`card-${index}`];
          }
        });
        
        // Restore headers
        const headers = resultSection.querySelectorAll('th');
        headers.forEach((header, index) => {
          if (originalStyles[`header-${index}`]) {
            header.className = originalStyles[`header-${index}`];
          }
        });
        
        // Restore info box
        const infoBox = resultSection.querySelector('.bg-gray-100');
        if (infoBox && originalStyles['info-box']) {
          infoBox.className = originalStyles['info-box'];
        }
        
        // Restore icons
        const icons = resultSection.querySelectorAll('svg');
        icons.forEach((icon, index) => {
          if (originalStyles[`icon-${index}`]) {
            icon.setAttribute('class', originalStyles[`icon-${index}`]);
          }
          if (icon.parentElement && originalStyles[`icon-parent-${index}`]) {
            icon.parentElement.className = originalStyles[`icon-parent-${index}`];
          }
        });
        
        // Restore colored texts
        const coloredTexts = resultSection.querySelectorAll('[class*="text-gray-800"]');
        coloredTexts.forEach((text, index) => {
          if (originalStyles[`text-${index}`]) {
            text.className = originalStyles[`text-${index}`];
          }
        });
      }
    };
  };

  const handleDownloadImage = () => {
    // Show loading state
    setIsLoading(true);
    
    // Get only the table section, not the summary cards
    const tableSection = document.querySelector('.overflow-x-auto.rounded-xl');
    
    if (!tableSection) {
      setIsLoading(false);
      alert('Could not find table to export');
      return;
    }
    
    // Create wrapper for better styling
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.backgroundColor = 'white';
    wrapper.style.width = 'fit-content';
    
    // Create title for the image with loan details
    const title = document.createElement('h3');
    title.innerHTML = `You-First Loans - Payment Schedule<br/>
                      <span style="font-size: 14px; font-weight: normal;">
                        Principal: ₦${totalPrincipal.toLocaleString()} | 
                        Interest Rate: ${interestRate}% | 
                        Duration: ${duration} months
                      </span>`;
    title.style.marginBottom = '15px';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '18px';
    title.style.textAlign = 'center';
    title.style.lineHeight = '1.6';
    
    // Append elements
    wrapper.appendChild(title);
    wrapper.appendChild(tableSection.cloneNode(true));
    
    // Add to body temporarily (hidden)
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    document.body.appendChild(wrapper);
    
    html2canvas(wrapper).then(canvas => {
      // Create image from canvas
      const image = canvas.toDataURL('image/png');
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = image;
      link.download = 'You-First-Loan-Table.png';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      document.body.removeChild(wrapper);
      
      // Hide loading state
      setIsLoading(false);
    });
  };

  const handleDownloadPDF = () => {
    setIsLoading(true);
    
    // Get only the table section, not the summary cards
    const tableSection = document.querySelector('.overflow-x-auto.rounded-xl');
    
    if (!tableSection) {
      setIsLoading(false);
      alert('Could not find table to export');
      return;
    }
    
    // Create wrapper for better styling
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.backgroundColor = 'white';
    wrapper.style.width = 'fit-content';
    
    // Create title for the PDF with loan details
    const title = document.createElement('h2');
    title.innerHTML = `You-First Loans - Payment Schedule<br/>
                      <span style="font-size: 14px; font-weight: normal;">
                        Principal: ₦${totalPrincipal.toLocaleString()} | 
                        Interest Rate: ${interestRate}% | 
                        Duration: ${duration} months
                      </span>`;
    title.style.marginBottom = '15px';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '18px';
    title.style.textAlign = 'center';
    title.style.lineHeight = '1.6';
    
    // Create footer with info
    const footer = document.createElement('div');
    footer.style.marginTop = '15px';
    footer.style.fontSize = '12px';
    footer.style.color = '#666';
    footer.style.textAlign = 'center';
    footer.innerHTML = `
      <p>Total Principal: ₦${totalPrincipal.toLocaleString()} | Total Interest: ₦${totalInterest.toLocaleString()} | Total Amount: ₦${totalAmount.toLocaleString()}</p>
      <p style="margin-top: 10px">Generated on ${new Date().toLocaleDateString()}</p>
    `;
    
    // Append elements
    wrapper.appendChild(title);
    wrapper.appendChild(tableSection.cloneNode(true));
    wrapper.appendChild(footer);
    
    // Add to body temporarily (hidden)
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    document.body.appendChild(wrapper);
    
    html2canvas(wrapper).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation for better table fit
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('You-First-Loan-Table.pdf');
      
      // Clean up
      document.body.removeChild(wrapper);
      
      setIsLoading(false);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 font-['Poppins',sans-serif]">
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">You-First Loans</h1>
            <h2 className="text-xl font-medium text-blue-100 max-w-xl leading-relaxed">Professional Reducing Balance Loan Calculator</h2>
            <div className="mt-6 bg-white/10 inline-block px-4 py-2 rounded-lg backdrop-blur-sm">
              <p className="text-blue-50 text-sm">Calculate your loans with our reducing balance method for fair and transparent interest rates</p>
            </div>
          </div>
        </div>
        
        {/* Calculator Form */}
        <div className="p-8 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Enter Loan Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-transform hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <label className="block text-gray-700 font-bold" htmlFor="principal">
                  Principal Amount
                </label>
              </div>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₦</span>
                </div>
                <input
                  className="block w-full pl-10 pr-12 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  id="principal"
                  type="number"
                  placeholder="e.g. 500000"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400 text-sm">NGN</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">Enter the total loan amount</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-transform hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <label className="block text-gray-700 font-bold" htmlFor="interestRate">
                  Interest Rate
                </label>
              </div>
              <div className="relative mt-1">
                <input
                  className="block w-full pl-3 pr-12 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  id="interestRate"
                  type="number"
                  placeholder="e.g. 10"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400">%</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">Enter the monthly interest rate</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-transform hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <label className="block text-gray-700 font-bold" htmlFor="duration">
                  Duration
                </label>
              </div>
              <div className="relative mt-1">
                <input
                  className="block w-full pl-3 pr-16 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  id="duration"
                  type="number"
                  placeholder="e.g. 6"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400">Months</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">Enter the loan duration in months</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              className={`bg-blue-700 text-white font-bold py-4 px-10 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg transition-all flex items-center ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-blue-800 hover:shadow-xl hover:-translate-y-1"
              }`}
              type="button"
              onClick={calculateLoan}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </>
              ) : (
                <>
                  Calculate Loan
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Results */}
        {results.length > 0 && (
          <div className="p-8 border-t border-gray-200" ref={tableRef} id="results-section">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Payment Schedule</h3>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  className="flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md transition-all hover:shadow-lg"
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Download Table as PDF
                </button>
                <button
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md transition-all hover:shadow-lg"
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Table as Image
                </button>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-blue-800 font-bold">Total Principal</h4>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">₦{totalPrincipal.toLocaleString()}</p>
                <p className="text-sm text-blue-700 mt-1">Loan amount to be repaid</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-md border border-indigo-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-indigo-800 font-bold">Total Interest</h4>
                  <div className="p-2 bg-indigo-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">₦{totalInterest.toLocaleString()}</p>
                <p className="text-sm text-indigo-700 mt-1">Total interest applied</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border border-purple-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-purple-800 font-bold">Total Amount</h4>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">₦{totalAmount.toLocaleString()}</p>
                <p className="text-sm text-purple-700 mt-1">Total payment amount</p>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200"
              data-loan-info={`You-First Loans - Payment Schedule | Principal: ₦${totalPrincipal.toLocaleString()} | Interest Rate: ${interestRate}% | Duration: ${duration} months`}>
              <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-4 bg-blue-900 text-xs font-medium text-white uppercase tracking-wider text-left">
                      Month
                    </th>
                    <th className="px-6 py-4 bg-blue-900 text-xs font-medium text-white uppercase tracking-wider text-right">
                      Principal (₦)
                    </th>
                    <th className="px-6 py-4 bg-blue-900 text-xs font-medium text-white uppercase tracking-wider text-right">
                      Interest (₦)
                    </th>
                    <th className="px-6 py-4 bg-blue-900 text-xs font-medium text-white uppercase tracking-wider text-right">
                      Amount (₦)
                    </th>
                    <th className="px-6 py-4 bg-blue-900 text-xs font-medium text-white uppercase tracking-wider text-right">
                      Remaining Principal (₦)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr 
                      key={result.month}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                        {result.principal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                        {result.interest.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                        {result.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                        {result.remainingPrincipal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50">
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-left">
                      TOTAL
                    </th>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {totalPrincipal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {totalInterest.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      -
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">About This Calculation</h4>
                  <p className="text-sm text-gray-600">
                    This calculator uses the reducing balance method. Each month, interest is calculated on the remaining principal. 
                    The principal payment remains constant throughout the loan duration, while the interest amount decreases over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanCalculator;