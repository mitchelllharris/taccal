// Search Quotes Page - Database-driven search interface
class QuoteSearch {
    constructor() {
        this.allQuotes = [];
        this.filteredQuotes = [];
        this.currentPage = 1;
        this.quotesPerPage = 20;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadQuotes();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refresh-quotes').addEventListener('click', () => {
            this.loadQuotes();
        });

        // Search input
        document.getElementById('search-input').addEventListener('input', () => {
            this.debounce(() => {
                this.filterQuotes();
            }, 300);
        });

        // Clear search
        document.getElementById('clear-search').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            this.filterQuotes();
        });

        // Filter controls
        document.getElementById('status-filter').addEventListener('change', () => {
            this.filterQuotes();
        });

        document.getElementById('service-filter').addEventListener('change', () => {
            this.filterQuotes();
        });

        document.getElementById('date-filter').addEventListener('change', () => {
            this.handleDateFilterChange();
        });

        // Custom date range inputs
        document.getElementById('date-from').addEventListener('change', () => {
            this.filterQuotes();
        });

        document.getElementById('date-to').addEventListener('change', () => {
            this.filterQuotes();
        });

        // Export CSV button
        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Load more button
        document.getElementById('load-more').addEventListener('click', () => {
            this.loadMoreQuotes();
        });

        // Retry button
        document.getElementById('retry-load').addEventListener('click', () => {
            this.loadQuotes();
        });

        // Search input enter key
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.filterQuotes();
            }
        });

        // Event delegation for quote action buttons
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.quote-result-item, .view-quote-btn, .edit-quote-btn, .delete-quote-btn');
            
            if (!target) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            if (target.classList.contains('quote-result-item')) {
                // Click on quote item - load for editing
                const quoteId = target.dataset.quoteId;
                if (quoteId) {
                    this.loadQuote(quoteId);
                }
            } else if (target.classList.contains('view-quote-btn')) {
                // View button clicked
                const quoteId = target.dataset.quoteId;
                if (quoteId) {
                    this.viewQuote(quoteId);
                }
            } else if (target.classList.contains('edit-quote-btn')) {
                // Edit button clicked
                const quoteId = target.dataset.quoteId;
                if (quoteId) {
                    this.editQuote(quoteId);
                }
            } else if (target.classList.contains('delete-quote-btn')) {
                // Delete button clicked
                const quoteId = target.dataset.quoteId;
                if (quoteId) {
                    this.deleteQuote(quoteId);
                }
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    getApiUrl() {
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';
        
        return isLocalhost 
            ? 'http://localhost:3000' 
            : window.location.origin;
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    showLoadingState() {
        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('quotes-list').classList.add('hidden');
        document.getElementById('error-state').classList.add('hidden');
        document.getElementById('empty-state').classList.add('hidden');
    }

    hideLoadingState() {
        document.getElementById('loading-state').classList.add('hidden');
    }

    showErrorState(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-state').classList.remove('hidden');
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('quotes-list').classList.add('hidden');
        document.getElementById('empty-state').classList.add('hidden');
    }

    hideErrorState() {
        document.getElementById('error-state').classList.add('hidden');
    }

    showEmptyState() {
        document.getElementById('empty-state').classList.remove('hidden');
        document.getElementById('quotes-list').classList.add('hidden');
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('error-state').classList.add('hidden');
    }

    hideEmptyState() {
        document.getElementById('empty-state').classList.add('hidden');
    }

    handleDateFilterChange() {
        const dateFilter = document.getElementById('date-filter').value;
        const customDateRange = document.getElementById('custom-date-range');
        
        if (dateFilter === 'custom') {
            customDateRange.style.display = 'block';
        } else {
            customDateRange.style.display = 'none';
        }
        
        this.filterQuotes();
    }

    async loadQuotes() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        this.hideErrorState();
        this.hideEmptyState();

        try {
            const apiUrl = this.getApiUrl();
            console.log('Loading quotes from:', apiUrl);
            
            const response = await fetch(`${apiUrl}/api/quotes`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();

            if (result.success) {
                this.allQuotes = result.data || [];
                this.updateStats();
                this.filterQuotes();
                this.showNotification(`Loaded ${this.allQuotes.length} quotes successfully!`, 'success');
            } else {
                throw new Error(result.error || 'Failed to load quotes');
            }
        } catch (error) {
            console.error('Error loading quotes:', error);
            this.showErrorState(`Error loading quotes: ${error.message}`);
            this.showNotification(`Error loading quotes: ${error.message}`, 'error');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    filterQuotes() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const serviceFilter = document.getElementById('service-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;

        this.filteredQuotes = this.allQuotes.filter(quote => {
            // Enhanced search term filter
            const clientName = this.getClientName(quote).toLowerCase();
            const quoteNumber = (quote.projectInfo?.quoteNumber || '').toLowerCase();
            const serviceType = (quote.serviceInfo?.type || '').toLowerCase();
            const clientEmail = (quote.clientInfo?.email || '').toLowerCase();
            const clientPhone = (quote.clientInfo?.mobile || '').toLowerCase();
            
            const matchesSearch = !searchTerm || 
                clientName.includes(searchTerm) ||
                quoteNumber.includes(searchTerm) ||
                serviceType.includes(searchTerm) ||
                clientEmail.includes(searchTerm) ||
                clientPhone.includes(searchTerm);

            // Status filter
            const isSaved = quote.calculations && Object.keys(quote.calculations).length > 0;
            const matchesStatus = !statusFilter || 
                (statusFilter === 'saved' && isSaved) ||
                (statusFilter === 'draft' && !isSaved);

            // Service filter
            const matchesService = !serviceFilter || 
                quote.serviceInfo?.type === serviceFilter;

            // Enhanced date filter
            const matchesDate = this.matchesDateFilter(quote.createdAt, dateFilter, dateFrom, dateTo);

            return matchesSearch && matchesStatus && matchesService && matchesDate;
        });

        this.currentPage = 1;
        this.displayQuotes();
        this.updateStats();
    }

    getClientName(quote) {
        if (quote.clientInfo?.firstName && quote.clientInfo?.lastName) {
            return `${quote.clientInfo.firstName} ${quote.clientInfo.lastName}`;
        }
        return quote.clientInfo?.fullName || 'Unknown Client';
    }

    matchesDateFilter(createdAt, dateFilter, dateFrom, dateTo) {
        if (!createdAt) return true;

        const quoteDate = new Date(createdAt);
        
        // Custom date range
        if (dateFilter === 'custom') {
            if (dateFrom && dateTo) {
                const fromDate = new Date(dateFrom);
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999); // End of day
                return quoteDate >= fromDate && quoteDate <= toDate;
            } else if (dateFrom) {
                const fromDate = new Date(dateFrom);
                return quoteDate >= fromDate;
            } else if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999); // End of day
                return quoteDate <= toDate;
            }
            return true;
        }

        if (!dateFilter) return true;

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        switch (dateFilter) {
            case 'today':
                return quoteDate >= startOfDay;
            case 'week':
                return quoteDate >= startOfWeek;
            case 'month':
                return quoteDate >= startOfMonth;
            case 'quarter':
                return quoteDate >= startOfQuarter;
            case 'year':
                return quoteDate >= startOfYear;
            default:
                return true;
        }
    }

    displayQuotes() {
        const quotesList = document.getElementById('quotes-list');
        const startIndex = 0;
        const endIndex = this.currentPage * this.quotesPerPage;
        const quotesToShow = this.filteredQuotes.slice(startIndex, endIndex);

        if (quotesToShow.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        quotesList.classList.remove('hidden');

        const quotesHTML = quotesToShow.map(quote => {
            const clientName = this.getClientName(quote);
            const quoteNumber = quote.projectInfo?.quoteNumber || 'No Quote Number';
            const serviceType = quote.serviceInfo?.type || 'Unknown Service';
            const createdAt = quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'Unknown Date';
            const totalAmount = quote.calculations?.totalWithTax ? `$${quote.calculations.totalWithTax.toFixed(2)}` : 'N/A';
            
            const isSaved = quote.calculations && Object.keys(quote.calculations).length > 0;
            const statusBadge = isSaved 
                ? '<span class="status-badge saved">Saved</span>' 
                : '<span class="status-badge draft">Draft</span>';

            return `
                <div class="quote-result-item" data-quote-id="${quote._id}">
                    <div class="quote-result-header">
                        <h4>${clientName}</h4>
                        ${statusBadge}
                    </div>
                    <div class="quote-result-details">
                        <p><strong>Quote:</strong> ${quoteNumber}</p>
                        <p><strong>Service:</strong> ${serviceType}</p>
                        <p><strong>Date:</strong> ${createdAt}</p>
                        <p class="quote-amount"><strong>Total:</strong> ${totalAmount}</p>
                        ${quote.clientInfo?.email ? `<p><strong>Email:</strong> ${quote.clientInfo.email}</p>` : ''}
                        ${quote.clientInfo?.mobile ? `<p><strong>Phone:</strong> ${quote.clientInfo.mobile}</p>` : ''}
                    </div>
                    <div class="quote-result-actions">
                        <button class="btn btn-secondary btn-sm view-quote-btn" data-quote-id="${quote._id}" title="View Quote">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-primary btn-sm edit-quote-btn" data-quote-id="${quote._id}" title="Edit Quote">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-quote-btn" data-quote-id="${quote._id}" title="Delete Quote">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    <div class="quote-result-hint">
                        <small>Click to view and edit this quote</small>
                    </div>
                </div>
            `;
        }).join('');

        quotesList.innerHTML = quotesHTML;

        // Show/hide load more button
        const loadMoreContainer = document.getElementById('load-more-container');
        if (endIndex < this.filteredQuotes.length) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }

    loadMoreQuotes() {
        this.currentPage++;
        this.displayQuotes();
    }

    updateStats() {
        const totalQuotes = this.allQuotes.length;
        const savedQuotes = this.allQuotes.filter(q => q.calculations && Object.keys(q.calculations).length > 0).length;
        const draftQuotes = totalQuotes - savedQuotes;
        const filteredCount = this.filteredQuotes.length;

        document.getElementById('total-quotes').querySelector('.stat-number').textContent = totalQuotes;
        document.getElementById('saved-quotes').querySelector('.stat-number').textContent = savedQuotes;
        document.getElementById('draft-quotes').querySelector('.stat-number').textContent = draftQuotes;
        document.getElementById('filtered-count').textContent = `Showing ${filteredCount} of ${totalQuotes} quotes`;
    }

    async loadQuote(quoteId, isEditMode = true) {
        try {
            this.showLoading();
            
            const apiUrl = this.getApiUrl();
            const response = await fetch(`${apiUrl}/api/quotes/${quoteId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();

            if (result.success) {
                // Store the quote data and edit mode in localStorage and redirect to main page
                const quoteData = {
                    ...result.data,
                    _isEditMode: isEditMode
                };
                localStorage.setItem('quoteToLoad', JSON.stringify(quoteData));
                window.location.href = 'index.html';
            } else {
                throw new Error(result.error || 'Failed to load quote');
            }
        } catch (error) {
            console.error('Error loading quote:', error);
            this.showNotification(`Error loading quote: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    editQuote(quoteId) {
        this.loadQuote(quoteId, true);
    }

    viewQuote(quoteId) {
        this.loadQuote(quoteId, false);
    }

    async deleteQuote(quoteId) {
        if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading();
            
            const apiUrl = this.getApiUrl();
            const response = await fetch(`${apiUrl}/api/quotes/${quoteId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();

            if (result.success) {
                this.showNotification('Quote deleted successfully!', 'success');
                this.loadQuotes(); // Reload the list
            } else {
                throw new Error(result.error || 'Failed to delete quote');
            }
        } catch (error) {
            console.error('Error deleting quote:', error);
            this.showNotification(`Error deleting quote: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    exportToCSV() {
        if (this.filteredQuotes.length === 0) {
            this.showNotification('No quotes to export. Please adjust your search criteria.', 'error');
            return;
        }

        try {
            // Prepare CSV data
            const csvData = this.prepareCSVData();
            
            // Create and download CSV file
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `quotes_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification(`Successfully exported ${this.filteredQuotes.length} quotes to CSV!`, 'success');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            this.showNotification('Error exporting CSV file.', 'error');
        }
    }

    prepareCSVData() {
        // CSV headers
        const headers = [
            'Quote Number',
            'Client Name',
            'Client Email',
            'Client Phone',
            'Service Type',
            'Status',
            'Created Date',
            'Total Amount',
            'Area (sq m)',
            'Depth (mm)',
            'Labor Cost',
            'Material Cost',
            'Equipment Cost',
            'Profit Margin (%)',
            'Notes'
        ];

        // CSV rows
        const rows = this.filteredQuotes.map(quote => {
            const clientName = this.getClientName(quote);
            const quoteNumber = quote.projectInfo?.quoteNumber || 'N/A';
            const serviceType = quote.serviceInfo?.type || 'N/A';
            const createdAt = quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A';
            const totalAmount = quote.calculations?.totalWithTax ? quote.calculations.totalWithTax.toFixed(2) : 'N/A';
            const isSaved = quote.calculations && Object.keys(quote.calculations).length > 0;
            const status = isSaved ? 'Saved' : 'Draft';
            
            // Extract calculation details
            const area = quote.materials?.asphalt?.area || quote.calculations?.area || 'N/A';
            const depth = quote.materials?.asphalt?.depth || 'N/A';
            const laborCost = quote.calculations?.totalLaborCost ? quote.calculations.totalLaborCost.toFixed(2) : 'N/A';
            const materialCost = quote.calculations?.asphaltCost ? quote.calculations.asphaltCost.toFixed(2) : 'N/A';
            const equipmentCost = quote.calculations?.equipmentDepreciation ? quote.calculations.equipmentDepreciation.toFixed(2) : 'N/A';
            const profitMargin = quote.projectInfo?.profitMargin || 'N/A';
            const notes = quote.notes || '';

            return [
                quoteNumber,
                clientName,
                quote.clientInfo?.email || 'N/A',
                quote.clientInfo?.mobile || 'N/A',
                serviceType,
                status,
                createdAt,
                totalAmount,
                area,
                depth,
                laborCost,
                materialCost,
                equipmentCost,
                profitMargin,
                notes
            ];
        });

        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return csvContent;
    }
}

// Initialize the search page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quoteSearch = new QuoteSearch();
}); 