import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function LoanCalculator() {
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState(10); // Updated to 10% default
  const [duration, setDuration] = useState('');
  const [results, setResults] = useState([]);
  const [totalPrincipal, setTotalPrincipal] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const tableRef = useRef(null);

  const calculateLoan = () => {
    if (!principal || !duration) {
      alert('Please fill all fields');
      return;
    }

    const principalValue = parseInt(principal);
    const interestRateValue = parseInt(interestRate);
    const durationValue = parseInt(duration);
    
    if (isNaN(principalValue) || isNaN(interestRateValue) || isNaN(durationValue)) {
      alert('Please enter valid numbers');
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
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title with logo-like styling
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 153);
    doc.text('You-First Loans', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Loan Calculation Statement', 105, 30, { align: 'center' });
    
    // Add loan details
    doc.setFontSize(12);
    doc.text(`Principal Amount: ₦${parseInt(principal).toLocaleString()}`, 20, 45);
    doc.text(`Interest Rate: ${interestRate}%`, 20, 53);
    doc.text(`Duration: ${duration} months`, 20, 61);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 69);
    
    // Add separator line
    doc.setDrawColor(0, 51, 153);
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);
    
    // Create table data
    const tableColumn = ["Month", "Principal (₦)", "Interest (₦)", "Amount (₦)", "Remaining Principal (₦)"];
    const tableRows = results.map(item => [
      item.month,
      item.principal.toLocaleString(),
      item.interest.toLocaleString(),
      item.amount.toLocaleString(),
      item.remainingPrincipal.toLocaleString()
    ]);
    
    // Add totals row
    tableRows.push([
      'TOTAL',
      totalPrincipal.toLocaleString(),
      totalInterest.toLocaleString(),
      totalAmount.toLocaleString(),
      ''
    ]);
    
    // Add table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('You-First Loans - Reducing Balance Calculator', 20, doc.internal.pageSize.height - 10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
    }
    
    doc.save('you-first-loan-calculation.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 text-white">
          <h1 className="text-3xl font-bold text-center mb-2">You-First Loans</h1>
          <h2 className="text-xl font-medium text-center text-blue-100">Reducing Balance Loan Calculator</h2>
        </div>
        
        {/* Calculator Form */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="principal">
                Principal Amount (₦)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="principal"
                type="number"
                placeholder="e.g. 500000"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interestRate">
                Interest Rate (%)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="interestRate"
                type="number"
                placeholder="e.g. 10"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                Duration (Months)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="duration"
                type="number"
                placeholder="e.g. 6"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-center mb-6">
            <button
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transform transition hover:scale-105"
              type="button"
              onClick={calculateLoan}
            >
              Calculate Loan
            </button>
          </div>
        </div>
        
        {/* Results */}
        {results.length > 0 && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Calculation Results</h3>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md transition hover:shadow-lg"
                type="button"
                onClick={handleDownloadPDF}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg shadow" ref={tableRef}>
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-blue-900 text-white text-left">
                    <th className="py-3 px-4 font-semibold">Month</th>
                    <th className="py-3 px-4 font-semibold">Principal (₦)</th>
                    <th className="py-3 px-4 font-semibold">Interest (₦)</th>
                    <th className="py-3 px-4 font-semibold">Amount (₦)</th>
                    <th className="py-3 px-4 font-semibold">Remaining Principal (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.month} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-3 px-4 border-b">{result.month}</td>
                      <td className="py-3 px-4 border-b text-right">{result.principal.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-right">{result.interest.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-right">{result.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-right">{result.remainingPrincipal.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-bold">
                    <td className="py-3 px-4 border-b">TOTAL</td>
                    <td className="py-3 px-4 border-b text-right">{totalPrincipal.toLocaleString()}</td>
                    <td className="py-3 px-4 border-b text-right">{totalInterest.toLocaleString()}</td>
                    <td className="py-3 px-4 border-b text-right">{totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 border-b"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <h4 className="text-blue-800 font-bold mb-1">Total Principal</h4>
                <p className="text-2xl font-bold">₦{totalPrincipal.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <h4 className="text-blue-800 font-bold mb-1">Total Interest</h4>
                <p className="text-2xl font-bold">₦{totalInterest.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <h4 className="text-blue-800 font-bold mb-1">Total Amount</h4>
                <p className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanCalculator;