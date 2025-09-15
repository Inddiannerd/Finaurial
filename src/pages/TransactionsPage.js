import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from '../utils/axios';
import { useDebounce } from '../utils/hooks';
import TransactionForm from '../components/TransactionForm';
import Card from '../components/Card';
import { useNotification } from '../context/NotificationContext';
import Modal from 'react-modal';

Modal.setAppElement('#root');

import { useCurrency } from '../context/CurrencyContext';

const TransactionsPage = () => {
  const { showNotification } = useNotification();
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState({ field: 'date', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const addButtonRef = useRef(null);

  const queryParams = useMemo(() => ({
    ...pagination,
    ...filters,
    search: debouncedSearchTerm,
    sort: `${sort.field},${sort.direction}`,
  }), [pagination, filters, debouncedSearchTerm, sort]);

  const fetchTransactions = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/transactions', { params: queryParams });
      setTransactions(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error fetching transactions';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [queryParams, showNotification]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSort = (field) => {
    setSort(prev => ({ field, direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPagination(prev => ({ ...prev, page: newPage }));
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    addButtonRef.current?.focus();
  };
  
  const handleDelete = async (id) => {
      if (!window.confirm('Are you sure?')) return;
      try {
          await axios.delete(`/transactions/${id}`);
          showNotification('Transaction deleted', 'success');
          fetchTransactions(false);
      } catch (err) {
          showNotification('Failed to delete transaction', 'error');
      }
  }

  const totalPages = Math.ceil(total / pagination.limit);

  const renderContent = () => {
    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-light-error dark:text-dark-error">Error: {error} <button onClick={() => fetchTransactions()} className="underline">Retry</button></div>;
    if (transactions.length === 0) return <div className="text-center py-10">No transactions found.</div>;

    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-light-border dark:border-dark-border">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('type')}>Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('category')}>Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('amount')}>Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.type}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(t.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">{t.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }} className="text-light-accent dark:text-dark-accent">Edit</button>
                    <button onClick={() => handleDelete(t._id)} className="text-light-error dark:text-dark-error">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm">Page {pagination.page} of {totalPages}</p>
            <div className="space-x-2">
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <button ref={addButtonRef} onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="bg-light-accent dark:bg-dark-accent text-white px-4 py-2 rounded-md min-h-[44px]">
          Add Transaction
        </button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select name="type" value={filters.type} onChange={handleFilterChange}><option value="">All Types</option><option value="income">Income</option><option value="expense">Expense</option></select>
          <input type="text" name="category" placeholder="Category..." value={filters.category} onChange={handleFilterChange} />
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        </div>
        {renderContent()}
      </Card>

      <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal} contentLabel="Transaction Form" overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" className="bg-light-background dark:bg-dark-background rounded-lg shadow-xl p-6 max-w-lg w-full focus:outline-none">
        <TransactionForm transaction={editingTransaction} onCancel={handleCloseModal} onTransactionAdded={() => { fetchTransactions(false); handleCloseModal(); }} onTransactionUpdated={() => { fetchTransactions(false); handleCloseModal(); }} />
      </Modal>
    </div>
  );
};

export default TransactionsPage;
