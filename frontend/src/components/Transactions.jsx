import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [statementSummary, setStatementSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New account form state
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'CHECKING',
    balance: ''
  });

  // Mock accounts data
  useEffect(() => {
    setAccounts([
      { id: 1, name: 'Chase Checking', type: 'CHECKING', balance: 2500.00 },
      { id: 2, name: 'Savings Account', type: 'SAVINGS', balance: 15000.00 },
      { id: 3, name: 'Credit Card', type: 'CREDIT', balance: -1200.00 }
    ]);
    
    // Load categories
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setStatementSummary(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await axios.post('/api/pdf/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { data } = response.data;
      
      // Set statement summary
      setStatementSummary({
        balance: data.summary.balance,
        creditLimit: data.summary.creditLimit,
        availableCredit: data.summary.availableCredit,
        statementDate: data.summary.statementDate,
        dueDate: data.summary.dueDate,
        bankName: data.bankInfo.name
      });

      // Auto-fill new account form if "Add New Account" is selected
      if (showAddAccount) {
        setNewAccount({
          name: data.bankInfo.name,
          type: data.bankInfo.accountType,
          balance: data.summary.balance.toString()
        });
      }

      // Add transactions to list
      setTransactions(prev => [...prev, ...data.transactions]);

    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccountChange = (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      setShowAddAccount(true);
      setSelectedAccount('');
    } else {
      setShowAddAccount(false);
      setSelectedAccount(value);
    }
  };

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.balance) {
      alert('Please fill in all required fields');
      return;
    }

    const account = {
      id: accounts.length + 1,
      name: newAccount.name,
      type: newAccount.type,
      balance: parseFloat(newAccount.balance)
    };

    setAccounts(prev => [...prev, account]);
    setSelectedAccount(account.id.toString());
    setShowAddAccount(false);
    setNewAccount({ name: '', type: 'CHECKING', balance: '' });
  };

  const StatementSummary = () => {
    if (!statementSummary) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Statement Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-md shadow-sm">
            <div className="text-sm text-gray-600">Current Balance</div>
            <div className="text-xl font-bold text-green-600">
              £{statementSummary.balance.toFixed(2)}
            </div>
          </div>
          {statementSummary.creditLimit && (
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-600">Credit Limit</div>
              <div className="text-xl font-bold text-blue-600">
                £{statementSummary.creditLimit.toFixed(2)}
              </div>
            </div>
          )}
          {statementSummary.availableCredit && (
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-600">Available Credit</div>
              <div className="text-xl font-bold text-purple-600">
                £{statementSummary.availableCredit.toFixed(2)}
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Bank: {statementSummary.bankName} | Statement Date: {statementSummary.statementDate}
          {statementSummary.dueDate && ` | Due Date: ${statementSummary.dueDate}`}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Transactions</h2>
        
        {/* Import Statement Section */}
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Import Statement</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isProcessing && (
              <div className="text-blue-600 font-medium">Processing PDF...</div>
            )}
          </div>
        </div>

        {/* Statement Summary */}
        <StatementSummary />

        {/* Account Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Account
          </label>
          <select
            value={selectedAccount}
            onChange={handleAccountChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose an account...</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type}) - £{account.balance.toFixed(2)}
              </option>
            ))}
            <option value="add_new">➕ Add New Account</option>
          </select>
        </div>

        {/* Add New Account Form */}
        {showAddAccount && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-lg font-medium mb-3">Add New Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Virgin Card"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, type: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CREDIT">Credit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddAccount}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Account
              </button>
              <button
                onClick={() => {
                  setShowAddAccount(false);
                  setNewAccount({ name: '', type: 'CHECKING', balance: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No transactions yet. Import a statement to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                          £{Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;