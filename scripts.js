// Asphalt Quote Calculator - Modern Web Application
class AsphaltCalculator {
    constructor() {
        this.otherLaborItems = [];
        this.currentQuote = null;
        this.isCalculating = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupConditionalSections();
        this.setupSectionToggles();
        this.loadDefaultValues();
        this.setupAutoSave();
        this.checkForQuoteToLoad();
    }

    setupEventListeners() {
        // Main calculation button
        document.getElementById('calculate_button').addEventListener('click', () => {
            this.calculateQuote();
        });

        // Header action buttons
        document.getElementById('save-quote').addEventListener('click', () => {
            this.saveQuote();
        });

        document.getElementById('load-quote').addEventListener('click', () => {
            this.loadQuote();
        });

        document.getElementById('export-pdf').addEventListener('click', () => {
            this.exportPDF();
        });

        // Close results panel
        document.getElementById('close-results').addEventListener('click', () => {
            this.hideResults();
        });

        // Add labor button
        document.getElementById('add-labor-btn').addEventListener('click', () => {
            this.addOtherLabor();
        });

        // File input for loading quotes
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileLoad(e);
        });

        // New quote button
        document.getElementById('new-quote').addEventListener('click', () => {
            this.createNewQuote();
        });

        // Load quote from search page
        this.checkForQuoteToLoad();

        // Save quote from results button
        document.getElementById('save-quote-from-results').addEventListener('click', () => {
            this.saveQuote();
        });

        // Real-time calculation triggers
        this.setupRealTimeCalculation();
    }

    setupFormValidation() {
        const form = document.getElementById('quote-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateQuote();
        });

        // Add validation to required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value.length > 0;
        
        if (!isValid) {
            field.classList.add('error');
            this.showFieldError(field, 'This field is required');
        } else {
            field.classList.remove('error');
            this.clearFieldError(field);
        }
        
        return isValid;
    }

    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error text-danger text-sm';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    setupConditionalSections() {
        // Traffic control section
        const trafficControl = document.getElementById('traffic_control');
        const trafficDetails = document.getElementById('traffic-control-details');
        
        trafficControl.addEventListener('change', () => {
            if (trafficControl.value === 'Yes') {
                trafficDetails.classList.remove('hidden');
            } else {
                trafficDetails.classList.add('hidden');
            }
        });

        // Waste disposal section
        const wasteDisposal = document.getElementById('waste_disposal');
        const wasteDetails = document.getElementById('waste-disposal-details');
        
        wasteDisposal.addEventListener('change', () => {
            if (wasteDisposal.value === 'Yes') {
                wasteDetails.classList.remove('hidden');
            } else {
                wasteDetails.classList.add('hidden');
            }
        });
    }

    setupSectionToggles() {
        const sectionHeaders = document.querySelectorAll('.section-header');
        
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.form-section');
                const content = section.querySelector('.section-content');
                const toggle = header.querySelector('.section-toggle');
                
                if (content.classList.contains('collapsed')) {
                    content.classList.remove('collapsed');
                    header.classList.remove('collapsed');
                } else {
                    content.classList.add('collapsed');
                    header.classList.add('collapsed');
                }
            });
        });
    }

    setupRealTimeCalculation() {
        const calculationFields = [
            'area', 'depth', 'cost_per_tonne', 'asphalt_density',
            'base_area', 'base_depth', 'base_cost_per_tonne', 'base_density',
            'required_workers', 'time_to_complete_job', 'hourly_rate',
            'profit_margin', 'tax_rate'
        ];

        calculationFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.debounce(() => {
                        if (this.isFormValid()) {
                            this.calculateQuote(true); // Silent calculation
                        }
                    }, 1000);
                });
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

    isFormValid() {
        const requiredFields = document.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    loadDefaultValues() {
        // Set default quote number with timestamp
        const quoteNumber = document.getElementById('quote_number');
        if (!quoteNumber.value) {
            const now = new Date();
            const timestamp = now.getTime().toString().slice(-6);
            quoteNumber.value = `Q-${timestamp}`;
        }
    }

    setupAutoSave() {
        // Auto-save form data every 30 seconds
        setInterval(() => {
            this.autoSave();
        }, 30000);
    }

    checkForQuoteToLoad() {
        const quoteData = localStorage.getItem('quoteToLoad');
        if (quoteData) {
            try {
                const quote = JSON.parse(quoteData);
                const isEditMode = quote._isEditMode !== false; // Default to edit mode
                
                // Remove the edit mode flag from the quote data
                const { _isEditMode, ...cleanQuoteData } = quote;
                
                this.loadQuoteData(cleanQuoteData);
                localStorage.removeItem('quoteToLoad');
                
                if (isEditMode) {
                    this.setEditMode(true, cleanQuoteData.projectInfo?.quoteNumber || 'Unknown Quote');
                    this.showNotification('Quote loaded for editing!', 'success');
                } else {
                    this.setEditMode(false);
                    this.setFormReadOnly(true);
                    this.showNotification('Quote loaded for viewing!', 'success');
                }
            } catch (error) {
                console.error('Error loading quote from localStorage:', error);
                localStorage.removeItem('quoteToLoad');
            }
        }
    }

    createNewQuote() {
        if (confirm('Are you sure you want to create a new quote? Any unsaved changes will be lost.')) {
            this.clearForm();
            this.currentQuote = null; // Clear current quote
            this.setEditMode(false);
            this.hideResults();
            this.showNotification('New quote created!', 'success');
        }
    }

    setEditMode(isEditing, quoteNumber = '') {
        const editIndicator = document.getElementById('edit-mode-indicator');
        const saveButton = document.getElementById('save-quote');
        const newQuoteButton = document.getElementById('new-quote');
        const form = document.getElementById('quote-form');
        
        if (isEditing) {
            editIndicator.classList.remove('hidden');
            editIndicator.querySelector('span').textContent = `Editing: ${quoteNumber}`;
            saveButton.innerHTML = '<i class="fas fa-save"></i> Update Quote';
            newQuoteButton.style.display = 'inline-flex';
            
            // Enable form editing
            this.setFormReadOnly(false);
        } else {
            editIndicator.classList.add('hidden');
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save Quote';
            newQuoteButton.style.display = 'inline-flex';
            
            // Enable form editing for new quotes
            this.setFormReadOnly(false);
        }
    }

    setFormReadOnly(readOnly) {
        const form = document.getElementById('quote-form');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.readOnly = readOnly;
            input.disabled = readOnly;
        });
        
        // Disable/enable buttons
        const buttons = form.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = readOnly;
        });
        
        // Update save button text
        const saveButton = document.getElementById('save-quote');
        if (readOnly) {
            saveButton.innerHTML = '<i class="fas fa-eye"></i> View Only';
            saveButton.disabled = true;
        }
    }

    clearForm() {
        const form = document.getElementById('quote-form');
        form.reset();
        
        // Clear other labor items
        this.otherLaborItems = [];
        this.refreshLaborList();
        
        // Reset default values
        this.loadDefaultValues();
        
        // Clear any stored calculations
        this.currentCalculations = null;
        
        // Clear current quote
        this.currentQuote = null;
    }

    autoSave() {
        const formData = this.getFormData();
        localStorage.setItem('asphalt_calculator_autosave', JSON.stringify(formData));
    }

    getFormData() {
        const form = document.getElementById('quote-form');
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add other labor items
        data.otherLaborItems = this.otherLaborItems;
        
        return data;
    }

    addOtherLabor() {
        const typeInput = document.getElementById('other_labor_type');
        const hoursInput = document.getElementById('other_labor_est_hours');
        const costInput = document.getElementById('other_labor_cost_per_hour');
        const addGstCheckbox = document.getElementById('add_gst');
        
        const type = typeInput.value.trim();
        const hours = parseFloat(hoursInput.value);
        const cost = parseFloat(costInput.value);
        const addGst = addGstCheckbox.checked;

        if (!type || hours <= 0 || cost < 0) {
            this.showNotification('Please fill in all required fields with valid values.', 'error');
            return;
        }

        const laborItem = {
            id: Date.now(),
            type: type,
            hours: hours,
            cost: cost,
            addGst: addGst
        };

        this.otherLaborItems.push(laborItem);
        this.addLaborItemToUI(laborItem);
        this.clearLaborForm();
        this.calculateQuote(true);
        
        this.showNotification('Labor item added successfully!', 'success');
    }

    addLaborItemToUI(laborItem) {
        const laborList = document.getElementById('labor-list');
        
        const laborItemElement = document.createElement('div');
        laborItemElement.className = 'labor-item';
        laborItemElement.dataset.id = laborItem.id;
        
        let laborCost = laborItem.hours * laborItem.cost;
        if (laborItem.addGst) {
            laborCost *= 1.1;
        }
        
        laborItemElement.innerHTML = `
            <div class="labor-item-info">
                <div class="font-medium">${laborItem.type}</div>
                <div class="text-sm text-secondary">
                    ${laborItem.hours} hrs × $${laborItem.cost}/hr
                    ${laborItem.addGst ? ' (GST included)' : ''}
                </div>
                <div class="text-sm font-medium text-success">$${laborCost.toFixed(2)}</div>
            </div>
            <div class="labor-item-actions">
                <button type="button" class="btn btn-danger btn-icon delete-labor-item" data-id="${laborItem.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        laborList.appendChild(laborItemElement);
        
        // Add delete event listener
        const deleteBtn = laborItemElement.querySelector('.delete-labor-item');
        deleteBtn.addEventListener('click', () => {
            this.deleteLaborItem(laborItem.id);
        });
    }

    deleteLaborItem(id) {
        const index = this.otherLaborItems.findIndex(item => item.id === id);
        if (index > -1) {
            this.otherLaborItems.splice(index, 1);
            const element = document.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.remove();
            }
            this.calculateQuote(true);
            this.showNotification('Labor item removed.', 'success');
        }
    }

    clearLaborForm() {
        document.getElementById('other_labor_type').value = '';
        document.getElementById('other_labor_est_hours').value = '0';
        document.getElementById('other_labor_cost_per_hour').value = '0';
        document.getElementById('add_gst').checked = false;
    }

    calculateQuote(silent = false) {
        if (!this.isFormValid()) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        if (!silent) {
            this.showLoading();
        }

        // Simulate calculation delay for better UX
        setTimeout(() => {
            try {
                const results = this.performCalculations();
                this.currentCalculations = results; // Store calculations for saving
                this.displayResults(results);
                
                if (!silent) {
                    this.hideLoading();
                    this.showResults();
                    this.showNotification('Quote calculated successfully!', 'success');
                }
            } catch (error) {
                console.error('Calculation error:', error);
                this.hideLoading();
                this.showNotification('Error calculating quote. Please check your inputs.', 'error');
            }
        }, 500);
    }

    performCalculations() {
        // Get all form values
        const formData = this.getFormData();
        
        // Parse numeric values
        const area = parseFloat(formData.area) || 0;
        const depth = parseFloat(formData.depth) || 0;
        const density = parseFloat(formData.asphalt_density) || 2400;
        const costPerTonne = parseFloat(formData.cost_per_tonne) || 190;
        
        const baseArea = parseFloat(formData.base_area) || 0;
        const baseDepth = parseFloat(formData.base_depth) || 0;
        const baseDensity = parseFloat(formData.base_density) || 1800;
        const baseCostPerTonne = parseFloat(formData.base_cost_per_tonne) || 30;
        
        const workersRequired = parseFloat(formData.required_workers) || 2;
        const timeToComplete = parseFloat(formData.time_to_complete_job) || 2;
        const hourlyRate = parseFloat(formData.hourly_rate) || 30;
        const superannuation = parseFloat(formData.superannuation) || 11;
        const workersCompensation = parseFloat(formData.workers_compensation) || 2;
        const otherLaborCosts = parseFloat(formData.other_labor_costs) || 2;
        
        const profitMargin = parseFloat(formData.profit_margin) || 40;
        const taxRate = parseFloat(formData.tax_rate) || 10;
        
        // Calculate asphalt costs
        const volume = area * (depth / 1000);
        const weight = (volume * (density / 1000)) * 1.25; // 25% compaction
        const asphaltCost = weight * costPerTonne;
        const asphaltTruckLoads = weight / 8.5;
        
        // Calculate base costs
        const baseVolume = baseArea * (baseDepth / 1000);
        const baseWeight = (baseVolume * (baseDensity / 1000)) * 1.2; // 20% compaction
        const baseCost = baseWeight * baseCostPerTonne;
        const baseTruckLoads = baseWeight / 11.5;
        
        // Calculate emulsion
        const emulsionRequired = area * 0.25;
        const emulsionCost = (0.5 * 1.5) * area * 1.05;
        
        // Calculate labor costs
        const adjustedHourlyRate = hourlyRate * (1 + (superannuation + workersCompensation + otherLaborCosts) / 100);
        const totalLaborCost = workersRequired * timeToComplete * adjustedHourlyRate;
        
        // Calculate other labor costs
        let totalOtherLaborCost = 0;
        this.otherLaborItems.forEach(item => {
            let laborCost = item.hours * item.cost;
            if (item.addGst) {
                laborCost *= 1.1;
            }
            totalOtherLaborCost += laborCost;
        });
        
        // Calculate equipment depreciation
        const totalDays = timeToComplete / 10;
        const equipmentDepreciation = this.calculateEquipmentDepreciation(totalDays);
        
        // Calculate consumables
        const consumablesCost = this.calculateConsumablesCost();
        
        // Calculate totals
        const totalCosts = totalLaborCost + asphaltCost + baseCost + totalOtherLaborCost + 
                          equipmentDepreciation + consumablesCost + emulsionCost;
        
        const quote = totalCosts / (1 - profitMargin / 100);
        const profit = quote - totalCosts;
        const totalWithTax = quote * (1 + taxRate / 100);
        
        return {
            // Project details
            quoteNumber: formData.quote_number,
            serviceType: formData.service_type,
            clientName: `${formData['project-firstname']} ${formData['project-lastname']}`,
            clientAddress: `${formData.project_address}, ${formData.project_city} ${formData.project_postcode}`,
            clientEmail: formData['project-email'],
            clientMobile: formData.project_mobile,
            companyName: formData['project-company'],
            companyABN: formData['project-abn'],
            companyPhone: formData.project_phone,
            
            // Calculations
            area: area,
            asphaltWeight: weight,
            asphaltCost: asphaltCost,
            asphaltTruckLoads: asphaltTruckLoads,
            baseWeight: baseWeight,
            baseCost: baseCost,
            baseTruckLoads: baseTruckLoads,
            emulsionRequired: emulsionRequired,
            emulsionCost: emulsionCost,
            totalLaborCost: totalLaborCost,
            totalOtherLaborCost: totalOtherLaborCost,
            equipmentDepreciation: equipmentDepreciation,
            consumablesCost: consumablesCost,
            totalCosts: totalCosts,
            quote: quote,
            profit: profit,
            totalWithTax: totalWithTax,
            costPerSquareMeter: totalCosts / area,
            quotePerSquareMeter: totalWithTax / area,
            profitPerSquareMeter: profit / area,
            
            // Dates
            currentDate: new Date().toLocaleDateString(),
            validUntil: new Date(Date.now() + (parseInt(formData['valid-for']) || 30) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            
            // Notes
            notes: formData.project_notes || ''
        };
    }

    calculateEquipmentDepreciation(totalDays) {
        const equipment = {
            compactor_plate: { count: parseFloat(document.getElementById('compactor_plate').value) || 0, cost: 3000, residual: 200, life: 3 },
            rammer_compactor: { count: parseFloat(document.getElementById('rammer_compactor').value) || 0, cost: 1500, residual: 200, life: 3 },
            leaf_blower: { count: parseFloat(document.getElementById('leaf_blower').value) || 0, cost: 500, residual: 150, life: 3 },
            concrete_cutter: { count: parseFloat(document.getElementById('concrete_cutter').value) || 0, cost: 500, residual: 150, life: 3 },
            skidsteer: { count: parseFloat(document.getElementById('skidsteer').value) || 0, cost: 40000, residual: 10000, life: 10 },
            mr_truck: { count: parseFloat(document.getElementById('mr_truck').value) || 0, cost: 40000, residual: 10000, life: 10 },
            hr_truck: { count: parseFloat(document.getElementById('hr_truck').value) || 0, cost: 50000, residual: 20000, life: 10 },
            trailer: { count: parseFloat(document.getElementById('trailer').value) || 0, cost: 3500, residual: 1000, life: 10 },
            car: { count: parseFloat(document.getElementById('car').value) || 0, cost: 35000, residual: 1000, life: 10 },
            _1t_roller: { count: parseFloat(document.getElementById('_1t_roller').value) || 0, cost: 25000, residual: 5000, life: 5 },
            _2t_roller: { count: parseFloat(document.getElementById('_2t_roller').value) || 0, cost: 35000, residual: 10000, life: 5 }
        };
        
        let totalDepreciation = 0;
        
        Object.values(equipment).forEach(item => {
            const annualDepreciation = (item.count * (item.cost - item.residual)) / item.life;
            const dailyDepreciation = annualDepreciation / 260;
            totalDepreciation += dailyDepreciation * totalDays;
        });
        
        return totalDepreciation;
    }

    calculateConsumablesCost() {
        const paintQty = parseFloat(document.getElementById('paint_required').value) || 0;
        const paintCost = parseFloat(document.getElementById('paint_cost').value) || 0;
        const petrolQty = parseFloat(document.getElementById('petrol_required').value) || 0;
        const petrolCost = parseFloat(document.getElementById('petrol_cost').value) || 0;
        const dieselQty = parseFloat(document.getElementById('diesel_required').value) || 0;
        const dieselCost = parseFloat(document.getElementById('diesel_cost').value) || 0;
        const gasQty = parseFloat(document.getElementById('gas_required').value) || 0;
        const gasCost = parseFloat(document.getElementById('gas_cost').value) || 0;
        
        return (paintQty * paintCost) + (petrolQty * petrolCost) + (dieselQty * dieselCost) + (gasQty * gasCost);
    }

    displayResults(results) {
        const resultContainer = document.getElementById('result');
        
        resultContainer.innerHTML = `
            <div class="results-container">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Quote Summary</h3>
                    <span class="text-sm text-secondary">Project #${results.quoteNumber}</span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="results-container">
                        <h3>Project Details</h3>
                        <p><span class="highlight">Service:</span> ${results.serviceType}</p>
                        <p><span class="highlight">Date Created:</span> ${results.currentDate}</p>
                        <p><span class="highlight">Valid Until:</span> ${results.validUntil}</p>
                        <p><span class="highlight">Subtotal:</span> $${results.quote.toFixed(2)}</p>
                        <p><span class="highlight">GST:</span> $${(results.totalWithTax - results.quote).toFixed(2)}</p>
                        <p><span class="highlight">Total Quote:</span> $${results.totalWithTax.toFixed(2)}</p>
                        <p><span class="highlight">Cost per m²:</span> $${results.quotePerSquareMeter.toFixed(2)}</p>
                        <p><span class="highlight">Deposit Required:</span> $${results.totalCosts.toFixed(2)}</p>
                    </div>
                    
                    <div class="results-container">
                        <h3>Client Information</h3>
                        <p><span class="highlight">Name:</span> ${results.clientName}</p>
                        <p><span class="highlight">Address:</span> ${results.clientAddress}</p>
                        <p><span class="highlight">Email:</span> ${results.clientEmail}</p>
                        <p><span class="highlight">Mobile:</span> ${results.clientMobile}</p>
                        <p><span class="highlight">Company:</span> ${results.companyName}</p>
                        <p><span class="highlight">ABN:</span> ${results.companyABN}</p>
                        <p><span class="highlight">Phone:</span> ${results.companyPhone}</p>
                    </div>
                </div>
            </div>
            
            <div class="results-stats">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="results-container">
                        <h3>Materials Required</h3>
                        <p><span class="highlight">Asphalt:</span> ${results.asphaltWeight.toFixed(2)} tonnes</p>
                        <p><span class="highlight">Truck Loads:</span> ${results.asphaltTruckLoads.toFixed(1)} (8.5t)</p>
                        <p><span class="highlight">Base Material:</span> ${results.baseWeight.toFixed(2)} tonnes</p>
                        <p><span class="highlight">Base Loads:</span> ${results.baseTruckLoads.toFixed(1)} (11.5t)</p>
                        <p><span class="highlight">Emulsion:</span> ${results.emulsionRequired.toFixed(2)} litres</p>
                    </div>
                    
                    <div class="results-container">
                        <h3>Cost Breakdown</h3>
                        <p><span class="highlight">Asphalt:</span> $${results.asphaltCost.toFixed(2)}</p>
                        <p><span class="highlight">Base Material:</span> $${results.baseCost.toFixed(2)}</p>
                        <p><span class="highlight">Emulsion:</span> $${results.emulsionCost.toFixed(2)}</p>
                        <p><span class="highlight">Labor:</span> $${results.totalLaborCost.toFixed(2)}</p>
                        <p><span class="highlight">Other Labor:</span> $${results.totalOtherLaborCost.toFixed(2)}</p>
                        <p><span class="highlight">Equipment:</span> $${results.equipmentDepreciation.toFixed(2)}</p>
                        <p><span class="highlight">Consumables:</span> $${results.consumablesCost.toFixed(2)}</p>
                    </div>
                    
                    <div class="results-container">
                        <h3>Profit Analysis</h3>
                        <p><span class="highlight">Total Costs:</span> $${results.totalCosts.toFixed(2)}</p>
                        <p><span class="highlight">Profit:</span> $${results.profit.toFixed(2)}</p>
                        <p><span class="highlight">Profit per m²:</span> $${results.profitPerSquareMeter.toFixed(2)}</p>
                        <p><span class="highlight">Profit Margin:</span> ${((results.profit / results.quote) * 100).toFixed(1)}%</p>
                        <p><span class="highlight">Cost per m²:</span> $${results.costPerSquareMeter.toFixed(2)}</p>
                    </div>
                </div>
                
                ${results.notes ? `
                <div class="results-container mt-6">
                    <h3>Notes</h3>
                    <p>${results.notes}</p>
                </div>
                ` : ''}
            </div>
        `;
    }

    showResults() {
        const resultsPanel = document.getElementById('results-panel');
        resultsPanel.classList.remove('hidden');
        
        // Scroll to results
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }

    hideResults() {
        const resultsPanel = document.getElementById('results-panel');
        resultsPanel.classList.add('hidden');
    }

    showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    async saveQuote() {
        try {
            const formData = this.getFormData();
            
            // Validate required fields before sending
            const validationErrors = this.validateQuoteData(formData);
            if (validationErrors.length > 0) {
                this.showNotification(`Please fill in all required fields: ${validationErrors.join(', ')}`, 'error');
                return;
            }
            
            // Transform form data to match backend schema
            const quoteData = this.transformFormDataForBackend(formData);
            
            const apiUrl = this.getApiUrl();
            const isEditing = this.currentQuote && this.currentQuote._id;
            
            console.log(isEditing ? 'Updating quote at:' : 'Saving quote to:', apiUrl);
            console.log('Quote data being sent:', quoteData);
            
            const url = isEditing 
                ? `${apiUrl}/api/quotes/${this.currentQuote._id}`
                : `${apiUrl}/api/quotes`;
            
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quoteData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                this.currentQuote = result.data;
                this.setEditMode(true, result.data.projectInfo?.quoteNumber || 'Unknown Quote');
                this.showNotification(
                    isEditing ? 'Quote updated successfully!' : 'Quote saved to database successfully!', 
                    'success'
                );
            } else {
                throw new Error(result.error || 'Failed to save quote');
            }
        } catch (error) {
            console.error('Error saving quote:', error);
            this.showNotification(`Error saving quote: ${error.message}`, 'error');
        }
    }

    validateQuoteData(formData) {
        const errors = [];
        
        // Check required client fields
        if (!formData['project-firstname']?.trim()) errors.push('First Name');
        if (!formData['project-lastname']?.trim()) errors.push('Last Name');
        if (!formData['project-email']?.trim()) errors.push('Email');
        if (!formData.project_address?.trim()) errors.push('Address');
        if (!formData.project_city?.trim()) errors.push('City');
        if (!formData.project_postcode?.trim()) errors.push('Postcode');
        
        // Check required service fields
        if (!formData.service_type?.trim()) errors.push('Service Type');
        
        // Check required project fields
        if (!formData['quote-number']?.trim()) errors.push('Quote Number');
        
        // Check required materials fields
        if (!formData.area || parseFloat(formData.area) <= 0) errors.push('Area');
        if (!formData.depth || parseFloat(formData.depth) <= 0) errors.push('Depth');
        
        return errors;
    }

    transformFormDataForBackend(formData) {
        // Ensure all required fields are properly formatted
        const quoteData = {
            clientInfo: {
                firstName: formData['project-firstname']?.trim() || '',
                lastName: formData['project-lastname']?.trim() || '',
                email: formData['project-email']?.trim() || '',
                mobile: formData.project_mobile?.trim() || '',
                address: formData.project_address?.trim() || '',
                apartment: formData.project_apartment?.trim() || '',
                city: formData.project_city?.trim() || '',
                postcode: formData.project_postcode?.trim() || '',
                state: formData.project_state?.trim() || 'Queensland',
                country: formData.project_country?.trim() || 'Australia'
            },
            companyInfo: {
                name: formData['project-company'],
                abn: formData['project-abn'],
                phone: formData.project_phone,
                fax: formData.project_fax
            },
            serviceInfo: {
                type: formData.service_type?.trim() || '',
                trafficControl: formData.traffic_control || 'No',
                trafficControlHours: parseFloat(formData['traffic-control-hours-required']) || 0,
                trafficControlWorkers: parseFloat(formData['traffic-control-workers-required']) || 0,
                wasteDisposal: formData['waste-disposal-required'] || 'No',
                wasteType: formData['waste-type']?.trim() || '',
                wasteLoads: parseFloat(formData['waste-loads']) || 0
            },
            projectInfo: {
                quoteNumber: formData['quote-number']?.trim() || '',
                validFor: parseFloat(formData['valid-for']) || 30,
                profitMargin: parseFloat(formData['profit-margin']) || 40,
                taxRate: parseFloat(formData.tax_rate) || 10
            },
            materials: {
                asphalt: {
                    area: parseFloat(formData.area) || 0,
                    depth: parseFloat(formData.depth) || 0,
                    costPerTonne: parseFloat(formData.cost_per_tonne) || 190,
                    density: parseFloat(formData.asphalt_density) || 2400
                },
                foundation: {
                    area: parseFloat(formData.base_area) || 0,
                    depth: parseFloat(formData.base_depth) || 0,
                    costPerTonne: parseFloat(formData.base_cost_per_tonne) || 30,
                    density: parseFloat(formData.base_density) || 1800
                }
            },
            labor: {
                workers: parseFloat(formData['required-workers']) || 2,
                hours: parseFloat(formData['time-to-complete-job']) || 2,
                hourlyRate: parseFloat(formData.hourly_rate) || 30,
                superannuation: parseFloat(formData.superannuation) || 11,
                workersCompensation: parseFloat(formData.workers_compensation) || 2,
                otherCosts: parseFloat(formData['other-labor-costs']) || 2
            },
            otherLaborItems: this.otherLaborItems.map(item => ({
                type: item.type,
                hours: item.hours,
                costPerHour: item.cost,
                addGst: item.addGst
            })),
            consumables: {
                paint: {
                    quantity: parseFloat(formData.paint_required) || 1,
                    cost: parseFloat(formData.paint_cost) || 3.99
                },
                petrol: {
                    litres: parseFloat(formData.petrol_required) || 0,
                    costPerLitre: parseFloat(formData.petrol_cost) || 2
                },
                diesel: {
                    litres: parseFloat(formData.diesel_required) || 0,
                    costPerLitre: parseFloat(formData.diesel_cost) || 2
                },
                gas: {
                    litres: parseFloat(formData.gas_required) || 0,
                    costPerLitre: parseFloat(formData.gas_cost) || 1.5
                }
            },
            equipment: {
                compactorPlate: parseFloat(formData.compressor_plate) || 0,
                rammerCompactor: parseFloat(formData.rammer_compactor) || 0,
                leafBlower: parseFloat(formData.leaf_blower) || 0,
                concreteCutter: parseFloat(formData.concrete_cutter) || 0,
                oneTRoller: parseFloat(formData._1t_roller) || 0,
                twoTRoller: parseFloat(formData._2t_roller) || 0,
                skidsteer: parseFloat(formData.skidsteer) || 0,
                mrTruck: parseFloat(formData.mr_truck) || 0,
                hrTruck: parseFloat(formData.hr_truck) || 0,
                trailer: parseFloat(formData.trailer) || 0,
                car: parseFloat(formData.car) || 0
            },
            notes: formData.project_notes?.trim() || '',
            calculations: this.getCalculations()
        };
        
        return quoteData;
    }

    getCalculations() {
        // Return the current calculation results if available
        if (this.currentCalculations) {
            return this.currentCalculations;
        }
        return {};
    }

    getApiUrl() {
        // In development, use localhost:3000
        // In production, use your deployed backend URL
        // Check if we're running on localhost or production
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';
        
        return isLocalhost 
            ? 'http://localhost:3000' 
            : window.location.origin; // Use same origin in production
    }

    loadQuote() {
        document.getElementById('file-input').click();
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const quoteData = JSON.parse(e.target.result);
                this.loadQuoteData(quoteData);
                this.showNotification('Quote loaded successfully!', 'success');
            } catch (error) {
                this.showNotification('Error loading quote file.', 'error');
            }
        };
        reader.readAsText(file);
        
        // Clear file input
        event.target.value = '';
    }

    loadQuoteData(data) {
        // Handle backend data format
        if (data.clientInfo) {
            // Backend format
            this.loadBackendData(data);
        } else {
            // Legacy format (from file)
            this.loadLegacyData(data);
        }
        
        // Trigger calculation
        this.calculateQuote(true);
    }

    loadBackendData(data) {
        // Set current quote for editing
        this.currentQuote = data;
        
        // Load client info
        if (data.clientInfo) {
            document.getElementById('project_firstname').value = data.clientInfo.firstName || '';
            document.getElementById('project_lastname').value = data.clientInfo.lastName || '';
            document.getElementById('project_email').value = data.clientInfo.email || '';
            document.getElementById('project_mobile').value = data.clientInfo.mobile || '';
            document.getElementById('project_address').value = data.clientInfo.address || '';
            document.getElementById('project_apartment').value = data.clientInfo.apartment || '';
            document.getElementById('project_city').value = data.clientInfo.city || '';
            document.getElementById('project_postcode').value = data.clientInfo.postcode || '';
            document.getElementById('project_state').value = data.clientInfo.state || 'Queensland';
            document.getElementById('project_country').value = data.clientInfo.country || 'Australia';
        }

        // Load company info
        if (data.companyInfo) {
            document.getElementById('project_company').value = data.companyInfo.name || '';
            document.getElementById('project_abn').value = data.companyInfo.abn || '';
            document.getElementById('project_phone').value = data.companyInfo.phone || '';
            document.getElementById('project_fax').value = data.companyInfo.fax || '';
        }

        // Load service info
        if (data.serviceInfo) {
            document.getElementById('service_type').value = data.serviceInfo.type || '';
            document.getElementById('traffic_control').value = data.serviceInfo.trafficControl || 'No';
            document.getElementById('traffic_control_hours_required').value = data.serviceInfo.trafficControlHours || '';
            document.getElementById('traffic_control_workers_required').value = data.serviceInfo.trafficControlWorkers || '';
            document.getElementById('waste_disposal').value = data.serviceInfo.wasteDisposal || 'No';
            document.getElementById('waste_type').value = data.serviceInfo.wasteType || '';
            document.getElementById('waste_loads').value = data.serviceInfo.wasteLoads || '';
        }

        // Load project info
        if (data.projectInfo) {
            document.getElementById('quote_number').value = data.projectInfo.quoteNumber || '';
            document.getElementById('valid_for').value = data.projectInfo.validFor || 30;
            document.getElementById('profit_margin').value = data.projectInfo.profitMargin || 40;
            document.getElementById('tax_rate').value = data.projectInfo.taxRate || 10;
        }

        // Load materials
        if (data.materials) {
            if (data.materials.asphalt) {
                document.getElementById('area').value = data.materials.asphalt.area || 0;
                document.getElementById('depth').value = data.materials.asphalt.depth || 0;
                document.getElementById('cost_per_tonne').value = data.materials.asphalt.costPerTonne || 190;
                document.getElementById('asphalt_density').value = data.materials.asphalt.density || 2400;
            }
            if (data.materials.foundation) {
                document.getElementById('base_area').value = data.materials.foundation.area || 0;
                document.getElementById('base_depth').value = data.materials.foundation.depth || 0;
                document.getElementById('base_cost_per_tonne').value = data.materials.foundation.costPerTonne || 30;
                document.getElementById('base_density').value = data.materials.foundation.density || 1800;
            }
        }

        // Load labor
        if (data.labor) {
            document.getElementById('required_workers').value = data.labor.workers || 2;
            document.getElementById('time_to_complete_job').value = data.labor.hours || 2;
            document.getElementById('hourly_rate').value = data.labor.hourlyRate || 30;
            document.getElementById('superannuation').value = data.labor.superannuation || 11;
            document.getElementById('workers_compensation').value = data.labor.workersCompensation || 2;
            document.getElementById('other_labor_costs').value = data.labor.otherCosts || 2;
        }

        // Load other labor items
        if (data.otherLaborItems) {
            this.otherLaborItems = data.otherLaborItems.map(item => ({
                id: item._id || Date.now(),
                type: item.type,
                hours: item.hours,
                cost: item.costPerHour,
                addGst: item.addGst
            }));
            this.refreshLaborList();
        }

        // Load consumables
        if (data.consumables) {
            if (data.consumables.paint) {
                document.getElementById('paint_required').value = data.consumables.paint.quantity || 1;
                document.getElementById('paint_cost').value = data.consumables.paint.cost || 3.99;
            }
            if (data.consumables.petrol) {
                document.getElementById('petrol_required').value = data.consumables.petrol.litres || 0;
                document.getElementById('petrol_cost').value = data.consumables.petrol.costPerLitre || 2;
            }
            if (data.consumables.diesel) {
                document.getElementById('diesel_required').value = data.consumables.diesel.litres || 0;
                document.getElementById('diesel_cost').value = data.consumables.diesel.costPerLitre || 2;
            }
            if (data.consumables.gas) {
                document.getElementById('gas_required').value = data.consumables.gas.litres || 0;
                document.getElementById('gas_cost').value = data.consumables.gas.costPerLitre || 1.5;
            }
        }

        // Load equipment
        if (data.equipment) {
            document.getElementById('compactor_plate').value = data.equipment.compressorPlate || 0;
            document.getElementById('rammer_compactor').value = data.equipment.rammerCompactor || 0;
            document.getElementById('leaf_blower').value = data.equipment.leafBlower || 0;
            document.getElementById('concrete_cutter').value = data.equipment.concreteCutter || 0;
            document.getElementById('_1t_roller').value = data.equipment.oneTRoller || 0;
            document.getElementById('_2t_roller').value = data.equipment.twoTRoller || 0;
            document.getElementById('skidsteer').value = data.equipment.skidsteer || 0;
            document.getElementById('mr_truck').value = data.equipment.mrTruck || 0;
            document.getElementById('hr_truck').value = data.equipment.hrTruck || 0;
            document.getElementById('trailer').value = data.equipment.trailer || 0;
            document.getElementById('car').value = data.equipment.car || 0;
        }

        // Load notes
        if (data.notes) {
            document.getElementById('project_notes').value = data.notes;
        }
    }

    loadLegacyData(data) {
        // Load form data (legacy format)
        Object.keys(data).forEach(key => {
            if (key !== 'otherLaborItems' && key !== 'timestamp' && key !== 'version') {
                const element = document.querySelector(`[name="${key}"]`);
                if (element) {
                    element.value = data[key];
                }
            }
        });
        
        // Load other labor items
        if (data.otherLaborItems) {
            this.otherLaborItems = data.otherLaborItems;
            this.refreshLaborList();
        }
    }

    refreshLaborList() {
        const laborList = document.getElementById('labor-list');
        laborList.innerHTML = '';
        
        this.otherLaborItems.forEach(item => {
            this.addLaborItemToUI(item);
        });
    }

    exportPDF() {
        this.showNotification('PDF export feature coming soon!', 'info');
        // TODO: Implement PDF generation using jsPDF or similar library
    }


}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AsphaltCalculator();
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1rem;
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-success {
        border-left: 4px solid var(--success-color);
    }
    
    .notification-error {
        border-left: 4px solid var(--danger-color);
    }
    
    .notification-info {
        border-left: 4px solid var(--primary-color);
    }
    
    .field-error {
        color: var(--danger-color);
        font-size: 0.75rem;
        margin-top: 0.25rem;
    }
    
    input.error {
        border-color: var(--danger-color);
    }
    
    .grid {
        display: grid;
    }
    
    .grid-cols-1 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    .grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    
    .gap-6 {
        gap: 1.5rem;
    }
    
    .mb-4 {
        margin-bottom: 1rem;
    }
    
    .mt-6 {
        margin-top: 1.5rem;
    }
    
    @media (max-width: 768px) {
        .md\\:grid-cols-2 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        
        .md\\:grid-cols-3 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
        }
    }
`;

document.head.appendChild(notificationStyles);
