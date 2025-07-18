// Asphalt Quote Calculator - Modern Web Application
class AsphaltCalculator {
    constructor() {
        this.otherLaborItems = [];
        this.excavationItems = [];
        this.importMaterials = [];
        this.laborRoles = [];
        this.currentQuote = null;
        this.isCalculating = false;
        this.isViewMode = false; // Track if we are in view mode
        // New for refactored excavation
        this.excavationEquipment = [];
        this.excavationItemsV2 = [];
        this.thirdPartyExcavationItems = [];
        this.editingImportMaterialId = null;
        this.editingExcavationItemId = null;
        this.editingLaborItemId = null;
        this.editingLaborRoleId = null;
        this.projectImages = [];
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
        this.refreshLaborRoles();
        // Disable Save button initially
        const saveBtn = document.getElementById('save-quote');
        if (saveBtn) saveBtn.disabled = true;
        // Excavation section setup
        this.setupExcavationSection();
        // Customer search setup
        this.setupCustomerSearch();
        // Area calculator setup
        this.setupAreaCalculator();
        // After DOMContentLoaded or in init(), add logic to show/hide the tip fee input for import materials
        // Example: If you have a disposal type select with id 'new_import_disposal', add this:
        const importDisposalSelect = document.getElementById('new_import_disposal');
        const importTipFeeGroup = document.getElementById('import_tip_fee_group');
        if (importDisposalSelect && importTipFeeGroup) {
            importDisposalSelect.addEventListener('change', function() {
                if (importDisposalSelect.value && importDisposalSelect.value !== 'Reuse') {
                    importTipFeeGroup.style.display = '';
                } else {
                    importTipFeeGroup.style.display = 'none';
                }
            });
            // Initial state
            if (importDisposalSelect.value && importDisposalSelect.value !== 'Reuse') {
                importTipFeeGroup.style.display = '';
            } else {
                importTipFeeGroup.style.display = 'none';
            }
        }
        // --- MATERIAL IMPORT CANCEL BUTTON SETUP ---
        this.addImportBtn = document.getElementById('add-import-material');
        this.saveImportEditBtn = document.getElementById('save-import-edit-btn');
        this.cancelImportEditBtn = document.getElementById('cancel-import-edit-btn');
        if (this.addImportBtn) {
            this.addImportBtn.onclick = () => this.addImportMaterial();
        }
        if (this.saveImportEditBtn) {
            this.saveImportEditBtn.onclick = () => this.saveImportMaterialEdit();
        }
        if (this.cancelImportEditBtn) {
            this.cancelImportEditBtn.onclick = this.resetImportFormAndEditState.bind(this);
        }
        this.setupProjectImagesSection();
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

        // Add labor role button
        document.getElementById('add-labor-role-btn').addEventListener('click', () => {
            this.addLaborRole();
        });

        // Save labor item edit button
        const saveLaborEditBtn = document.getElementById('save-labor-edit-btn');
        if (saveLaborEditBtn) {
            saveLaborEditBtn.addEventListener('click', () => {
                this.saveLaborItemEdit();
            });
        }

        // Cancel labor item edit button
        const cancelLaborEditBtn = document.getElementById('cancel-labor-edit-btn');
        if (cancelLaborEditBtn) {
            cancelLaborEditBtn.addEventListener('click', () => {
                this.resetLaborFormAndEditState();
            });
        }

        // Save labor role edit button
        const saveLaborRoleEditBtn = document.getElementById('save-labor-role-edit-btn');
        if (saveLaborRoleEditBtn) {
            saveLaborRoleEditBtn.addEventListener('click', () => {
                this.saveLaborRoleEdit();
            });
        }

        // Cancel labor role edit button
        const cancelLaborRoleEditBtn = document.getElementById('cancel-labor-role-edit-btn');
        if (cancelLaborRoleEditBtn) {
            cancelLaborRoleEditBtn.addEventListener('click', () => {
                this.resetLaborRoleFormAndEditState();
            });
        }

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

        // Add event listener for pricing method selector in additional labor
        const pricingMethodSelect = document.getElementById('other_labor_pricing_method');
        if (pricingMethodSelect) {
            pricingMethodSelect.addEventListener('change', () => {
                this.updateOtherLaborPricingMethodUI();
            });
        }


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
        // No validation required for calculation
        return true;
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

        // Setup multi-select components
        this.setupMultiSelect();
    }

    setupMultiSelect() {
        const multiSelectFields = [
            'traffic_control_equipment',
            'traffic_control_permits', 
            'traffic_control_weather'
        ];

        multiSelectFields.forEach(fieldName => {
            this.setupMultiSelectField(fieldName);
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.multi-select-container')) {
                document.querySelectorAll('.multi-select-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
                document.querySelectorAll('.multi-select-display').forEach(display => {
                    display.classList.remove('active');
                });
            }
        });
    }

    setupMultiSelectField(fieldName) {
        const display = document.getElementById(`${fieldName}_display`);
        const dropdown = document.getElementById(`${fieldName}_dropdown`);
        const hiddenInput = document.getElementById(fieldName);
        
        if (!display || !dropdown || !hiddenInput) {
            console.warn(`Multi-select field ${fieldName} not found in DOM`);
            return;
        }
        
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

        // Toggle dropdown
        display.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = dropdown.classList.contains('show');
            
            // Close all other dropdowns
            document.querySelectorAll('.multi-select-dropdown').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('show');
                }
            });
            document.querySelectorAll('.multi-select-display').forEach(d => {
                if (d !== display) {
                    d.classList.remove('active');
                }
            });

            // Toggle current dropdown
            dropdown.classList.toggle('show');
            display.classList.toggle('active');
        });

        // Handle checkbox changes
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateMultiSelectDisplay(fieldName);
                this.updateMultiSelectValue(fieldName);
                
                // Trigger calculation if needed
                if (this.isFormValid()) {
                    this.calculateQuote(true);
                }
            });
        });

        // Add event listeners for real-time calculation
        const debouncedCalculation = this.debounce(() => {
            if (this.isFormValid()) {
                this.calculateQuote(true);
            }
        }, 1000);

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', debouncedCalculation);
        });

        // Initialize display
        this.updateMultiSelectDisplay(fieldName);
    }

    updateMultiSelectDisplay(fieldName) {
        const display = document.getElementById(`${fieldName}_display`);
        const dropdown = document.getElementById(`${fieldName}_dropdown`);
        
        if (!display || !dropdown) {
            console.warn(`Multi-select display elements for ${fieldName} not found`);
            return;
        }
        
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');

        if (checkboxes.length === 0) {
            display.innerHTML = '<span class="placeholder">Select options</span>';
        } else {
            const selectedItems = Array.from(checkboxes).map(cb => cb.value);
            const itemsHTML = selectedItems.map(item => 
                `<span class="selected-item">${item}<span class="remove" data-value="${item}" data-field="${fieldName}">×</span></span>`
            ).join('');
            
            display.innerHTML = `<div class="selected-items">${itemsHTML}</div>`;
            
            // Add remove event listeners
            display.querySelectorAll('.remove').forEach(removeBtn => {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const value = removeBtn.dataset.value;
                    const checkbox = document.querySelector(`#${fieldName}_dropdown input[value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = false;
                        this.updateMultiSelectDisplay(fieldName);
                        this.updateMultiSelectValue(fieldName);
                        
                        if (this.isFormValid()) {
                            this.calculateQuote(true);
                        }
                    }
                });
            });
        }
    }

    updateMultiSelectValue(fieldName) {
        const hiddenInput = document.getElementById(fieldName);
        const dropdown = document.getElementById(`${fieldName}_dropdown`);
        
        if (!hiddenInput || !dropdown) {
            console.warn(`Multi-select value elements for ${fieldName} not found`);
            return;
        }
        
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');

        const selectedValues = Array.from(checkboxes).map(cb => cb.value);
        hiddenInput.value = selectedValues.join(', ');
    }

    loadMultiSelectField(fieldName, value) {
        const hiddenInput = document.getElementById(fieldName);
        const dropdown = document.getElementById(`${fieldName}_dropdown`);
        
        if (!hiddenInput || !dropdown || !value) {
            console.warn(`Multi-select load elements for ${fieldName} not found`);
            return;
        }
        
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

        // Clear all checkboxes first
        checkboxes.forEach(cb => cb.checked = false);
        
        // Set the hidden input value
        hiddenInput.value = value;
        
        // Check the appropriate checkboxes
        const values = value.split(', ').filter(item => item.trim());
        values.forEach(val => {
            const checkbox = document.querySelector(`#${fieldName}_dropdown input[value="${val.trim()}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // Update the display
        this.updateMultiSelectDisplay(fieldName);
    }

    setupSectionToggles() {
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.form-section');
                const content = section.querySelector('.section-content');
                // Close all other sections
                document.querySelectorAll('.form-section .section-content').forEach(sc => {
                    if (sc !== content) sc.classList.add('collapsed');
                });
                document.querySelectorAll('.form-section .section-header').forEach(hd => {
                    if (hd !== header) hd.classList.add('collapsed');
                });
                // Toggle this section
                const isCollapsed = content.classList.contains('collapsed');
                if (isCollapsed) {
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
        // Updated calculationFields with correct legacy labor field IDs
        const calculationFields = [
            // Legacy labor fields
            'required_workers', 'time_to_complete_job', 'hourly_rate', 'job_duration',
            'superannuation', 'workers_compensation', 'other_labor_costs',
            // Project fields
            'profit-margin', 'tax_rate', 'discount',
            // Emulsion fields
            'emulsion_type', 'emulsion_coverage', 'emulsion_cost_per_litre',
            // Traffic control fields
            'traffic_control', 'traffic_control_hours_required', 'traffic_control_workers_required', 'traffic_control_hourly_rate', 'traffic_control_complexity',
            // Excavation fields
            'excavation_required', 'excavation_type', 'excavation_machine', 'excavation_machine_rate',
            // Import/Material fields
            'new_import_material', 'new_import_area', 'new_import_depth', 'new_import_volume', 'new_import_density', 'new_import_cost_per_tonne', 'new_import_machine_hours', 'new_import_compaction',
            // Excavation item fields
            'new_excavation_description', 'new_excavation_area', 'new_excavation_material', 'new_excavation_depth', 'new_excavation_density', 'new_excavation_machine_hours', 'new_excavation_disposal', 'new_excavation_tip_fee', 'new_excavation_compaction',
            // Equipment/Consumables
            'paint_required', 'paint_cost', 'petrol_required', 'petrol_cost', 'diesel_required', 'diesel_cost', 'gas_required', 'gas_cost',
            // Equipment
            'compactor_plate', 'rammer_compactor', 'leaf_blower', 'concrete_cutter', '_1t_roller', '_2t_roller', 'skidsteer', 'mr_truck', 'hr_truck', 'trailer', 'car',
            // Excavation time estimation
            'excavator_bucket_size', 'truck_capacity', 'trucks_available', 'operation_efficiency', 'round_trip_time', 'excavator_cycle_time'
        ];

        calculationFields.forEach(fieldName => {
            // Try to find field by id first, then by name attribute
            let field = document.getElementById(fieldName);
            if (!field) {
                field = document.querySelector(`[name="${fieldName}"]`);
            }
            if (field) {
                // Attach both input and change events for robust recalculation
                const debouncedCalc = this.debounce(() => {
                    if (this.isFormValid()) {
                        this.calculateQuote(true); // Silent calculation
                    }
                }, 1000);
                field.addEventListener('input', debouncedCalc);
                field.addEventListener('change', debouncedCalc);
            }
        });

        // Add emulsion type change handler
        const emulsionTypeField = document.getElementById('emulsion_type');
        if (emulsionTypeField) {
            emulsionTypeField.addEventListener('change', () => {
                this.updateEmulsionDefaults();
            });
        }

        // Add special event listeners for excavation material calculations
        const excavationMaterialFields = ['removal_material', 'new_import_material', 'new_import_depth', 'new_import_volume', 'new_import_area', 'new_import_machine_hours'];
        excavationMaterialFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', () => {
                    this.calculateExcavationMaterials();
                });
                field.addEventListener('input', () => {
                    this.calculateExcavationMaterials();
                });
            }
        });
        
        // Add event listeners for import area and depth to auto-calculate import volume
        const newImportAreaField = document.getElementById('new_import_area');
        const newImportDepthField = document.getElementById('new_import_depth');
        
        if (newImportAreaField) {
            newImportAreaField.addEventListener('input', () => {
                this.calculateImportVolume();
            });
        }
        
        if (newImportDepthField) {
            newImportDepthField.addEventListener('input', () => {
                this.calculateImportVolume();
            });
        }
        
        // Add event listeners for material selection to auto-fill density
        const importMaterialField = document.getElementById('new_import_material');
        const importDensityField = document.getElementById('new_import_density');
        
        if (importMaterialField) {
            importMaterialField.addEventListener('change', () => {
                this.updateImportMaterialDensity();
            });
        }
        
        // Add event listeners for excavation material selection to auto-fill density
        const excavationMaterialField = document.getElementById('new_excavation_material');
        const excavationDensityField = document.getElementById('new_excavation_density');
        
        if (excavationMaterialField) {
            excavationMaterialField.addEventListener('change', () => {
                this.updateExcavationMaterialDensity();
            });
        }
        

        
        // Add specific event listeners for import depth auto-calculation
        if (newImportDepthField) {
            newImportDepthField.addEventListener('input', () => {
                this.calculateImportVolume();
            });
        }
        
        // Add event listeners for excavation time estimation
        const excavationTimeFields = [
            'excavator_bucket_size', 'truck_capacity', 'trucks_available', 
            'operation_efficiency', 'round_trip_time', 'excavator_cycle_time'
        ];
        
        excavationTimeFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.calculateExcavationTime();
                });
            }
        });
        
        const newImportMaterialField = document.getElementById('new_import_material');
        if (newImportMaterialField) {
            newImportMaterialField.addEventListener('change', () => {
                this.calculateImportVolume();
            });
        }
        
        // Add excavation item functionality
        const addExcavationItemBtn = document.getElementById('add-excavation-item');
        if (addExcavationItemBtn) {
            addExcavationItemBtn.addEventListener('click', () => {
                this.addExcavationItem();
            });
        }
        
        // Add import material functionality
        const addImportBtn = document.getElementById('add-import-material');
        if (addImportBtn) {
            addImportBtn.addEventListener('click', () => {
                const material = document.getElementById('new_import_material').value;
                const area = parseFloat(document.getElementById('new_import_area').value) || 0;
                // Robustly parse areaBreakdown
                const areaInput = document.getElementById('new_import_area');
                let areaBreakdown = [];
                if (areaInput && areaInput.dataset && areaInput.dataset.breakdown) {
                    try { areaBreakdown = JSON.parse(areaInput.dataset.breakdown); } catch(e) { areaBreakdown = []; }
                }
                const depth = parseFloat(document.getElementById('new_import_depth').value) || 0;
                let volume = parseFloat(document.getElementById('new_import_volume').value) || 0;
                const density = parseFloat(document.getElementById('new_import_density').value) || window.app.getMaterialDensity(material);
                const costPerTonne = parseFloat(document.getElementById('new_import_cost_per_tonne').value) || 30;
                const machineHours = parseFloat(document.getElementById('new_import_machine_hours').value) || 0;
                const compactionPercent = parseFloat(document.getElementById('new_import_compaction').value) || window.app.getMaterialCompactionFactor(material);
                const compactionFactor = 1 + (compactionPercent / 100);
                // Validation: require (area+depth) or volume
                if ((!area || !depth) && !volume) {
                    window.app.showNotification('Please enter area and depth, or volume.', 'error');
                    return;
                }
                // Always recalculate loose volume for all materials using compaction factor
                let compactedVolume = area && depth ? area * (depth / 1000) : 0;
                let looseVolume = compactedVolume * compactionFactor;
                if (volume) {
                    looseVolume = volume;
                    compactedVolume = volume / compactionFactor;
                }
                volume = looseVolume;
                const importItem = {
                    id: Date.now(),
                    material: material,
                    area: area,
                    areaBreakdown,
                    depth: depth,
                    volume: volume,
                    density: density,
                    costPerTonne: costPerTonne,
                    machineHours: machineHours,
                    compactedVolume: compactedVolume,
                    looseVolume: looseVolume,
                    compactionPercent: compactionPercent
                };
                window.app.importMaterials.push(importItem);
                window.app.addImportMaterialToUI(importItem);
                document.getElementById('new_import_material').value = '';
                document.getElementById('new_import_area').value = '';
                document.getElementById('new_import_area').dataset.breakdown = '';
                document.getElementById('import-area-breakdown').innerHTML = '';
                document.getElementById('new_import_depth').value = '';
                document.getElementById('new_import_volume').value = '';
                document.getElementById('new_import_density').value = '';
                document.getElementById('new_import_cost_per_tonne').value = '30';
                document.getElementById('new_import_machine_hours').value = '0';
            });
        }
        // --- SHOW AREA BREAKDOWN IN ITEM CARDS ---
        // Update renderExcavationItemsCards and addImportMaterialToUI to show breakdown if present
        const renderBreakdownHTML = function(entries) {
            if (!entries || !entries.length) return '';
            return '<ul>' + entries.map(e => `<li>${e.label ? e.label+': ' : ''}${e.length}m × ${e.width}m = <strong>${(e.length*e.width).toFixed(2)} m²</strong></li>`).join('') + '</ul>';
        };
        // ... existing code ...
    }

    updateEmulsionDefaults() {
        const emulsionTypeField = document.getElementById('emulsion_type');
        const coverageField = document.getElementById('emulsion_coverage');
        const costField = document.getElementById('emulsion_cost_per_litre');
        
        if (!emulsionTypeField || !coverageField || !costField) return;
        
        const selectedType = emulsionTypeField.value;
        
        // Emulsion type defaults
        const emulsionDefaults = {
            'C170K': { coverage: 0.65, cost: 1.50 },
            'C320K': { coverage: 0.65, cost: 1.45 },
            'C600K': { coverage: 0.65, cost: 1.40 },
            'A170K': { coverage: 0.65, cost: 1.35 },
            'A320K': { coverage: 0.65, cost: 1.30 },
            'A600K': { coverage: 0.65, cost: 1.25 },
            'Custom': { coverage: 0.65, cost: 1.50 } // Default for custom
        };
        
        if (selectedType && emulsionDefaults[selectedType]) {
            const defaults = emulsionDefaults[selectedType];
            coverageField.value = defaults.coverage;
            costField.value = defaults.cost;
            
            // Trigger calculation
            if (this.isFormValid()) {
                this.calculateQuote(true);
            }
        }
    }

    updateImportMaterialDensity() {
        const materialField = document.getElementById('new_import_material');
        const densityField = document.getElementById('new_import_density');
        const compactionField = document.getElementById('new_import_compaction');
        
        if (!materialField || !densityField) return;
        
        const selectedMaterial = materialField.value;
        const density = this.getMaterialDensity(selectedMaterial);
        const compaction = this.getMaterialCompactionFactor(selectedMaterial);
        
        if (density > 0) {
            densityField.value = density;
        }
        if (compactionField && compaction >= 0) {
            compactionField.value = compaction;
        }
    }

    updateExcavationMaterialDensity() {
        const materialField = document.getElementById('new_excavation_material');
        const densityField = document.getElementById('new_excavation_density');
        const compactionField = document.getElementById('new_excavation_compaction');
        
        if (!materialField || !densityField) return;
        
        const selectedMaterial = materialField.value;
        const density = this.getMaterialDensity(selectedMaterial);
        const compaction = this.getMaterialCompactionFactor(selectedMaterial);
        
        if (density > 0) {
            densityField.value = density;
        }
        if (compactionField && compaction >= 0) {
            compactionField.value = compaction;
        }
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
        // All fields are optional for calculation now
        return true;
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
                // Check for readonly param in URL
                const urlParams = new URLSearchParams(window.location.search);
                const isReadOnly = urlParams.get('readonly') === 'true';
                const isEditMode = !isReadOnly && quote._isEditMode !== false; // Default to edit mode unless readonly
                // Remove the edit mode flag from the quote data
                const { _isEditMode, ...cleanQuoteData } = quote;
                this.loadQuoteData(cleanQuoteData);
                localStorage.removeItem('quoteToLoad');
                if (isEditMode) {
                    this.setEditMode(true, cleanQuoteData.projectInfo?.quoteNumber || 'Unknown Quote');
                    this.showNotification('Quote loaded for editing!', 'success');
                } else {
                    this.setEditMode(true, cleanQuoteData.projectInfo?.quoteNumber || 'Unknown Quote');
                    // Hide the form, show only the results panel
                    const formContainer = document.querySelector('.form-container');
                    const resultsPanel = document.getElementById('results-panel');
                    if (formContainer) formContainer.classList.add('hidden');
                    if (resultsPanel) resultsPanel.classList.remove('hidden');
                    if (resultsPanel) resultsPanel.scrollIntoView({ behavior: 'smooth' });
                    // Optionally, disable Save/Export buttons in view mode
                    const saveBtn = document.getElementById('save-quote');
                    if (saveBtn) saveBtn.disabled = true;
                    const saveFromResultsBtn = document.getElementById('save-quote-from-results');
                    if (saveFromResultsBtn) saveFromResultsBtn.disabled = true;
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
        this.isViewMode = false;
        const editIndicator = document.getElementById('edit-mode-indicator');
        const saveButton = document.getElementById('save-quote');
        const newQuoteButton = document.getElementById('new-quote');
        const form = document.getElementById('quote-form');
        const formContainer = document.querySelector('.form-container');
        const resultsPanel = document.getElementById('results-panel');
        if (isEditing) {
            editIndicator.classList.remove('hidden');
            editIndicator.querySelector('span').textContent = `Editing: ${quoteNumber}`;
            saveButton.innerHTML = '<i class="fas fa-save"></i> Update Quote';
            newQuoteButton.style.display = 'inline-flex';
            // Enable form editing
            this.setFormReadOnly(false);
            // Show form, hide results panel if needed
            if (formContainer) formContainer.classList.remove('hidden');
            if (resultsPanel) resultsPanel.classList.add('hidden');
        } else {
            editIndicator.classList.add('hidden');
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save Quote';
            newQuoteButton.style.display = 'inline-flex';
            // Enable form editing for new quotes
            this.setFormReadOnly(false);
            // Show form, hide results panel if needed
            if (formContainer) formContainer.classList.remove('hidden');
            if (resultsPanel) resultsPanel.classList.add('hidden');
        }
    }

    setViewMode() {
        this.isViewMode = true;
        // Hide the form, show only the results panel
        const formContainer = document.querySelector('.form-container');
        const resultsPanel = document.getElementById('results-panel');
        if (formContainer) formContainer.classList.add('hidden');
        if (resultsPanel) resultsPanel.classList.remove('hidden');
        // Also scroll to results for clarity
        if (resultsPanel) resultsPanel.scrollIntoView({ behavior: 'smooth' });
        // Optionally, disable Save/Export buttons in view mode
        const saveBtn = document.getElementById('save-quote');
        if (saveBtn) saveBtn.disabled = true;
        const saveFromResultsBtn = document.getElementById('save-quote-from-results');
        if (saveFromResultsBtn) saveFromResultsBtn.disabled = true;
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
        
        // Clear excavation items
        this.excavationItems = [];
        this.refreshExcavationItems();
        
        // Clear import materials
        this.importMaterials = [];
        this.refreshImportMaterials();
        
        // Reset default values
        this.loadDefaultValues();
        
        // Update hours label after clearing
        this.updateHoursLabel();
        
        // Clear any stored calculations
        this.currentCalculations = null;
        
        // Clear current quote
        this.currentQuote = null;
        // Disable Save button after clearing
        const saveBtn = document.getElementById('save-quote');
        if (saveBtn) saveBtn.disabled = true;
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
        
        // Add excavation items
        data.excavationItems = this.excavationItems;
        
        // Add import materials
        data.importMaterials = this.importMaterials;
        
        // Add labor roles (fix for missing labor roles in save/load)
        data.laborRoles = this.laborRoles;
        
        return data;
    }

    addOtherLabor() {
        const typeInput = document.getElementById('other_labor_type');
        const pricingMethod = document.getElementById('other_labor_pricing_method').value;
        const hoursInput = document.getElementById('other_labor_est_hours');
        const costInput = document.getElementById('other_labor_cost_per_hour');
        const fixedInput = document.getElementById('other_labor_fixed_amount');
        let laborItem = { id: Date.now(), type: typeInput.value.trim(), pricingMethod };
        if (!laborItem.type) {
            this.showNotification('Please enter a labor type.', 'error');
            return;
        }
        if (pricingMethod === 'hourly') {
            const hours = parseFloat(hoursInput.value);
            const cost = parseFloat(costInput.value);
            if (hours <= 0 || cost < 0) {
                this.showNotification('Please enter valid hours and hourly rate.', 'error');
                return;
            }
            laborItem.hours = hours;
            laborItem.cost = cost;
    } else {
            const fixedAmount = parseFloat(fixedInput.value);
            if (fixedAmount <= 0) {
                this.showNotification('Please enter a valid fixed amount.', 'error');
                return;
            }
            laborItem.fixedAmount = fixedAmount;
        }
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
        let laborCost = 0;
        let details = '';
        if (laborItem.pricingMethod === 'hourly') {
            laborCost = laborItem.hours * laborItem.cost;
            details = `${laborItem.hours} hrs × $${laborItem.cost}/hr`;
        } else {
            laborCost = laborItem.fixedAmount;
            details = `Fixed: $${laborItem.fixedAmount}`;
        }
        laborItemElement.innerHTML = `
            <div class="labor-item-info">
                <div class="font-medium">${laborItem.type}</div>
                <div class="text-sm text-secondary">
                    ${details}
                </div>
                <div class="text-sm font-medium text-success">$${laborCost.toFixed(2)}</div>
            </div>
            <div class="labor-item-actions">
                <button type="button" class="btn btn-secondary btn-icon edit-labor-item" data-id="${laborItem.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-danger btn-icon delete-labor-item" data-id="${laborItem.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        laborList.appendChild(laborItemElement);
        // Add event listeners
        const deleteBtn = laborItemElement.querySelector('.delete-labor-item');
        deleteBtn.addEventListener('click', () => {
            this.deleteLaborItem(laborItem.id);
        });
        const editBtn = laborItemElement.querySelector('.edit-labor-item');
        editBtn.addEventListener('click', () => {
            this.editLaborItem(laborItem.id);
        });
    }

    editLaborItem(id) {
        const laborItem = this.otherLaborItems.find(item => item.id === id);
        if (!laborItem) return;

        // Store the editing state
        this.editingLaborItemId = id;

        // Populate the form with the item's data
        document.getElementById('other_labor_type').value = laborItem.type;
        document.getElementById('other_labor_pricing_method').value = laborItem.pricingMethod;
        
        if (laborItem.pricingMethod === 'hourly') {
            document.getElementById('other_labor_est_hours').value = laborItem.hours;
            document.getElementById('other_labor_cost_per_hour').value = laborItem.cost;
        } else {
            document.getElementById('other_labor_fixed_amount').value = laborItem.fixedAmount;
        }
        
        this.updateOtherLaborPricingMethodUI();

        // Change the add button to save button
        const addBtn = document.getElementById('add-labor-btn');
        const saveBtn = document.getElementById('save-labor-edit-btn');
        const cancelBtn = document.getElementById('cancel-labor-edit-btn');
        
        if (addBtn) addBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'inline-block';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        this.showNotification('Editing labor item. Make changes and click "Save Changes" or "Cancel".', 'info');
    }

    saveLaborItemEdit() {
        if (!this.editingLaborItemId) return;

        const typeInput = document.getElementById('other_labor_type');
        const pricingMethod = document.getElementById('other_labor_pricing_method').value;
        const hoursInput = document.getElementById('other_labor_est_hours');
        const costInput = document.getElementById('other_labor_cost_per_hour');
        const fixedInput = document.getElementById('other_labor_fixed_amount');

        let laborItem = { 
            id: this.editingLaborItemId, 
            type: typeInput.value.trim(), 
            pricingMethod 
        };

        if (!laborItem.type) {
            this.showNotification('Please enter a labor type.', 'error');
            return;
        }

        if (pricingMethod === 'hourly') {
            const hours = parseFloat(hoursInput.value);
            const cost = parseFloat(costInput.value);
            if (hours <= 0 || cost < 0) {
                this.showNotification('Please enter valid hours and hourly rate.', 'error');
                return;
            }
            laborItem.hours = hours;
            laborItem.cost = cost;
        } else {
            const fixedAmount = parseFloat(fixedInput.value);
            if (fixedAmount <= 0) {
                this.showNotification('Please enter a valid fixed amount.', 'error');
                return;
            }
            laborItem.fixedAmount = fixedAmount;
        }

        // Update the item in the array
        const index = this.otherLaborItems.findIndex(item => item.id === this.editingLaborItemId);
        if (index > -1) {
            this.otherLaborItems[index] = laborItem;
        }

        // Reset the form and UI
        this.resetLaborFormAndEditState();
        this.refreshLaborList();
        this.calculateQuote(true);
        this.showNotification('Labor item updated successfully!', 'success');
    }

    resetLaborFormAndEditState() {
        this.editingLaborItemId = null;
        this.clearLaborForm();
        
        // Reset button states
        const addBtn = document.getElementById('add-labor-btn');
        const saveBtn = document.getElementById('save-labor-edit-btn');
        const cancelBtn = document.getElementById('cancel-labor-edit-btn');
        
        if (addBtn) addBtn.style.display = 'inline-block';
        if (saveBtn) saveBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
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
        document.getElementById('other_labor_pricing_method').value = 'hourly';
        document.getElementById('other_labor_est_hours').value = '0';
        document.getElementById('other_labor_cost_per_hour').value = '0';
        document.getElementById('other_labor_fixed_amount').value = '0';
        this.updateOtherLaborPricingMethodUI();
    }

    calculateQuote(silent = false) {
        if (this.isViewMode) return; // Block calculation in view mode
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
                // Enable Save button after successful calculation
                const saveBtn = document.getElementById('save-quote');
                if (saveBtn) saveBtn.disabled = false;
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
        
        // Foundation data removed - now handled in excavation/import section
        
        const workersRequired = parseFloat(formData['required-workers']) || 2;
        const timeToComplete = parseFloat(formData['time-to-complete-job']) || 2;
        const hourlyRate = parseFloat(formData.hourly_rate) || 30;
        const superannuation = parseFloat(formData.superannuation) || 11;
        const workersCompensation = parseFloat(formData.workers_compensation) || 2;
        const otherLaborCosts = parseFloat(formData['other-labor-costs']) || 2;
        
        const profitMargin = parseFloat(formData['profit-margin']) || 40;
        const discountPercent = parseFloat(formData['discount']) || 0;
        const taxRate = parseFloat(formData.tax_rate) || 10;
        
        // Calculate asphalt costs from import materials
        let asphaltCost = 0;
        let asphaltWeight = 0;
        let asphaltTruckLoads = 0;
        let totalArea = 0;
        
        // Find asphalt in import materials
        this.importMaterials.forEach(item => {
            if (item.material === 'Asphalt') {
                const density = item.density || this.getMaterialDensity(item.material);
                const weight = item.volume * density;
                asphaltCost += weight * item.costPerTonne;
                asphaltWeight += weight;
                asphaltTruckLoads += weight / 8.5;
                totalArea += item.area;
            }
        });
        
        // If no asphalt found in imports, use default values
        if (asphaltWeight === 0) {
            const area = parseFloat(formData.area) || 0;
            const depth = parseFloat(formData.depth) || 0;
            const density = parseFloat(formData.asphalt_density) || 2400;
            const costPerTonne = parseFloat(formData.cost_per_tonne) || 190;
            
            const volume = area * (depth / 1000);
            asphaltWeight = (volume * (density / 1000)) * 1.25; // 25% compaction
            asphaltCost = asphaltWeight * costPerTonne;
            asphaltTruckLoads = asphaltWeight / 8.5;
            totalArea = area;
        }
        
        // Foundation costs are now handled in the excavation/import section
        
        // Calculate emulsion
        const emulsionCoverage = parseFloat(formData.emulsion_coverage) || 0.65;
        const emulsionCostPerLitre = parseFloat(formData.emulsion_cost_per_litre) || 1.50;
        const emulsionRequired = totalArea * emulsionCoverage;
        const emulsionCost = emulsionRequired * emulsionCostPerLitre;
        
        // Calculate labor costs (legacy, only if no labor roles)
        let totalLaborCost = 0;
        let totalLaborHours = 0;
        let laborBreakdown = {};
        let adjustedHourlyRate = 0;
        if (this.laborRoles.length === 0) {
            const workersRequired = parseFloat(document.getElementById('required_workers')?.value) || 0;
            const timeToComplete = parseFloat(document.getElementById('time_to_complete_job')?.value) || 0;
            const hourlyRate = parseFloat(document.getElementById('hourly_rate')?.value) || 0;
            const superannuation = parseFloat(document.getElementById('superannuation')?.value) || 0;
            const workersCompensation = parseFloat(document.getElementById('workers_compensation')?.value) || 0;
            const otherLaborCosts = parseFloat(document.getElementById('other_labor_costs')?.value) || 0;
            const jobDuration = parseFloat(document.getElementById('job_duration')?.value) || 0;
            const oncostMultiplier = 1 + (superannuation + workersCompensation + otherLaborCosts) / 100;
            adjustedHourlyRate = hourlyRate * oncostMultiplier;
            if (workersRequired > 0 && timeToComplete > 0) {
                if (jobDuration > 0) {
                    totalLaborHours = workersRequired * timeToComplete * jobDuration;
                } else {
                    totalLaborHours = workersRequired * timeToComplete;
                }
                totalLaborCost = totalLaborHours * adjustedHourlyRate;
                laborBreakdown = { type: 'Base', hours: totalLaborHours, rate: adjustedHourlyRate, cost: totalLaborCost };
            } else {
                totalLaborCost = 0;
                totalLaborHours = 0;
                laborBreakdown = { type: 'None', hours: 0, rate: 0, cost: 0 };
            }
        }
        
        // Calculate total labor hours based on job duration
        const jobDuration = parseFloat(formData['job-duration']) || 0;
        
        if (jobDuration > 0) {
            // If job duration is specified, calculate: workers × hours per day × job duration
            totalLaborHours = workersRequired * timeToComplete * jobDuration;
        } else {
            // Fall back to original calculation: workers × total hours
            totalLaborHours = workersRequired * timeToComplete;
        }
        
        // --- Penalty/Overtime/After Hours Logic ---
        // Read checkboxes
        const afterHours = document.getElementById('after_hours')?.checked;
        const saturday = document.getElementById('saturday')?.checked;
        const sunday = document.getElementById('sunday')?.checked;
        const publicHoliday = document.getElementById('public_holiday')?.checked;

        // Penalty rates
        const RATES = {
            base: 1,
            afterHours: 1.5,
            saturday: 1.5,
            sunday: 2,
            publicHoliday: 2.5,
            overtime: 2
        };

        let baseHours = 0, overtimeHours = 0, penaltyHours = 0;
        let baseCost = 0, overtimeCost = 0, penaltyCost = 0;
        let laborRateUsed = RATES.base;
        let laborCost = 0;
        let breakdown = {};

        if (publicHoliday) {
            // All hours at 2.5x
            penaltyHours = totalLaborHours;
            penaltyCost = penaltyHours * adjustedHourlyRate * RATES.publicHoliday;
            laborRateUsed = RATES.publicHoliday;
            breakdown = { type: 'Public Holiday', hours: penaltyHours, rate: RATES.publicHoliday, cost: penaltyCost };
            laborCost = penaltyCost;
        } else if (sunday) {
            penaltyHours = totalLaborHours;
            penaltyCost = penaltyHours * adjustedHourlyRate * RATES.sunday;
            laborRateUsed = RATES.sunday;
            breakdown = { type: 'Sunday', hours: penaltyHours, rate: RATES.sunday, cost: penaltyCost };
            laborCost = penaltyCost;
        } else if (saturday) {
            penaltyHours = totalLaborHours;
            penaltyCost = penaltyHours * adjustedHourlyRate * RATES.saturday;
            laborRateUsed = RATES.saturday;
            breakdown = { type: 'Saturday', hours: penaltyHours, rate: RATES.saturday, cost: penaltyCost };
            laborCost = penaltyCost;
        } else if (jobDuration > 0 && timeToComplete > 7.6) {
            // Overtime logic: first 7.6 hours per day at base/after hours, rest at 2x
            const days = jobDuration;
            const workers = workersRequired;
            const dailyBaseHours = 7.6;
            const dailyOvertimeHours = timeToComplete - 7.6;
            baseHours = workers * dailyBaseHours * days;
            overtimeHours = workers * dailyOvertimeHours * days;
            let baseRate = afterHours ? RATES.afterHours : RATES.base;
            baseCost = baseHours * adjustedHourlyRate * baseRate;
            overtimeCost = overtimeHours * adjustedHourlyRate * RATES.overtime;
            laborCost = baseCost + overtimeCost;
            breakdown = {
                type: afterHours ? 'Base (After Hours) + Overtime' : 'Base + Overtime',
                baseHours, baseRate, baseCost,
                overtimeHours, overtimeRate: RATES.overtime, overtimeCost
            };
        } else if (afterHours) {
            penaltyHours = totalLaborHours;
            penaltyCost = penaltyHours * adjustedHourlyRate * RATES.afterHours;
            laborRateUsed = RATES.afterHours;
            breakdown = { type: 'After Hours', hours: penaltyHours, rate: RATES.afterHours, cost: penaltyCost };
            laborCost = penaltyCost;
        } else {
            baseHours = totalLaborHours;
            baseCost = baseHours * adjustedHourlyRate;
            laborCost = baseCost;
            breakdown = { type: 'Base', hours: baseHours, rate: RATES.base, cost: baseCost };
        }
        totalLaborCost = laborCost;
        
        // Calculate other labor costs
    let totalOtherLaborCost = 0;
        this.otherLaborItems.forEach(item => {
            let laborCost = 0;
            if (item.pricingMethod === 'hourly') {
                laborCost = item.hours * item.cost;
            } else {
                laborCost = item.fixedAmount;
            }
      totalOtherLaborCost += laborCost;
        });
        
        // Calculate equipment depreciation
        const totalDays = timeToComplete / 10;
        const equipmentDepreciation = this.calculateEquipmentDepreciation(totalDays);
        
        // Calculate consumables
        const consumablesCost = this.calculateConsumablesCost();
        
        // Calculate traffic control costs
        const trafficControlCost = this.calculateTrafficControlCost();
        
        // --- Refactored Excavation Calculation ---
        // Calculate per-item and per-equipment costs
        let excavationSummary = [];
        let equipmentHours = {};
        let equipmentCosts = {};
        let disposalBreakdown = {};
        let totalExcavationCost = 0;
        let totalDisposalCost = 0;
        let totalThirdPartyCost = 0;
        let totalVolume = 0;
        let totalWeight = 0;
        // Per-item calculations
        this.excavationItemsV2.forEach(item => {
            const density = this.getMaterialDensity(item.material);
            const volume = item.area * (item.depth / 1000);
            const weight = volume * density;
            totalVolume += volume;
            totalWeight += weight;
            // Equipment assignment
            let eq = this.excavationEquipment.find(e => e.id == item.equipmentId);
            let machineCost = 0;
            if (!item.isThirdParty && eq) {
                equipmentHours[eq.type] = (equipmentHours[eq.type] || 0) + item.machineHours;
                machineCost = item.machineHours * eq.hourlyRate;
                equipmentCosts[eq.type] = (equipmentCosts[eq.type] || 0) + machineCost;
                totalExcavationCost += machineCost;
            }
            // Disposal
            let disposalCost = 0;
            if (item.disposal !== 'Reuse') {
                disposalCost = weight * item.tipFee;
                disposalBreakdown[item.disposal] = (disposalBreakdown[item.disposal] || 0) + disposalCost;
                totalDisposalCost += disposalCost;
            }
            // Summary per item
            excavationSummary.push({
                desc: item.desc,
                material: item.material,
                area: item.area,
                depth: item.depth,
                volume,
                weight,
                equipment: eq ? eq.type : (item.isThirdParty ? '3rd Party' : 'None'),
                machineHours: item.machineHours,
                machineCost,
                disposal: item.disposal,
                disposalCost,
                isThirdParty: item.isThirdParty
            });
        });
        // Third-party delivery/removal
        this.thirdPartyExcavationItems.forEach(item => {
            // Assume user enters total tonnes for 3rd party items in notes or elsewhere
            // For now, just sum cost per tonne as a charge
            totalThirdPartyCost += item.costPerTonne; // (could be extended to multiply by qty)
        });
        // Total cost
        const totalExcavationSectionCost = totalExcavationCost + totalDisposalCost + totalThirdPartyCost;
        // --- Render summary ---
        this.renderExcavationSummary({
            excavationSummary,
            equipmentHours,
            equipmentCosts,
            disposalBreakdown,
            totalExcavationCost,
            totalDisposalCost,
            totalThirdPartyCost,
            totalExcavationSectionCost,
            totalVolume,
            totalWeight
        });
        
        // Calculate standard labor cost from roles
        let totalLaborCostFromRoles = 0;
        let totalLaborHoursFromRoles = 0;
        let laborRolesBreakdown = [];
        const stdSuperannuation = parseFloat(document.getElementById('superannuation').value) || 0;
        const stdWorkersComp = parseFloat(document.getElementById('workers_compensation').value) || 0;
        const stdOtherLaborCosts = parseFloat(document.getElementById('other_labor_costs').value) || 0;
        const oncostMultiplier = 1 + (stdSuperannuation + stdWorkersComp + stdOtherLaborCosts) / 100;
        this.laborRoles.forEach(role => {
            // Find highest penalty multiplier
            let multiplier = 1;
            let penaltyLabel = '';
            if (role.publicHoliday) {
                multiplier = 2.5;
                penaltyLabel = 'Public Holiday (2.5×)';
            } else if (role.sunday) {
                multiplier = 2;
                penaltyLabel = 'Sunday (2×)';
            } else if (role.saturday) {
                multiplier = 1.5;
                penaltyLabel = 'Saturday (1.5×)';
            } else if (role.afterHours) {
                multiplier = 1.5;
                penaltyLabel = 'Overnight/After Hours (1.5×)';
            }
            const totalHours = role.workers * role.hours * role.days;
            const baseCost = totalHours * role.rate;
            const penaltyCost = baseCost * multiplier;
            const totalCost = penaltyCost * oncostMultiplier;
            totalLaborCostFromRoles += totalCost;
            totalLaborHoursFromRoles += totalHours;
            laborRolesBreakdown.push({
                ...role,
                totalHours,
                baseCost,
                penaltyMultiplier: multiplier,
                penaltyCost,
                oncostMultiplier,
                totalCost,
                penaltyLabel
            });
        });
        
        // Calculate totals
        const totalCosts = totalLaborCost + totalLaborCostFromRoles + asphaltCost + totalOtherLaborCost + 
                          equipmentDepreciation + consumablesCost + emulsionCost + trafficControlCost + totalExcavationSectionCost;
        
        // Calculate quote (subtotal before discount) using markup
        const quote = totalCosts / (1 - profitMargin / 100);
        // Apply discount
        const discountAmount = quote * (discountPercent / 100);
        const discountedSubtotal = quote - discountAmount;
        // Apply GST
        const gstAmount = discountedSubtotal * (taxRate / 100);
        const totalWithTax = discountedSubtotal + gstAmount;
        
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
            area: totalArea,
            asphaltWeight: asphaltWeight,
            asphaltCost: asphaltCost,
            asphaltTruckLoads: asphaltTruckLoads,

            emulsionRequired: emulsionRequired,
            emulsionCost: emulsionCost,
            emulsionCoverage: emulsionCoverage,
            totalLaborCost: totalLaborCost,
            totalLaborHours: totalLaborHours,
            jobDuration: jobDuration,
            laborBreakdown: breakdown,
            totalOtherLaborCost: totalOtherLaborCost,
            equipmentDepreciation: equipmentDepreciation,
            consumablesCost: consumablesCost,
            trafficControlCost: trafficControlCost,
            excavationCost: totalExcavationSectionCost,
            excavationCostData: {
                total: totalExcavationSectionCost,
                breakdown: {
                    machineCost: totalExcavationCost,
                    disposalCost: totalDisposalCost,
                    thirdPartyCost: totalThirdPartyCost,
                    equipmentCosts,
                    disposalBreakdown
                },
                items: excavationSummary
            },
            totalCosts: totalCosts,
            quote: quote,
            discountPercent: discountPercent,
            discountAmount: discountAmount,
            discountedSubtotal: discountedSubtotal,
            gstAmount: gstAmount,
            totalWithTax: totalWithTax,
            costPerSquareMeter: totalCosts / area,
            quotePerSquareMeter: totalWithTax / area,
            profitPerSquareMeter: area > 0 ? (discountedSubtotal - totalCosts) / area : null,
            
            // Dates
            currentDate: new Date().toLocaleDateString(),
            validUntil: new Date(Date.now() + (parseInt(formData['valid-for']) || 30) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            
            // Excavation details
            excavationType: formData['excavation-type'] || '',
            excavationMachine: formData['excavation-machine'] || '',
            
            // Notes
            notes: formData.project_notes || '',
            laborRolesBreakdown: laborRolesBreakdown,
            totalLaborCostFromRoles: totalLaborCostFromRoles,
            totalLaborHoursFromRoles: totalLaborHoursFromRoles,
            profit: discountedSubtotal - totalCosts,
        };
    }

    renderExcavationSummary(summary) {
        const container = document.getElementById('excavation-summary');
        const content = document.getElementById('excavation-summary-content');
        if (!container || !content) return;
        container.classList.remove('hidden');
        let html = '';
        // Per-item summary
        html += '<strong>Items:</strong><ul>';
        summary.excavationSummary.forEach(item => {
            html += `<li>${item.desc} (${item.material}, ${item.area} m² × ${item.depth}mm, ${item.weight.toFixed(2)} t) - Equipment: ${item.equipment}, Machine Hours: ${item.machineHours}, Disposal: ${item.disposal} ($${item.disposalCost.toFixed(2)})</li>`;
        });
        html += '</ul>';
        // Equipment hours/costs
        html += '<strong>Equipment Hours/Costs:</strong><ul>';
        Object.keys(summary.equipmentHours).forEach(eq => {
            html += `<li>${eq}: ${summary.equipmentHours[eq].toFixed(2)} hrs, $${(summary.equipmentCosts[eq] || 0).toFixed(2)}</li>`;
        });
        html += '</ul>';
        // Disposal breakdown
        html += '<strong>Disposal Breakdown:</strong><ul>';
        Object.keys(summary.disposalBreakdown).forEach(type => {
            html += `<li>${type}: $${summary.disposalBreakdown[type].toFixed(2)}</li>`;
        });
        html += '</ul>';
        // Third-party
        if (summary.totalThirdPartyCost > 0) {
            html += `<strong>3rd Party Charges:</strong> $${summary.totalThirdPartyCost.toFixed(2)}`;
        }
        // Totals
        html += `<div class="mt-2"><strong>Total Excavation Cost:</strong> $${summary.totalExcavationSectionCost.toFixed(2)}</div>`;
        content.innerHTML = html;
    }

    calculateEquipmentDepreciation(totalDays) {
        const equipment = {
            compactor_plate: { count: parseFloat(document.getElementById('compactor_plate')?.value || 0) || 0, cost: 3000, residual: 200, life: 3 },
            rammer_compactor: { count: parseFloat(document.getElementById('rammer_compactor')?.value || 0) || 0, cost: 1500, residual: 200, life: 3 },
            leaf_blower: { count: parseFloat(document.getElementById('leaf_blower')?.value || 0) || 0, cost: 500, residual: 150, life: 3 },
            concrete_cutter: { count: parseFloat(document.getElementById('concrete_cutter')?.value || 0) || 0, cost: 500, residual: 150, life: 3 },
            skidsteer: { count: parseFloat(document.getElementById('skidsteer')?.value || 0) || 0, cost: 40000, residual: 10000, life: 10 },
            mr_truck: { count: parseFloat(document.getElementById('mr_truck')?.value || 0) || 0, cost: 40000, residual: 10000, life: 10 },
            hr_truck: { count: parseFloat(document.getElementById('hr_truck')?.value || 0) || 0, cost: 50000, residual: 20000, life: 10 },
            trailer: { count: parseFloat(document.getElementById('trailer')?.value || 0) || 0, cost: 3500, residual: 1000, life: 10 },
            car: { count: parseFloat(document.getElementById('car')?.value || 0) || 0, cost: 35000, residual: 1000, life: 10 },
            _1t_roller: { count: parseFloat(document.getElementById('_1t_roller')?.value || 0) || 0, cost: 25000, residual: 5000, life: 5 },
            _2t_roller: { count: parseFloat(document.getElementById('_2t_roller')?.value || 0) || 0, cost: 35000, residual: 10000, life: 5 }
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

    calculateTrafficControlCost() {
        const trafficControl = document.getElementById('traffic_control').value;
        
        if (trafficControl !== 'Yes') {
            return 0;
        }
        
        const hours = parseFloat(document.getElementById('traffic_control_hours_required').value) || 0;
        const workers = parseFloat(document.getElementById('traffic_control_workers_required').value) || 0;
        const hourlyRate = parseFloat(document.getElementById('traffic_control_hourly_rate').value) || 45;
        const complexity = document.getElementById('traffic_control_complexity').value;
        const equipment = document.getElementById('traffic_control_equipment').value;
        const permits = document.getElementById('traffic_control_permits').value;
        
        // Base cost calculation
        let baseCost = hours * workers * hourlyRate;
        
        // Complexity multiplier
        const complexityMultipliers = {
            'Low': 1.0,
            'Medium': 1.25,
            'High': 1.5,
            'Critical': 2.0
        };
        
        const complexityMultiplier = complexityMultipliers[complexity] || 1.0;
        baseCost *= complexityMultiplier;
        
        // Equipment costs
        let equipmentCost = 0;
        if (equipment) {
            const equipmentCosts = {
                'Stop/Slow Signs': 50,
                'Barriers & Cones': 100,
                'Arrow Boards': 200,
                'Portable Traffic Lights': 500,
                'Safety Vests & PPE': 75,
                'Communication Radios': 150,
                'All Equipment': 800
            };
            
            // Handle multiple equipment selections
            const equipmentList = equipment.split(', ').filter(item => item.trim());
            if (equipmentList.includes('All Equipment')) {
                equipmentCost = 800;
            } else {
                equipmentCost = equipmentList.reduce((total, item) => {
                    return total + (equipmentCosts[item.trim()] || 0);
                }, 0);
            }
        }
        
        // Permit costs
        let permitCost = 0;
        if (permits && permits !== 'No') {
            const permitCosts = {
                'Local Council': 200,
                'State Government': 500,
                'Police Approval': 300,
                'Multiple Permits': 800
            };
            
            // Handle multiple permit selections
            const permitList = permits.split(', ').filter(item => item.trim());
            if (permitList.includes('Multiple Permits')) {
                permitCost = 800;
            } else {
                permitCost = permitList.reduce((total, item) => {
                    return total + (permitCosts[item.trim()] || 0);
                }, 0);
            }
        }
        
        // Weather considerations
        const weather = document.getElementById('traffic_control_weather').value;
        let weatherMultiplier = 1.0;
        if (weather) {
            const weatherList = weather.split(', ').filter(item => item.trim());
            if (weatherList.includes('Multiple')) {
                weatherMultiplier = 1.25;
            } else if (weatherList.includes('Rain') || weatherList.includes('Wind')) {
                weatherMultiplier = 1.15;
            } else if (weatherList.includes('Heat')) {
                weatherMultiplier = 1.1;
            }
        }
        
        const totalCost = (baseCost + equipmentCost + permitCost) * weatherMultiplier;
        
        return totalCost;
    }

    calculateExcavationMaterials() {
        // Calculate total volume from excavation layers instead of using a single depth field
        const excavationAreaEl = document.getElementById('excavation_area');
        const excavationArea = excavationAreaEl ? parseFloat(excavationAreaEl.value) || 0 : 0;
        let totalVolume = 0;
        // Calculate total volume from all excavation layers
        if (this.excavationLayers && Array.isArray(this.excavationLayers)) {
            this.excavationLayers.forEach(layer => {
                const volume = excavationArea * (layer.depth / 1000);
                totalVolume += volume;
            });
        }
        // Set the auto-calculated removal volume
        const removalVolumeEl = document.getElementById('removal_volume');
        if (removalVolumeEl) removalVolumeEl.value = totalVolume.toFixed(2);
        // Calculate removal material weight and truck loads
        const removalMaterialEl = document.getElementById('removal_material');
        const removalMaterial = removalMaterialEl ? removalMaterialEl.value : null;
        if (removalMaterial && totalVolume > 0) {
            const removalDensity = this.getMaterialDensity(removalMaterial);
            const removalWeight = totalVolume * removalDensity;
            const removalTruckLoads = removalWeight / 10; // Assuming 10 tonnes per truck load
            const removalWeightEl = document.getElementById('removal_weight');
            const removalTruckLoadsEl = document.getElementById('removal_truck_loads');
            if (removalWeightEl) removalWeightEl.value = removalWeight.toFixed(2);
            if (removalTruckLoadsEl) removalTruckLoadsEl.value = removalTruckLoads.toFixed(1);
        } else {
            const removalWeightEl = document.getElementById('removal_weight');
            const removalTruckLoadsEl = document.getElementById('removal_truck_loads');
            if (removalWeightEl) removalWeightEl.value = '';
            if (removalTruckLoadsEl) removalTruckLoadsEl.value = '';
        }
    }

    addExcavationItem() {
        const description = document.getElementById('new_excavation_description').value.trim();
        const area = parseFloat(document.getElementById('new_excavation_area').value) || 0;
        const material = document.getElementById('new_excavation_material').value;
        const depth = parseFloat(document.getElementById('new_excavation_depth').value) || 0;
        const density = parseFloat(document.getElementById('new_excavation_density').value) || this.getMaterialDensity(material);
        const machineHours = parseFloat(document.getElementById('new_excavation_machine_hours').value) || 0;
        const disposal = document.getElementById('new_excavation_disposal').value;
        const isDirty = document.getElementById('new_excavation_dirty').checked;
        const tipFee = disposal === 'Reuse' ? 0 : (parseFloat(document.getElementById('new_excavation_tip_fee').value) || 150);
        const compactionPercent = parseFloat(document.getElementById('new_excavation_compaction').value) || this.getMaterialCompactionFactor(material);
        const compactionFactor = 1 + (compactionPercent / 100);

        if (!description || !material || area <= 0 || depth <= 0) {
            this.showNotification('Please fill in description, material, area, and depth.', 'error');
            return;
        }

        // Auto-categorize waste type based on material and dirty checkbox
        let autoDisposalType = disposal;
        if (disposal !== 'Reuse') {
            autoDisposalType = this.getAutoWasteType(material, isDirty);
        }

        // For excavation, compaction factor is used for loose volume (if relevant for export/haulage)
        const compactedVolume = area * (depth / 1000);
        const looseVolume = compactedVolume * compactionFactor;
        const item = {
            id: Date.now(),
            description: description,
            area: area,
            material: material,
            depth: depth,
            density: density,
            machineHours: machineHours,
            disposal: autoDisposalType,
            isDirty: isDirty,
            tipFee: tipFee,
            compactedVolume: compactedVolume,
            looseVolume: looseVolume,
            compactionPercent: compactionPercent
        };

        this.excavationItems.push(item);
        this.addExcavationItemToUI(item);
        this.clearExcavationItemForm();
        this.updateExcavationSummary();
        this.calculateExcavationTime();
        this.calculateQuote(true);
        
        this.showNotification('Excavation item added successfully!', 'success');
    }

    getAutoWasteType(material, isDirty) {
        const wasteTypes = {
            'Concrete': isDirty ? 'Dirty Concrete' : 'Clean Concrete',
            'Asphalt': isDirty ? 'Dirty Asphalt' : 'Clean Asphalt',
            'Topsoil': isDirty ? 'Dirty Fill' : 'Clean Fill',
            'Clay': isDirty ? 'Dirty Fill' : 'Clean Fill',
            'Sand': isDirty ? 'Dirty Fill' : 'Clean Fill',
            'Gravel': isDirty ? 'Dirty Fill' : 'Clean Fill',
            'CBR-45': isDirty ? 'Dirty Fill' : 'Clean Fill',
            'CBR-80': isDirty ? 'Dirty Fill' : 'Clean Fill',
            'Rock': isDirty ? 'Dirty Fill' : 'Clean Fill',
            'Grass/Turf': 'General Waste',
            'Mixed': 'Mixed Waste'
        };
        
        return wasteTypes[material] || 'General Waste';
    }

    addExcavationItemToUI(item) {
        const container = document.getElementById('excavation-items-container');
        
        const itemElement = document.createElement('div');
        itemElement.className = 'excavation-item';
        itemElement.dataset.id = item.id;
        
        const density = item.density || this.getMaterialDensity(item.material);
        const compactedWeight = item.compactedVolume * density;
        const looseWeight = item.looseVolume * density;
        const truckLoads = looseWeight / 10;
        
        const dirtyText = item.isDirty ? ' (Dirty)' : ' (Clean)';
        const disposalText = item.disposal === 'Reuse' 
            ? `Disposal: ${item.disposal} (no cost)`
            : `Disposal: ${item.disposal}${dirtyText} @ $${item.tipFee}/tonne`;
        let compactionNote = '';
        if (item.compactionPercent && item.compactionPercent !== 100) {
            compactionNote = `<div class="text-xs text-secondary">Compacted volume: ${item.compactedVolume.toFixed(3)} m³ × ${density} t/m³ = ${compactedWeight.toFixed(2)} t<br>Loose (exported) volume: ${item.looseVolume.toFixed(3)} m³ × ${density} t/m³ = ${looseWeight.toFixed(2)} t (${item.compactionPercent - 100}% compaction factor applied)</div>`;
        }
        
        itemElement.innerHTML = `
            <div class="excavation-item-info">
                <div class="font-medium">${item.description}</div>
                <div class="text-sm text-secondary">
                    ${item.material} - ${item.area} m² × ${item.depth}mm = ${item.looseVolume.toFixed(2)} m³
                </div>
                <div class="text-sm text-secondary">
                    Weight: ${looseWeight.toFixed(2)} tonnes (${truckLoads.toFixed(1)} loads)
                </div>
                <div class="text-sm text-secondary">
                    Machine Hours: ${item.machineHours} hrs
                </div>
                <div class="text-sm text-secondary">
                    ${disposalText}
                </div>
                ${compactionNote}
            </div>
            <div class="excavation-item-actions">
                <button type="button" class="btn btn-danger btn-icon delete-excavation-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(itemElement);
        
        // Add delete event listener
        const deleteBtn = itemElement.querySelector('.delete-excavation-item');
        deleteBtn.addEventListener('click', () => {
            this.deleteExcavationItem(item.id);
        });
    }

    deleteExcavationItem(id) {
        const index = this.excavationItems.findIndex(item => item.id === id);
        if (index > -1) {
            this.excavationItems.splice(index, 1);
            const element = document.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.remove();
            }
            this.updateExcavationSummary();
            this.calculateExcavationTime();
            this.calculateQuote(true);
            this.showNotification('Excavation item removed.', 'success');
        }
    }

    clearExcavationItemForm() {
        document.getElementById('new_excavation_description').value = '';
        document.getElementById('new_excavation_area').value = '';
        document.getElementById('new_excavation_material').value = '';
        document.getElementById('new_excavation_depth').value = '';
        document.getElementById('new_excavation_density').value = '';
        document.getElementById('new_excavation_machine_hours').value = '';
        document.getElementById('new_excavation_disposal').value = 'General';
        document.getElementById('new_excavation_tip_fee').value = '150';
        document.getElementById('new_excavation_dirty').checked = false;
    }

    updateExcavationSummary() {
        const summary = document.getElementById('excavation-summary');
        const totalItemsElement = document.getElementById('total_excavation_items');
        const totalVolumeElement = document.getElementById('total_excavation_volume');
        const totalWeightElement = document.getElementById('total_excavation_weight');
        const disposalBreakdownElement = document.getElementById('disposal_breakdown');

        if (this.excavationItems.length === 0) {
            summary.classList.add('hidden');
            return;
        }

        summary.classList.remove('hidden');

        let totalVolume = 0;
        let totalWeight = 0;
        const disposalBreakdown = {};

        this.excavationItems.forEach(item => {
            const volume = item.area * (item.depth / 1000);
            totalVolume += volume;
            const density = item.density || this.getMaterialDensity(item.material);
            const weight = volume * density;
            totalWeight += weight;

            // Group by disposal type
            if (!disposalBreakdown[item.disposal]) {
                disposalBreakdown[item.disposal] = {
                    weight: 0,
                    tipFee: item.tipFee
                };
            }
            disposalBreakdown[item.disposal].weight += weight;
        });

        totalItemsElement.textContent = this.excavationItems.length;
        totalVolumeElement.textContent = `${totalVolume.toFixed(2)} m³`;
        totalWeightElement.textContent = `${totalWeight.toFixed(2)} tonnes`;

        // Update disposal breakdown
        let breakdownHTML = '';
        Object.entries(disposalBreakdown).forEach(([disposalType, data]) => {
            if (disposalType === 'Reuse') {
                breakdownHTML += `
                    <div class="flex justify-between">
                        <span>${disposalType}:</span>
                        <span>${data.weight.toFixed(2)} tonnes = $0.00 (no cost)</span>
                    </div>
                `;
            } else {
                const cost = data.weight * data.tipFee;
                breakdownHTML += `
                    <div class="flex justify-between">
                        <span>${disposalType}:</span>
                        <span>${data.weight.toFixed(2)} tonnes = $${cost.toFixed(2)}</span>
                    </div>
                `;
            }
        });
        disposalBreakdownElement.innerHTML = breakdownHTML;
    }

    getMaterialDensity(material) {
        const densities = {
            'Grass/Turf': 0.8,
            'Topsoil': 1.2,
            'Clay': 1.4,
            'Sand': 1.6,
            'Gravel': 1.8,
            'CBR-45': 2.0,
            'CBR-80': 2.1,
            'Concrete': 2.4,
            'Asphalt': 2.4,
            'Rock': 2.7,
            'Mixed': 1.8
        };
        return densities[material] || 1.8;
    }

    calculateExcavationCost() {
        const excavationRequired = document.getElementById('excavation_required').value;
        const excavationMachine = document.getElementById('excavation_machine').value;
        const excavationMachineRate = parseFloat(document.getElementById('excavation_machine_rate').value) || 0;
        
        // Get machine hourly rate
        let machineHourlyRate = excavationMachineRate;
        if (!machineHourlyRate && excavationMachine) {
            machineHourlyRate = this.getMachineHourlyRate(excavationMachine);
        }
        
        // Calculate machine costs from individual excavation items
        let totalMachineCost = 0;
        if (
            excavationRequired === 'Yes' &&
            excavationMachine &&
            machineHourlyRate > 0 &&
            (
                (this.excavationItems && this.excavationItems.some(item => item.machineHours > 0)) ||
                (this.importMaterials && this.importMaterials.some(item => item.machineHours > 0))
            )
        ) {
            this.excavationItems.forEach(item => {
                totalMachineCost += item.machineHours * machineHourlyRate;
            });
            // Add machine costs from import materials
            this.importMaterials.forEach(item => {
                totalMachineCost += item.machineHours * machineHourlyRate;
            });
        }
        // If not required, machine cost is 0
        
        // Calculate material costs for import
        let importMaterialCost = 0;
        this.importMaterials.forEach(item => {
            const density = item.density || this.getMaterialDensity(item.material);
            const weight = item.volume * density;
            importMaterialCost += weight * item.costPerTonne;
        });
        
        // Calculate multi-item disposal costs
        let totalDisposalCost = 0;
        if (this.excavationItems.length > 0) {
            this.excavationItems.forEach(item => {
                const volume = item.area * (item.depth / 1000);
                const density = item.density || this.getMaterialDensity(item.material);
                const weight = volume * density;
                // Tip fees only
                if (item.disposal !== 'Reuse') {
                    totalDisposalCost += weight * item.tipFee;
                }
            });
        }
        const totalCost = totalMachineCost + importMaterialCost + totalDisposalCost;
        return {
            total: totalCost,
            breakdown: {
                machineCost: totalMachineCost,
                importMaterialCost: importMaterialCost,
                disposalCost: totalDisposalCost
            }
        };
    }

    getMachineHourlyRate(machine) {
        const rates = {
            'Mini Excavator (1.5t)': 85,
            'Small Excavator (3t)': 120,
            'Medium Excavator (8t)': 180,
            'Large Excavator (15t)': 250,
            'Large Excavator (20t)': 300,
            'Rock Breaker': 200,
            'Bulldozer': 220,
            'Loader': 150,
            'Dump Truck': 120
        };
        return rates[machine] || 150;
    }

    displayResults(results, formData = null) {
        // Patch in client info and discount if missing and formData is available
        if (formData) {
            if (!results.clientName) {
                results.clientName = `${formData['project-firstname'] || ''} ${formData['project-lastname'] || ''}`.trim();
            }
            if (!results.clientAddress) {
                results.clientAddress = `${formData.project_address || ''}, ${formData.project_city || ''} ${formData.project_postcode || ''}`.trim();
            }
            if (!results.clientEmail) {
                results.clientEmail = formData['project-email'] || '';
            }
            if (!results.clientMobile) {
                results.clientMobile = formData.project_mobile || '';
            }
            if (!results.companyName) {
                results.companyName = formData['project-company'] || '';
            }
            if (!results.companyABN) {
                results.companyABN = formData['project-abn'] || '';
            }
            if (!results.companyPhone) {
                results.companyPhone = formData.project_phone || '';
            }
            if (results.discountPercent === undefined || results.discountPercent === null) {
                results.discountPercent = parseFloat(formData['discount']) || 0;
            }
        }
        const resultContainer = document.getElementById('result');

        // Helper to filter out empty/zero/null values
        const isNonEmpty = v => v !== undefined && v !== null && v !== '' && !(typeof v === 'number' && v === 0);
        const isNonZero = v => typeof v === 'number' && v !== 0;
        const formatMoney = v => `$${parseFloat(v).toFixed(2)}`;
        const formatQty = (qty, unit) => isNonZero(qty) ? `${parseFloat(qty).toFixed(2)}${unit}` : '';

        // --- Quote Summary ---
        let quoteSummaryHTML = `
            <div class="results-container">
                <h3 class="text-lg font-semibold mb-2">Quote Summary</h3>
                <ul class="results-list">
                    <li><span class="highlight">Total Quote:</span> ${formatMoney(results.totalWithTax)}</li>
                    ${isNonZero(results.quote) ? `<li><span class="highlight">Subtotal (before discount):</span> ${formatMoney(results.quote)}</li>` : ''}
                    ${isNonZero(results.discountAmount) ? `<li><span class="highlight">Discount:</span> ${results.discountPercent}% (${formatMoney(results.discountAmount)})</li>` : ''}
                    ${isNonZero(results.gstAmount) ? `<li><span class="highlight">GST:</span> ${formatMoney(results.gstAmount)}</li>` : ''}
                    ${isNonZero(results.discountedSubtotal) ? `<li><span class="highlight">Subtotal after Discount:</span> ${formatMoney(results.discountedSubtotal)}</li>` : ''}
                    ${isNonZero(results.totalCosts) ? `<li><span class="highlight">Total Costs:</span> ${formatMoney(results.totalCosts)}</li>` : ''}
                    ${isNonZero(results.profit) ? `<li><span class="highlight">Profit:</span> ${formatMoney(results.profit)}</li>` : ''}
                    ${isNonZero(results.profitPerSquareMeter) ? `<li><span class="highlight">Profit per m²:</span> ${formatMoney(results.profitPerSquareMeter)}</li>` : ''}
                    ${(results.discountedSubtotal > 0 && isNonZero(results.profit)) ? `<li><span class="highlight">Profit Margin:</span> ${((results.profit / results.discountedSubtotal) * 100).toFixed(1)}%</li>` : ''}
                </ul>
            </div>
        `;

        // --- Client Information ---
        let clientInfoHTML = '';
        const clientFields = [
            { label: 'Name', value: results.clientName },
            { label: 'Address', value: results.clientAddress },
            { label: 'Email', value: results.clientEmail },
            { label: 'Mobile', value: results.clientMobile },
            { label: 'Company', value: results.companyName },
            { label: 'ABN', value: results.companyABN },
            { label: 'Phone', value: results.companyPhone }
        ];
        const clientRows = clientFields.filter(f => isNonEmpty(f.value)).map(f => `<li><span class="highlight">${f.label}:</span> ${f.value}</li>`).join('');
        if (clientRows) {
            clientInfoHTML = `
                <div class="results-container">
                    <h3>Client Information</h3>
                    <ul class="results-list">${clientRows}</ul>
                </div>
            `;
        }

        // --- Project Details ---
        let projectDetailsHTML = '';
        const projectFields = [
            { label: 'Service', value: results.serviceType },
            { label: 'Area', value: isNonZero(results.area) ? `${results.area.toFixed(2)} m²` : null },
            { label: 'Date Created', value: results.currentDate },
            { label: 'Valid Until', value: results.validUntil },
            { label: 'Quote Number', value: results.quoteNumber }
        ];
        const projectRows = projectFields.filter(f => isNonEmpty(f.value)).map(f => `<li><span class="highlight">${f.label}:</span> ${f.value}</li>`).join('');
        if (projectRows) {
            projectDetailsHTML = `
                <div class="results-container">
        <h3>Project Details</h3>
                    <ul class="results-list">${projectRows}</ul>
        </div>
            `;
        }

        // --- Materials & Requirements ---
        let materialsHTML = '';
        let materialSections = [];
        // Imported Materials
        if (this.importMaterials && this.importMaterials.length > 0) {
            let importLines = this.importMaterials.map(item => {
                const density = item.density || this.getMaterialDensity(item.material);
                const weight = item.volume * density;
                const lineCost = weight * item.costPerTonne;
                let coverage = '';
                if (item.area && item.depth) {
                    coverage = `<div>‣ Coverage: ${item.area} m² × ${item.depth} mm</div>`;
                } else if (item.volume) {
                    coverage = `<div>‣ Volume: ${item.volume} m³</div>`;
                }
                return `
                    <div style="margin-bottom:1em;">
                        <strong>${item.material}</strong>
                        ${coverage}
                        <div>‣ Quantity: ${weight.toFixed(2)} t</div>
                        <div>‣ Cost: ${formatMoney(lineCost)}</div>
        </div>
                `;
            }).join('');
            materialSections.push(`
                <div><strong>Imported Materials</strong>${importLines}</div>
            `);
        }
        // Excavated/Removed Materials
        if (this.excavationItems && this.excavationItems.length > 0) {
            let excavationLines = this.excavationItems.map(item => {
                const density = item.density || this.getMaterialDensity(item.material);
                const compactedVolume = item.compactedVolume || (item.area * (item.depth / 1000));
                const looseVolume = item.looseVolume || compactedVolume;
                const weight = looseVolume * density;
                let coverage = '';
                if (item.area && item.depth) {
                    coverage = `<div>‣ Coverage: ${item.area} m² × ${item.depth} mm</div>`;
                } else if (looseVolume) {
                    coverage = `<div>‣ Volume: ${looseVolume.toFixed(2)} m³</div>`;
                }
                let disposalCost = item.disposal !== 'Reuse' ? formatMoney(weight * item.tipFee) : 'No cost';
                return `
                    <div style="margin-bottom:1em;">
                        <strong>${item.material} (Removed)</strong>
                        ${coverage}
                        <div>‣ Quantity: ${weight.toFixed(2)} t</div>
                        <div>‣ Disposal Type: ${item.disposal}</div>
                        <div>‣ Disposal Cost: ${disposalCost}</div>
      </div>
                `;
            }).join('');
            materialSections.push(`
                <div><strong>Excavated / Removed Materials</strong>${excavationLines}</div>
            `);
        }
        // Emulsion (only if used)
        if (isNonZero(results.emulsionRequired)) {
            materialSections.push(`
                <div><strong>Emulsion</strong>
                    <div>‣ Type: ${results.emulsionType || 'N/A'}</div>
                    <div>‣ Volume: ${formatQty(results.emulsionRequired, ' L')}</div>
                    <div>‣ Cost: ${formatMoney(results.emulsionCost)}</div>
    </div>
            `);
        }
        if (materialSections.length > 0) {
            materialsHTML = `
                <div class="results-container">
                    <h3>Materials & Requirements</h3>
                    ${materialSections.join('')}
      </div>
            `;
        }

        // --- Cost Breakdown ---
        let costBreakdownLines = [];
        // Labor
        if (results.laborRolesBreakdown && results.laborRolesBreakdown.length > 0 && isNonZero(results.totalLaborCostFromRoles)) {
            costBreakdownLines.push(`<li>Standard Labor: ${formatMoney(results.totalLaborCostFromRoles)}</li>`);
        } else if (isNonZero(results.totalLaborCost)) {
            costBreakdownLines.push(`<li>Labor: ${formatMoney(results.totalLaborCost)}</li>`);
        }
        // Other Labor
        if (isNonZero(results.totalOtherLaborCost)) {
            costBreakdownLines.push(`<li>Other Labor: ${formatMoney(results.totalOtherLaborCost)}</li>`);
        }
        // Equipment
        if (isNonZero(results.equipmentDepreciation)) {
            costBreakdownLines.push(`<li>Equipment: ${formatMoney(results.equipmentDepreciation)}</li>`);
        }
        // Consumables
        if (isNonZero(results.consumablesCost)) {
            costBreakdownLines.push(`<li>Consumables: ${formatMoney(results.consumablesCost)}</li>`);
        }
        // Traffic Control
        if (isNonZero(results.trafficControlCost)) {
            costBreakdownLines.push(`<li>Traffic Control: ${formatMoney(results.trafficControlCost)}</li>`);
        }
        // Disposal
        if (results.excavationCostData && isNonZero(results.excavationCostData.breakdown?.disposalCost)) {
            costBreakdownLines.push(`<li>Disposal: ${formatMoney(results.excavationCostData.breakdown.disposalCost)}</li>`);
        }
        // Import Material Cost
        if (results.excavationCostData && isNonZero(results.excavationCostData.breakdown?.importMaterialCost)) {
            costBreakdownLines.push(`<li>Import Materials: ${formatMoney(results.excavationCostData.breakdown.importMaterialCost)}</li>`);
        }
        // Machine Cost
        if (results.excavationCostData && isNonZero(results.excavationCostData.breakdown?.machineCost)) {
            costBreakdownLines.push(`<li>Excavation Machine: ${formatMoney(results.excavationCostData.breakdown.machineCost)}</li>`);
        }
        // Only show if there are any costs
        let costBreakdownHTML = '';
        if (costBreakdownLines.length > 0) {
            costBreakdownHTML = `
                <div class="results-container">
                    <h3>Cost Breakdown</h3>
                    <ul class="results-list">${costBreakdownLines.join('')}</ul>
      </div>
            `;
        }

        // --- Labor Role Breakdown ---
        let laborRolesBreakdownHTML = '';
        if (results.laborRolesBreakdown && results.laborRolesBreakdown.length > 0) {
            const roleLines = results.laborRolesBreakdown.map(role => {
                let line = `${role.type}: ${role.workers} × ${role.hours} hrs × ${role.days} days × $${role.rate}/hr`;
                if (role.penaltyLabel) line += ` × ${role.penaltyLabel}`;
                line += ` × ${(role.oncostMultiplier).toFixed(2)} (oncosts) = ${formatMoney(role.totalCost)}`;
                return `<li>${line}</li>`;
            });
            laborRolesBreakdownHTML = `
                <div class="results-container">
                    <h3>Labor Role Breakdown</h3>
                    <ul class="results-list">${roleLines.join('')}</ul>
    </div>
            `;
        }

        // --- Notes ---
        let notesHTML = '';
        if (isNonEmpty(results.notes)) {
            notesHTML = `
                <div class="results-container mt-6">
                    <h3>Notes</h3>
                    <p>${results.notes}</p>
      </div>
            `;
        }

        // --- Compose Final HTML ---
        resultContainer.innerHTML = `
            ${quoteSummaryHTML}
            ${clientInfoHTML}
            ${projectDetailsHTML}
            ${materialsHTML}
            ${costBreakdownHTML}
            ${laborRolesBreakdownHTML}
            ${notesHTML}
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
            // Only allow saving if a calculation has been performed
            if (!this.currentCalculations) {
                this.showNotification('Please calculate the quote before saving.', 'error');
                return;
            }
            const results = this.currentCalculations; // Always use last previewed results
            // Debug log: what is being saved
            console.log('[SAVE] formData:', JSON.parse(JSON.stringify(formData)));
            console.log('[SAVE] results:', JSON.parse(JSON.stringify(results)));
            // Validate required fields before sending
            const validationErrors = this.validateQuoteData(formData);
            if (validationErrors.length > 0) {
                this.showNotification(`Please fill in all required fields: ${validationErrors.join(', ')}`, 'error');
                return;
            }
            // Save backend schema, full formData, and results for preview
            const quoteData = {
                ...this.transformFormDataForBackend(formData),
                formData, // Save all raw input values
                results
            };
            const apiUrl = this.getApiUrl();
            const isEditing = this.currentQuote && this.currentQuote._id;
            const url = isEditing 
                ? `${apiUrl}/api/quotes/${this.currentQuote._id}`
                : `${apiUrl}/api/quotes`;
            // --- IMAGE UPLOAD LOGIC ---
            // Use FormData for multipart upload
            const fd = new FormData();
            fd.append('quote', new Blob([JSON.stringify(quoteData)], { type: 'application/json' }));
            // Attach images and comments
            if (this.projectImages && this.projectImages.length > 0) {
                this.projectImages.forEach((imgObj, idx) => {
                    fd.append('images[]', imgObj.file);
                    fd.append('imageComments[]', imgObj.comment || '');
                });
            }
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                body: fd
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
                // Show the latest results in the results panel
                if (result.data.results) {
                    this.displayResults(result.data.results, result.data.formData);
                    this.showResults();
                }
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
        // All fields are optional for now
        return [];
    }

    transformFormDataForBackend(formData) {
        // Ensure all required fields are properly formatted with defaults
        const now = Date.now();
        const quoteData = {
            clientInfo: {
                firstName: formData.project_firstname?.trim() || 'Unknown',
                lastName: formData.project_lastname?.trim() || 'Unknown',
                email: formData.project_email?.trim() || 'unknown@example.com',
                mobile: formData.project_mobile?.trim() || '',
                address: formData.project_address?.trim() || 'Unknown',
                apartment: formData.project_apartment?.trim() || '',
                city: formData.project_city?.trim() || 'Unknown',
                postcode: formData.project_postcode?.trim() || '0000',
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
                type: formData.service_type?.trim() || 'General',
                trafficControl: formData.traffic_control || 'No',
                trafficControlType: formData['traffic-control-type']?.trim() || '',
                trafficControlHours: parseFloat(formData['traffic-control-hours-required']) || 0,
                trafficControlWorkers: parseFloat(formData['traffic-control-workers-required']) || 0,
                trafficControlHourlyRate: parseFloat(formData['traffic-control-hourly-rate']) || 45,
                trafficControlEquipment: formData['traffic-control-equipment']?.trim() || '',
                trafficControlPermits: formData['traffic-control-permits']?.trim() || '',
                trafficControlNotification: formData['traffic-control-notification']?.trim() || '',
                trafficControlComplexity: formData['traffic-control-complexity']?.trim() || '',
                trafficControlWeather: formData['traffic-control-weather']?.trim() || '',
                trafficControlNotes: formData['traffic-control-notes']?.trim() || '',
                excavationRequired: formData['excavation-required'] || 'No',
                excavationType: formData['excavation-type']?.trim() || '',
                excavationMachine: formData['excavation-machine']?.trim() || '',
                excavationMachineRate: parseFloat(formData['excavation-machine-rate']) || 0,
                excavationNotes: formData['excavation-notes']?.trim() || ''
            },
            projectInfo: {
                quoteNumber: formData.quote_number || `Q-${now}`,
                validFor: parseFloat(formData['valid-for']) || 30,
                profitMargin: parseFloat(formData['profit-margin']) || 40,
                taxRate: parseFloat(formData.tax_rate) || 10
            },
            materials: {
                // Legacy asphalt fields for backward compatibility
                asphalt: {
                    area: parseFloat(formData.area) || 1,
                    depth: parseFloat(formData.depth) || 1,
                    costPerTonne: parseFloat(formData.cost_per_tonne) || 190,
                    density: parseFloat(formData.asphalt_density) || 2400
                },
                emulsion: {
                    type: formData.emulsion_type?.trim() || '',
                    coverage: parseFloat(formData.emulsion_coverage) || 0.65,
                    costPerLitre: parseFloat(formData.emulsion_cost_per_litre) || 1.50
                }
            },
            labor: {
                workers: parseFloat(formData['required-workers']) || 2,
                jobDuration: parseFloat(formData['job-duration']) || 0,
                hours: parseFloat(formData['time-to-complete-job']) || 2,
                hourlyRate: parseFloat(formData.hourly_rate) || 30,
                superannuation: parseFloat(formData.superannuation) || 11,
                workersCompensation: parseFloat(formData.workers_compensation) || 2,
                otherCosts: parseFloat(formData['other-labor-costs']) || 2
            },
            otherLaborItems: this.otherLaborItems.map(item => ({
                type: item.type,
                hours: item.hours,
                cost: item.cost,
                addGst: item.addGst
            })),
            laborRoles: this.laborRoles.map(role => ({ ...role })),
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
                compactorPlate: parseFloat(formData.compactor_plate) || 0,
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
            calculations: this.getCalculations(),
            rawFormData: { ...formData }
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

    loadQuoteData(data, mode = 'edit') {
        // mode: 'edit' or 'view'
        if (data.formData || data.results) {
            // Debug log: what is being loaded from backend
            console.log(`[LOAD] mode: ${mode}`);
            console.log('[LOAD] formData:', JSON.parse(JSON.stringify(data.formData)));
            console.log('[LOAD] results:', JSON.parse(JSON.stringify(data.results)));
            this.loadBackendData(data, mode);
        } else {
            // Legacy format (from file)
            this.loadLegacyData(data);
            this.calculateQuote(true);
        }
    }

    loadBackendData(data, mode = 'edit') {
        // mode: 'edit' or 'view'
        this.currentQuote = data;
        if (data.formData) {
            this.setFormFieldsFromData(data.formData);
            // After restoring form, recalculate and log
            const recalculated = this.performCalculations();
            console.log('[EDIT] After restoring form, recalculated results:', JSON.parse(JSON.stringify(recalculated)));
            if (data.results) {
                console.log('[EDIT] Saved results from backend:', JSON.parse(JSON.stringify(data.results)));
            }
        }
        // Always refresh dynamic UI lists after loading
        this.refreshLaborRoles();
        this.refreshExcavationItems();
        this.refreshImportMaterials();
        this.refreshLaborList();
        // Trigger calculation and show results panel
        if (mode === 'edit') {
            this.calculateQuote(false);
            this.setEditMode(true, data.formData?.quote_number || data.projectInfo?.quoteNumber || '');
        } else if (mode === 'view') {
            if (data.results) {
                this.displayResults(data.results, data.formData || null);
            }
            this.setViewMode();
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

    refreshExcavationItems() {
        const container = document.getElementById('excavation-items-container');
        if (container) {
            container.innerHTML = '';
            
            this.excavationItems.forEach(item => {
                this.addExcavationItemToUI(item);
            });
            
            this.updateExcavationSummary();
        }
    }

    exportPDF() {
        this.showNotification('PDF export feature coming soon!', 'info');
        // TODO: Implement PDF generation using jsPDF or similar library
    }

    addImportMaterial() {
        const material = document.getElementById('new_import_material').value;
        const area = parseFloat(document.getElementById('new_import_area').value) || 0;
        let areaBreakdown = [];
        try { areaBreakdown = JSON.parse(document.getElementById('new_import_area').dataset.breakdown||'[]'); } catch(e){}
        const depth = parseFloat(document.getElementById('new_import_depth').value) || 0;
        let volume = parseFloat(document.getElementById('new_import_volume').value) || 0;
        const density = parseFloat(document.getElementById('new_import_density').value) || this.getMaterialDensity(material);
        const costPerTonne = parseFloat(document.getElementById('new_import_cost_per_tonne').value) || 30;
        const machineHours = parseFloat(document.getElementById('new_import_machine_hours').value) || 0;
        const compactionPercent = parseFloat(document.getElementById('new_import_compaction').value) || this.getMaterialCompactionFactor(material);
        const compactionFactor = 1 + (compactionPercent / 100);
        const tipFee = parseFloat(document.getElementById('new_import_tip_fee').value) || 150;
        if ((!area || !depth) && !volume) {
            this.showNotification('Please enter area and depth, or volume.', 'error');
            return;
        }
        let compactedVolume = area && depth ? area * (depth / 1000) : 0;
        let looseVolume = compactedVolume * compactionFactor;
        if (volume) {
            looseVolume = volume;
            compactedVolume = volume / compactionFactor;
        }
        volume = looseVolume;
        // Force all IDs in importMaterials to be numbers
        this.importMaterials.forEach(i => { i.id = Number(i.id); });
        const importItem = {
            id: this.editingImportMaterialId || Date.now(),
            material: material,
            area: area,
            areaBreakdown,
            depth: depth,
            volume: volume,
            density: density,
            costPerTonne: costPerTonne,
            machineHours: machineHours,
            compactedVolume: compactedVolume,
            looseVolume: looseVolume,
            compactionPercent: compactionPercent,
            tipFee: tipFee
        };
        // VERBOSE DEBUG
        console.log('[DEBUG] importMaterials IDs:', this.importMaterials.map(i => i.id), 'editingImportMaterialId:', this.editingImportMaterialId);
        if (this.editingImportMaterialId) {
            const idx = this.importMaterials.findIndex(i => Number(i.id) === Number(this.editingImportMaterialId));
            console.log('[DEBUG] Editing import material:', this.editingImportMaterialId, 'Found index:', idx);
            if (idx !== -1) {
                this.importMaterials[idx] = importItem;
                this.showNotification('Import material updated!', 'success');
            } else {
                console.warn('[DEBUG] Could not find item to update! IDs:', this.importMaterials.map(i => i.id), 'Edit ID:', this.editingImportMaterialId);
                this.showNotification('Error: Could not find item to update. See console for details.', 'error');
                return;
            }
        } else {
            this.importMaterials.push(importItem);
            this.showNotification('Import material added successfully!', 'success');
        }
        console.log('[DEBUG] [AFTER UPDATE] importMaterials:', JSON.parse(JSON.stringify(this.importMaterials)));
        this.refreshImportMaterials();
        this.resetImportFormAndEditState();
    }

    addImportMaterialToUI(importItem) {
        const container = document.getElementById('import-materials-container');
        const importElement = document.createElement('div');
        importElement.className = 'import-material-item';
        importElement.dataset.id = importItem.id;
        const density = importItem.density || this.getMaterialDensity(importItem.material);
        let weight = importItem.volume * density;
        let truckLoads = weight / 10;
        const totalCost = weight * importItem.costPerTonne;
        let machineHoursText = importItem.isThirdParty
            ? '3rd Party Delivery (no machine hours)'
            : (importItem.machineHours > 0 
                ? `Machine Hours: ${importItem.machineHours} hrs`
                : '');
        let compactionNote = '';
        if (importItem.compactionPercent && importItem.compactionPercent !== 100) {
            const compactedWeight = importItem.compactedVolume * density;
            compactionNote = `<div class="text-xs text-secondary">Compacted volume: ${importItem.compactedVolume.toFixed(3)} m³ × ${density} t/m³ = ${compactedWeight.toFixed(2)} t<br>Loose (ordered) volume: ${importItem.looseVolume.toFixed(3)} m³ × ${density} t/m³ = ${weight.toFixed(2)} t (${importItem.compactionPercent - 100}% compaction factor applied)</div>`;
        }
        importElement.innerHTML = `
            <div class="import-material-info">
                <div class="font-medium">${importItem.material}</div>
                <div class="text-sm text-secondary">
                    ${importItem.area} m² × ${importItem.depth}mm = ${importItem.volume} m³
    </div>
                <div class="text-sm text-secondary">
                    ${importItem.volume} m³ × ${density} t/m³ = ${weight.toFixed(2)} tonnes
        </div>
                <div class="text-sm text-secondary">
                    ${truckLoads.toFixed(1)} truck loads @ $${importItem.costPerTonne}/tonne = $${totalCost.toFixed(2)}
      </div>
                <div class="text-sm text-secondary">
                    ${machineHoursText}
        </div>
                ${compactionNote}
        </div>
            <div class="import-material-actions">
                <button type="button" class="btn btn-secondary btn-icon edit-import-material" data-id="${importItem.id}"><i class="fas fa-edit"></i></button>
                <button type="button" class="btn btn-danger btn-icon delete-import-material" data-id="${importItem.id}"><i class="fas fa-trash"></i></button>
        </div>
        `;
        container.appendChild(importElement);
        // Add delete event listener
        const deleteBtn = importElement.querySelector('.delete-import-material');
        deleteBtn.addEventListener('click', () => {
            this.deleteImportMaterial(importItem.id);
        });
        // Add edit event listener
        const editBtn = importElement.querySelector('.edit-import-material');
        editBtn.addEventListener('click', () => {
            this.editingImportMaterialId = Number(importItem.id);
            document.getElementById('new_import_material').value = importItem.material;
            document.getElementById('new_import_area').value = importItem.area;
            document.getElementById('new_import_area').dataset.breakdown = importItem.areaBreakdown ? JSON.stringify(importItem.areaBreakdown) : '';
            document.getElementById('import-area-breakdown').innerHTML = importItem.areaBreakdown && importItem.areaBreakdown.length ? this.renderBreakdownHTML(importItem.areaBreakdown) : '';
            document.getElementById('new_import_depth').value = importItem.depth;
            document.getElementById('new_import_volume').value = importItem.volume;
            document.getElementById('new_import_density').value = importItem.density;
            document.getElementById('new_import_cost_per_tonne').value = importItem.costPerTonne;
            document.getElementById('new_import_machine_hours').value = importItem.machineHours;
            document.getElementById('new_import_compaction').value = importItem.compactionPercent;
            document.getElementById('new_import_tip_fee').value = importItem.tipFee || 150;
            if (this.addImportBtn) this.addImportBtn.style.display = 'none';
            if (this.saveImportEditBtn) this.saveImportEditBtn.style.display = '';
            if (this.cancelImportEditBtn) this.cancelImportEditBtn.style.display = '';
        });
    }

    deleteImportMaterial(id) {
        const index = this.importMaterials.findIndex(item => item.id === id);
        if (index > -1) {
            this.importMaterials.splice(index, 1);
            const element = document.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.remove();
            }
            this.updateImportSummary();
            this.calculateQuote(true);
            this.showNotification('Import material removed.', 'success');
        }
    }

    clearImportMaterialForm() {
        document.getElementById('new_import_material').value = '';
        document.getElementById('new_import_area').value = '';
        document.getElementById('new_import_depth').value = '';
        document.getElementById('new_import_volume').value = '';
        document.getElementById('new_import_density').value = '';
        document.getElementById('new_import_cost_per_tonne').value = '30';
        document.getElementById('new_import_machine_hours').value = '0';
    }

    updateImportSummary() {
        const summary = document.getElementById('import-summary');
        const totalVolumeElement = document.getElementById('total_import_volume');
        const totalWeightElement = document.getElementById('total_import_weight');
        const totalCostElement = document.getElementById('total_import_cost');

        if (this.importMaterials.length === 0) {
            summary.classList.add('hidden');
            return;
        }

        summary.classList.remove('hidden');

        let totalVolume = 0;
        let totalWeight = 0;
        let totalCost = 0;

        this.importMaterials.forEach(item => {
            totalVolume += item.volume;
            const density = item.density || this.getMaterialDensity(item.material);
            const weight = item.volume * density;
            totalWeight += weight;
            totalCost += weight * item.costPerTonne;
        });

        totalVolumeElement.textContent = `${totalVolume.toFixed(2)} m³`;
        totalWeightElement.textContent = `${totalWeight.toFixed(2)} tonnes`;
        totalCostElement.textContent = `$${totalCost.toFixed(2)}`;
    }

    refreshImportMaterials() {
        const container = document.getElementById('import-materials-container');
        if (container) {
            container.innerHTML = '';
            
            this.importMaterials.forEach(item => {
                this.addImportMaterialToUI(item);
            });
            
            this.updateImportSummary();
        }
    }

    calculateImportVolume() {
        const importAreaEl = document.getElementById('new_import_area');
        const importMaterialEl = document.getElementById('new_import_material');
        const importDepthEl = document.getElementById('new_import_depth');
        const newImportVolume = document.getElementById('new_import_volume');
        if (!importAreaEl || !importMaterialEl || !importDepthEl || !newImportVolume) return;
        const importArea = parseFloat(importAreaEl.value) || 0;
        const newImportMaterial = importMaterialEl.value;
        const newImportDepth = parseFloat(importDepthEl.value) || 0;
        let calculatedVolume = 0;
        if (newImportMaterial && newImportMaterial !== 'None' && newImportDepth > 0 && importArea > 0) {
            if (newImportMaterial === 'Asphalt') {
                calculatedVolume = importArea * (newImportDepth / 1000) * 1.25;
            } else {
                calculatedVolume = importArea * (newImportDepth / 1000);
            }
            if (!newImportVolume.value || Math.abs(parseFloat(newImportVolume.value) - calculatedVolume) > 0.01) {
                newImportVolume.value = calculatedVolume.toFixed(3);
            }
        }
    }

    calculateExcavationTime() {
        const excavatorBucketSize = parseFloat(document.getElementById('excavator_bucket_size').value) || 0.5;
        const truckCapacity = parseFloat(document.getElementById('truck_capacity').value) || 12;
        const trucksAvailable = parseFloat(document.getElementById('trucks_available').value) || 2;
        const operationEfficiency = parseFloat(document.getElementById('operation_efficiency').value) || 75;
        const roundTripTime = parseFloat(document.getElementById('round_trip_time').value) || 45;
        const excavatorCycleTime = parseFloat(document.getElementById('excavator_cycle_time').value) || 2;
        
        // Calculate total volume from excavation items
        let totalVolume = 0;
        this.excavationItems.forEach(item => {
            const volume = item.area * (item.depth / 1000);
            totalVolume += volume;
        });
        
        if (totalVolume <= 0 || excavatorBucketSize <= 0) {
            document.getElementById('excavation-time-summary').classList.add('hidden');
            return;
        }
        
        // Calculate excavator cycles needed
        const excavatorCycles = Math.ceil(totalVolume / excavatorBucketSize);
        
        // Calculate truck loads needed
        const truckLoads = Math.ceil(totalVolume / truckCapacity);
        
        // Calculate time factors
        const efficiencyMultiplier = 100 / operationEfficiency; // Convert efficiency to multiplier
        const truckLoadingTime = 5; // Time to load a truck in minutes
        
        // Calculate total time
        const excavatorTime = (excavatorCycles * excavatorCycleTime) * efficiencyMultiplier;
        const truckTime = (truckLoads * roundTripTime) / trucksAvailable; // Parallel truck operations
        const totalTimeMinutes = Math.max(excavatorTime, truckTime); // Use the longer of the two
        const totalTimeHours = totalTimeMinutes / 60;
        
        // Update the display
        document.getElementById('excavation-time-summary').classList.remove('hidden');
        document.getElementById('total_excavation_volume_time').textContent = `${totalVolume.toFixed(2)} m³`;
        document.getElementById('excavator_cycles').textContent = excavatorCycles;
        document.getElementById('truck_loads_time').textContent = truckLoads;
        document.getElementById('estimated_excavation_time').textContent = `${totalTimeHours.toFixed(1)} hours`;
        
        console.log('Excavation Time Calculation:', {
            totalVolume,
            excavatorCycles,
            truckLoads,
            excavatorTime: excavatorTime / 60,
            truckTime: truckTime / 60,
            totalTimeHours
        });
    }

    getEstimatedExcavationTime() {
        const excavatorBucketSize = parseFloat(document.getElementById('excavator_bucket_size').value) || 0.5;
        const truckCapacity = parseFloat(document.getElementById('truck_capacity').value) || 12;
        const trucksAvailable = parseFloat(document.getElementById('trucks_available').value) || 2;
        const operationEfficiency = parseFloat(document.getElementById('operation_efficiency').value) || 75;
        const roundTripTime = parseFloat(document.getElementById('round_trip_time').value) || 45;
        const excavatorCycleTime = parseFloat(document.getElementById('excavator_cycle_time').value) || 2;
        
        // Calculate total volume from excavation items
        let totalVolume = 0;
        this.excavationItems.forEach(item => {
            const volume = item.area * (item.depth / 1000);
            totalVolume += volume;
        });
        
        if (totalVolume <= 0 || excavatorBucketSize <= 0) {
            return 0;
        }
        
        // Calculate excavator cycles needed
        const excavatorCycles = Math.ceil(totalVolume / excavatorBucketSize);
        
        // Calculate truck loads needed
        const truckLoads = Math.ceil(totalVolume / truckCapacity);
        
        // Calculate time factors
        const efficiencyMultiplier = 100 / operationEfficiency;
        const truckLoadingTime = 5; // Time to load a truck in minutes
        
        // Calculate total time
        const excavatorTime = (excavatorCycles * excavatorCycleTime) * efficiencyMultiplier;
        const truckTime = (truckLoads * roundTripTime) / trucksAvailable;
        const totalTimeMinutes = Math.max(excavatorTime, truckTime);
        const totalTimeHours = totalTimeMinutes / 60;
        
        return totalTimeHours.toFixed(1);
    }

    updateOtherLaborPricingMethodUI() {
        const method = document.getElementById('other_labor_pricing_method').value;
        const hoursGroup = document.getElementById('other_labor_hours_group');
        const rateGroup = document.getElementById('other_labor_rate_group');
        const fixedGroup = document.getElementById('other_labor_fixed_group');
        if (method === 'hourly') {
            hoursGroup.style.display = '';
            rateGroup.style.display = '';
            fixedGroup.style.display = 'none';
        } else {
            hoursGroup.style.display = 'none';
            rateGroup.style.display = 'none';
            fixedGroup.style.display = '';
        }
    }

    addLaborRole() {
        const type = document.getElementById('labor_role_type').value;
        const workers = parseInt(document.getElementById('labor_role_workers').value) || 0;
        const hours = parseFloat(document.getElementById('labor_role_hours').value) || 0;
        const days = parseInt(document.getElementById('labor_role_days').value) || 1;
        const rate = parseFloat(document.getElementById('labor_role_rate').value) || 0;
        const publicHoliday = document.getElementById('labor_role_public_holiday').checked;
        const sunday = document.getElementById('labor_role_sunday').checked;
        const saturday = document.getElementById('labor_role_saturday').checked;
        const afterHours = document.getElementById('labor_role_after_hours').checked;
        if (!type || workers <= 0 || hours <= 0 || days <= 0 || rate < 0) {
            this.showNotification('Please enter valid values for all labor role fields.', 'error');
            return;
        }
        const role = {
            id: Date.now(),
            type,
            workers,
            hours,
            days,
            rate,
            publicHoliday,
            sunday,
            saturday,
            afterHours
        };
        this.laborRoles.push(role);
        this.refreshLaborRoles();
        this.calculateQuote(true);
        this.showNotification('Labor role added!', 'success');
    }

    refreshLaborRoles() {
        const list = document.getElementById('labor-roles-list');
        const totalDiv = document.getElementById('labor-roles-total');
        if (!list) return;
        list.innerHTML = '';
        let total = 0;
        this.laborRoles.forEach(role => {
            let multiplier = 1;
            let penaltyLabel = '';
            if (role.publicHoliday) {
                multiplier = 2.5;
                penaltyLabel = 'Public Holiday (2.5×)';
            } else if (role.sunday) {
                multiplier = 2;
                penaltyLabel = 'Sunday (2×)';
            } else if (role.saturday) {
                multiplier = 1.5;
                penaltyLabel = 'Saturday (1.5×)';
            } else if (role.afterHours) {
                multiplier = 1.5;
                penaltyLabel = 'Overnight/After Hours (1.5×)';
            }
            const cost = role.workers * role.hours * role.rate * multiplier * role.days;
            total += cost;
            const el = document.createElement('div');
            el.className = 'labor-item';
            el.innerHTML = `
                <div class="labor-item-info">
                    <div class="font-medium">${role.type}</div>
                    <div class="text-sm text-secondary">${role.workers} × ${role.hours} hrs × ${role.days} days × $${role.rate}/hr${penaltyLabel ? ` × ${penaltyLabel}` : ''}</div>
                    <div class="text-sm font-medium text-success">$${cost.toFixed(2)}</div>
      </div>
                <div class="labor-item-actions">
                    <button type="button" class="btn btn-secondary btn-icon edit-labor-role" data-id="${role.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button type="button" class="btn btn-danger btn-icon delete-labor-role" data-id="${role.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
            `;
            el.querySelector('.delete-labor-role').addEventListener('click', () => {
                this.deleteLaborRole(role.id);
            });
            el.querySelector('.edit-labor-role').addEventListener('click', () => {
                this.editLaborRole(role.id);
            });
            list.appendChild(el);
        });
        if (totalDiv) {
            totalDiv.textContent = this.laborRoles.length > 0 ? `Total Standard Labor: $${total.toFixed(2)}` : '';
        }
    }

    deleteLaborRole(id) {
        this.laborRoles = this.laborRoles.filter(r => r.id !== id);
        this.refreshLaborRoles();
        this.calculateQuote(true);
        this.showNotification('Labor role removed.', 'success');
    }

    editLaborRole(id) {
        const role = this.laborRoles.find(r => r.id === id);
        if (!role) return;

        // Store the editing state
        this.editingLaborRoleId = id;

        // Populate the form with the role's data
        document.getElementById('labor_role_type').value = role.type;
        document.getElementById('labor_role_workers').value = role.workers;
        document.getElementById('labor_role_hours').value = role.hours;
        document.getElementById('labor_role_days').value = role.days;
        document.getElementById('labor_role_rate').value = role.rate;
        document.getElementById('labor_role_public_holiday').checked = role.publicHoliday;
        document.getElementById('labor_role_sunday').checked = role.sunday;
        document.getElementById('labor_role_saturday').checked = role.saturday;
        document.getElementById('labor_role_after_hours').checked = role.afterHours;

        // Change the add button to save button
        const addBtn = document.getElementById('add-labor-role-btn');
        const saveBtn = document.getElementById('save-labor-role-edit-btn');
        const cancelBtn = document.getElementById('cancel-labor-role-edit-btn');
        
        if (addBtn) addBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'inline-block';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        this.showNotification('Editing labor role. Make changes and click "Save Changes" or "Cancel".', 'info');
    }

    saveLaborRoleEdit() {
        if (!this.editingLaborRoleId) return;

        const type = document.getElementById('labor_role_type').value;
        const workers = parseInt(document.getElementById('labor_role_workers').value) || 0;
        const hours = parseFloat(document.getElementById('labor_role_hours').value) || 0;
        const days = parseInt(document.getElementById('labor_role_days').value) || 1;
        const rate = parseFloat(document.getElementById('labor_role_rate').value) || 0;
        const publicHoliday = document.getElementById('labor_role_public_holiday').checked;
        const sunday = document.getElementById('labor_role_sunday').checked;
        const saturday = document.getElementById('labor_role_saturday').checked;
        const afterHours = document.getElementById('labor_role_after_hours').checked;

        if (!type || workers <= 0 || hours <= 0 || days <= 0 || rate < 0) {
            this.showNotification('Please enter valid values for all labor role fields.', 'error');
            return;
        }

        const role = {
            id: this.editingLaborRoleId,
            type,
            workers,
            hours,
            days,
            rate,
            publicHoliday,
            sunday,
            saturday,
            afterHours
        };

        // Update the role in the array
        const index = this.laborRoles.findIndex(r => r.id === this.editingLaborRoleId);
        if (index > -1) {
            this.laborRoles[index] = role;
        }

        // Reset the form and UI
        this.resetLaborRoleFormAndEditState();
        this.refreshLaborRoles();
        this.calculateQuote(true);
        this.showNotification('Labor role updated successfully!', 'success');
    }

    resetLaborRoleFormAndEditState() {
        this.editingLaborRoleId = null;
        this.clearLaborRoleForm();
        
        // Reset button states
        const addBtn = document.getElementById('add-labor-role-btn');
        const saveBtn = document.getElementById('save-labor-role-edit-btn');
        const cancelBtn = document.getElementById('cancel-labor-role-edit-btn');
        
        if (addBtn) addBtn.style.display = 'inline-block';
        if (saveBtn) saveBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
    }

    clearLaborRoleForm() {
        document.getElementById('labor_role_type').value = 'Labourer';
        document.getElementById('labor_role_workers').value = '1';
        document.getElementById('labor_role_hours').value = '8';
        document.getElementById('labor_role_days').value = '1';
        document.getElementById('labor_role_rate').value = '30';
        document.getElementById('labor_role_public_holiday').checked = false;
        document.getElementById('labor_role_sunday').checked = false;
        document.getElementById('labor_role_saturday').checked = false;
        document.getElementById('labor_role_after_hours').checked = false;
    }

    // Helper: Australian tax calculation for 2024–2025
    calculateAnnualTax(income) {
        if (income <= 18200) return 0;
        if (income <= 45000) return (income - 18200) * 0.16;
        if (income <= 135000) return 4288 + (income - 45000) * 0.30;
        if (income <= 190000) return 31288 + (income - 135000) * 0.37;
        return 51638 + (income - 190000) * 0.45;
    }

    getMaterialCompactionFactor(material) {
        const compactionFactors = {
            'Asphalt': 25,
            'CBR-45': 15,
            'CBR-80': 15,
            'Gravel': 10,
            'Sand': 10,
            'Topsoil': 10,
            'Clay': 10,
            'Concrete': 0,
            'Rock': 0,
            'Grass/Turf': 0,
            'Mixed': 10
        };
        return compactionFactors[material] || 0;
    }

    setFormFieldsFromData(formData) {
        // Set all static fields
        Object.keys(formData).forEach(key => {
            let el = document.getElementById(key);
            if (!el) {
                // Try by name if not found by id
                el = document.querySelector(`[name='${key}']`);
            }
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = !!formData[key];
                } else {
                    el.value = formData[key];
                }
            }
        });
        // Restore dynamic lists
        this.laborRoles = formData.laborRoles || [];
        this.importMaterials = formData.importMaterials || [];
        this.excavationItems = formData.excavationItems || [];
        this.otherLaborItems = formData.otherLaborItems || [];
        this.refreshLaborRoles();
        this.refreshImportMaterials();
        this.refreshExcavationItems();
        this.refreshLaborList();
    }

    setupExcavationSection() {
        // Equipment
        const addEquipmentBtn = document.getElementById('add-excavation-equipment');
        if (addEquipmentBtn) {
            addEquipmentBtn.addEventListener('click', () => {
                const type = document.getElementById('equipment_type').value.trim();
                const hireType = document.getElementById('equipment_hire_type').value;
                const hourlyRate = parseFloat(document.getElementById('equipment_hourly_rate').value) || 0;
                const assignMode = document.getElementById('equipment_assign_mode').value;
                if (!type || hourlyRate <= 0) {
                    this.showNotification('Please enter valid equipment type and hourly rate.', 'error');
                    return;
                }
                this.excavationEquipment.push({
                    id: Date.now(),
                    type, hireType, hourlyRate, assignMode
                });
                this.renderExcavationEquipmentList();
                document.getElementById('equipment_type').value = '';
                document.getElementById('equipment_hourly_rate').value = '';
            });
        }
        // Excavation Items
        const addExcavationItemCardBtn = document.getElementById('add-excavation-item-card');
        if (addExcavationItemCardBtn) {
            addExcavationItemCardBtn.addEventListener('click', () => {
                const desc = document.getElementById('excavation_item_description').value.trim();
                const area = parseFloat(document.getElementById('excavation_item_area').value) || 0;
                const areaBreakdown = (() => { try { return JSON.parse(document.getElementById('excavation_item_area').dataset.breakdown||'[]'); } catch(e){return [];} })();
                const volume = parseFloat(document.getElementById('excavation_item_volume').value) || 0;
                const material = document.getElementById('excavation_item_material').value;
                const depth = parseFloat(document.getElementById('excavation_item_depth').value) || 0;
                const equipmentId = document.getElementById('excavation_item_equipment').value;
                const machineHours = parseFloat(document.getElementById('excavation_item_machine_hours').value) || 0;
                const disposal = document.getElementById('excavation_item_disposal').value;
                const tipFee = parseFloat(document.getElementById('excavation_item_tip_fee').value) || 0;
                const isThirdPartyEl = document.getElementById('excavation_item_3rd_party');
                const isThirdParty = isThirdPartyEl ? isThirdPartyEl.checked : false;
                // Validation: require (area+depth) or volume
                if ((!area || !depth) && !volume) {
                    window.app.showNotification('Please enter area and depth, or volume.', 'error');
                    return;
                }
                // Calculate volume
                let finalVolume = volume;
                if (!volume && area && depth) {
                    finalVolume = area * (depth / 1000);
                }
                const item = {
                    id: window.app.editingExcavationItemId || Date.now(),
                    desc, area, areaBreakdown, volume: finalVolume, material, depth, equipmentId, machineHours, disposal, tipFee, isThirdParty
                };
                if (window.app.editingExcavationItemId) {
                    // Update existing
                    const idx = window.app.excavationItemsV2.findIndex(i => i.id === window.app.editingExcavationItemId);
                    if (idx !== -1) window.app.excavationItemsV2[idx] = item;
                    window.app.showNotification('Excavation item updated!', 'success');
                } else {
                    window.app.excavationItemsV2.push(item);
                    window.app.showNotification('Excavation item added successfully!', 'success');
                }
                window.app.renderExcavationItemsCards();
                resetExcavationFormAndEditState();
            });
        }
        // Third-Party Delivery/Removal
        const addThirdPartyBtn = document.getElementById('add-third-party-item');
        if (addThirdPartyBtn) {
            addThirdPartyBtn.addEventListener('click', () => {
                const material = document.getElementById('third_party_material').value.trim();
                const costPerTonne = parseFloat(document.getElementById('third_party_cost_per_tonne').value) || 0;
                const notes = document.getElementById('third_party_notes').value.trim();
                if (!material || costPerTonne <= 0) {
                    this.showNotification('Please enter valid material and cost per tonne.', 'error');
                    return;
                }
                this.thirdPartyExcavationItems.push({
                    id: Date.now(),
                    material, costPerTonne, notes
                });
                this.renderThirdPartyExcavationList();
                document.getElementById('third_party_material').value = '';
                document.getElementById('third_party_cost_per_tonne').value = '';
                document.getElementById('third_party_notes').value = '';
            });
        }
        // Advanced settings toggle
        const advToggleBtn = document.getElementById('toggle-advanced-excavation');
        if (advToggleBtn) {
            advToggleBtn.addEventListener('click', () => {
                const adv = document.getElementById('advanced-excavation-settings');
                if (adv) adv.classList.toggle('hidden');
            });
        }
        // Initial renders
        this.renderExcavationEquipmentList();
        this.renderExcavationItemsCards();
        this.renderThirdPartyExcavationList();
    }

    renderExcavationEquipmentList() {
        const list = document.getElementById('excavation-equipment-list');
        list.innerHTML = '';
        this.excavationEquipment.forEach(eq => {
            const el = document.createElement('div');
            el.className = 'equipment-item';
            el.innerHTML = `<strong>${eq.type}</strong> (${eq.hireType}, $${eq.hourlyRate}/hr, Assign: ${eq.assignMode}) <button type="button" class="btn btn-danger btn-sm" data-id="${eq.id}">Remove</button>`;
            el.querySelector('button').addEventListener('click', () => {
                this.excavationEquipment = this.excavationEquipment.filter(e => e.id !== eq.id);
                this.renderExcavationEquipmentList();
            });
            list.appendChild(el);
        });
        // Update equipment select for items
        const eqSelect = document.getElementById('excavation_item_equipment');
        if (eqSelect) {
            eqSelect.innerHTML = '<option value="">Select equipment</option>';
            this.excavationEquipment.forEach(eq => {
                eqSelect.innerHTML += `<option value="${eq.id}">${eq.type} ($${eq.hourlyRate}/hr)</option>`;
            });
        }
    }

    renderExcavationItemsCards() {
        const cards = document.getElementById('excavation-items-cards');
        cards.innerHTML = '';
        this.excavationItemsV2.forEach(item => {
            const eq = this.excavationEquipment.find(e => e.id == item.equipmentId);
            const card = document.createElement('div');
            card.className = 'excavation-item-card';
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <div><strong>${item.desc}</strong> (${item.material}, ${item.area ? item.area + ' m²' : ''}${item.volume ? (item.area ? ', ' : '') + item.volume.toFixed(2) + ' m³' : ''}${item.depth ? ', ' + item.depth + 'mm' : ''})</div>
                    <span>
                        <button type="button" class="btn btn-secondary btn-sm edit-excavation-item" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                        <button type="button" class="btn btn-danger btn-sm" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </span>
      </div>
                <div class="text-sm text-secondary mt-1">
                    ${item.isThirdParty ? '<span>3rd Party Handled</span>' : eq ? `<span>Equipment: ${eq.type} ($${eq.hourlyRate}/hr)</span>` : '<span>No equipment assigned</span>'}
    </div>
                <div class="text-xs mt-1">
                    <span>Machine Hours: ${item.machineHours}</span> | <span>Disposal: ${item.disposal}${item.disposal === 'Reuse' ? '' : ` @ $${item.tipFee}/t`}</span>
                </div>
                ${item.areaBreakdown && item.areaBreakdown.length ? `<div class="area-breakdown-list">${this.renderBreakdownHTML(item.areaBreakdown)}</div>` : ''}
            `;
            card.querySelector('.btn-danger').addEventListener('click', () => {
                this.excavationItemsV2 = this.excavationItemsV2.filter(i => i.id !== item.id);
                this.renderExcavationItemsCards();
            });
            card.querySelector('.edit-excavation-item').addEventListener('click', () => {
                this.editingExcavationItemId = item.id;
                document.getElementById('excavation_item_description').value = item.desc;
                document.getElementById('excavation_item_area').value = item.area;
                document.getElementById('excavation_item_area').dataset.breakdown = item.areaBreakdown ? JSON.stringify(item.areaBreakdown) : '';
                document.getElementById('excavation-area-breakdown').innerHTML = item.areaBreakdown && item.areaBreakdown.length ? this.renderBreakdownHTML(item.areaBreakdown) : '';
                document.getElementById('excavation_item_volume').value = item.volume;
                document.getElementById('excavation_item_material').value = item.material;
                document.getElementById('excavation_item_depth').value = item.depth;
                document.getElementById('excavation_item_equipment').value = item.equipmentId;
                document.getElementById('excavation_item_machine_hours').value = item.machineHours;
                document.getElementById('excavation_item_disposal').value = item.disposal;
                document.getElementById('excavation_item_tip_fee').value = item.tipFee;
                const isThirdPartyEl = document.getElementById('excavation_item_3rd_party');
                if (isThirdPartyEl) isThirdPartyEl.checked = !!item.isThirdParty;
                addExcavationItemCardBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                cancelExcavationEditBtn.style.display = '';
            });
            cards.appendChild(card);
        });
    }

    renderThirdPartyExcavationList() {
        const list = document.getElementById('third-party-items-list');
        list.innerHTML = '';
        this.thirdPartyExcavationItems.forEach(item => {
            const el = document.createElement('div');
            el.className = 'third-party-item';
            el.innerHTML = `<strong>${item.material}</strong> @ $${item.costPerTonne}/t <span class="text-secondary">${item.notes}</span> <button type="button" class="btn btn-danger btn-sm" data-id="${item.id}">Remove</button>`;
            el.querySelector('button').addEventListener('click', () => {
                this.thirdPartyExcavationItems = this.thirdPartyExcavationItems.filter(i => i.id !== item.id);
                this.renderThirdPartyExcavationList();
            });
            list.appendChild(el);
        });
    }

    renderBreakdownHTML(entries) {
        if (!entries || !entries.length) return '';
        return '<ul>' + entries.map(e => `<li>${e.label ? e.label+': ' : ''}${e.length}mm × ${e.width}mm = <strong>${((e.length*e.width)/1000000).toFixed(2)} m²</strong></li>`).join('') + '</ul>';
    }

    // --- CUSTOMER SEARCH & CREATION LOGIC ---
    setupCustomerSearch() {
        const searchInput = document.getElementById('customer_search');
        const resultsDropdown = document.getElementById('customer-search-results');
        const detailsDisplay = document.getElementById('customer-details-display');
        const addNewBtn = document.getElementById('add-new-customer-btn');
        const clearBtn = document.getElementById('clear-customer-btn');
        const modal = document.getElementById('customer-modal');
        const closeModalBtn = document.getElementById('close-customer-modal');
        const saveCustomerBtn = document.getElementById('save-customer-btn');
        const customerForm = document.getElementById('customer-form');
        let searchTimeout = null;
        let lastSearch = '';
        let selectedCustomer = null;

        // Helper: API endpoint
        const apiUrl = this.getApiUrl();

        // Helper: Show/Hide modal
        function showModal() {
            modal.classList.remove('hidden');
        }
        function hideModal() {
            modal.classList.add('hidden');
            customerForm.reset();
        }

        // Helper: Render customer details
        function renderCustomerDetails(customer) {
            if (!customer) {
                detailsDisplay.classList.add('hidden');
                detailsDisplay.innerHTML = '';
                clearBtn.classList.add('hidden');
                return;
            }
            detailsDisplay.classList.remove('hidden');
            clearBtn.classList.remove('hidden');
            detailsDisplay.innerHTML = `
                <div><strong>${customer.firstName} ${customer.lastName}</strong></div>
                <div>${customer.email ? `<span><i class='fas fa-envelope'></i> ${customer.email}</span>` : ''}</div>
                <div>${customer.mobile ? `<span><i class='fas fa-phone'></i> ${customer.mobile}</span>` : ''}</div>
                <div>${customer.address ? `<span><i class='fas fa-map-marker-alt'></i> ${customer.address}</span>` : ''}</div>
                <div>${customer.company ? `<span><i class='fas fa-building'></i> ${customer.company}</span>` : ''}</div>
                <div>${customer.abn ? `<span>ABN: ${customer.abn}</span>` : ''}</div>
            `;
        }

        // Helper: Fill hidden fields for quote
        function fillQuoteFields(customer) {
            document.getElementById('selected_customer_id').value = customer._id || '';
            document.getElementById('project_firstname').value = customer.firstName || '';
            document.getElementById('project_lastname').value = customer.lastName || '';
            document.getElementById('project_email').value = customer.email || '';
            document.getElementById('project_mobile').value = customer.mobile || '';
            document.getElementById('project_address').value = customer.address || '';
            document.getElementById('project_apartment').value = customer.apartment || '';
            document.getElementById('project_city').value = customer.city || '';
            document.getElementById('project_postcode').value = customer.postcode || '';
            document.getElementById('project_state').value = customer.state || '';
            document.getElementById('project_country').value = customer.country || '';
            document.getElementById('project_company').value = customer.company || '';
            document.getElementById('project_abn').value = customer.abn || '';
            document.getElementById('project_phone').value = customer.phone || '';
            document.getElementById('project_fax').value = customer.fax || '';
        }

        // Helper: Clear all customer fields
        function clearCustomerFields() {
            selectedCustomer = null;
            renderCustomerDetails(null);
            fillQuoteFields({});
            searchInput.value = '';
            resultsDropdown.innerHTML = '';
            resultsDropdown.classList.remove('active');
        }

        // --- Search logic ---
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (searchTimeout) clearTimeout(searchTimeout);
            if (!query) {
                resultsDropdown.innerHTML = '';
                resultsDropdown.classList.remove('active');
                return;
            }
            searchTimeout = setTimeout(() => {
                if (query === lastSearch) return;
                lastSearch = query;
                fetch(`${apiUrl}/api/customers/search?q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        resultsDropdown.innerHTML = '';
                        if (Array.isArray(data) && data.length > 0) {
                            data.forEach(customer => {
                                const div = document.createElement('div');
                                div.className = 'search-result';
                                div.innerHTML = `<strong>${customer.firstName} ${customer.lastName}</strong> <span style='color:#888;'>${customer.email || customer.mobile || ''}</span>`;
                                div.addEventListener('click', () => {
                                    selectedCustomer = customer;
                                    renderCustomerDetails(customer);
                                    fillQuoteFields(customer);
                                    resultsDropdown.innerHTML = '';
                                    resultsDropdown.classList.remove('active');
                                    searchInput.value = `${customer.firstName} ${customer.lastName}`;
                                });
                                resultsDropdown.appendChild(div);
                            });
                        } else {
                            const noRes = document.createElement('div');
                            noRes.className = 'search-result no-results';
                            noRes.innerHTML = `No customer found. <span class='add-new-customer-link' style='color:#007bff;cursor:pointer;'><i class='fas fa-user-plus'></i> Create New Customer</span>`;
                            noRes.querySelector('.add-new-customer-link').addEventListener('click', () => {
                                showModal();
                                resultsDropdown.innerHTML = '';
                                resultsDropdown.classList.remove('active');
                            });
                            resultsDropdown.appendChild(noRes);
                        }
                        resultsDropdown.classList.add('active');
                    })
                    .catch(() => {
                        resultsDropdown.innerHTML = '<div class="search-result no-results">Error searching customers.</div>';
                        resultsDropdown.classList.add('active');
                    });
            }, 300);
        });

        // Hide dropdown on blur
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                resultsDropdown.classList.remove('active');
            }, 200);
        });

        // Show modal on button click
        addNewBtn.addEventListener('click', showModal);
        // Hide modal on close
        closeModalBtn.addEventListener('click', hideModal);

        // Save new customer
        saveCustomerBtn.addEventListener('click', () => {
            const formData = new FormData(customerForm);
            const customerData = {};
            for (let [key, value] of formData.entries()) {
                customerData[key.replace('customer_', '')] = value.trim();
            }
            // Basic validation
            if (!customerData.firstname || !customerData.lastname) {
                alert('First and last name are required.');
                return;
            }
            fetch(`${apiUrl}/api/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: customerData.firstname,
                    lastName: customerData.lastname,
                    email: customerData.email,
                    mobile: customerData.mobile,
                    address: customerData.address,
                    apartment: customerData.apartment,
                    city: customerData.city,
                    postcode: customerData.postcode,
                    state: customerData.state,
                    country: customerData.country,
                    company: customerData.company,
                    abn: customerData.abn,
                    phone: customerData.phone,
                    fax: customerData.fax
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data && data._id) {
                    selectedCustomer = data;
                    renderCustomerDetails(data);
                    fillQuoteFields(data);
                    searchInput.value = `${data.firstName} ${data.lastName}`;
                    hideModal();
                } else {
                    alert('Failed to save customer.');
                }
            })
            .catch(() => {
                alert('Failed to save customer.');
            });
        });

        // Clear customer selection
        clearBtn.addEventListener('click', clearCustomerFields);
    }

    setupAreaCalculator() {
        // State
        let areaCalcContext = null; // 'excavation' or 'import'
        let areaCalcEntries = [];
        let areaCalcEditIndex = null;
        // Elements
        const modal = document.getElementById('area-calc-modal');
        const openExcavationBtn = document.getElementById('excavation-area-calc-btn');
        const openImportBtn = document.getElementById('import-area-calc-btn');
        const closeBtn = document.getElementById('close-area-calc-modal');
        const addBtn = document.getElementById('area-calc-add-btn');
        const saveBtn = document.getElementById('area-calc-save-btn');
        const cancelBtn = document.getElementById('area-calc-cancel-btn');
        const form = document.getElementById('area-calc-form');
        const labelInput = document.getElementById('area-calc-label');
        const lengthInput = document.getElementById('area-calc-length');
        const widthInput = document.getElementById('area-calc-width');
        const listDiv = document.getElementById('area-calc-list');
        const totalSpan = document.getElementById('area-calc-total');
        // Open modal for context
        function openModal(context, breakdown) {
            areaCalcContext = context;
            areaCalcEntries = breakdown ? JSON.parse(JSON.stringify(breakdown)) : [];
            areaCalcEditIndex = null;
            renderList();
            labelInput.value = '';
            lengthInput.value = '';
            widthInput.value = '';
            modal.classList.remove('hidden');
        }
        // Close modal
        function closeModal() {
            modal.classList.add('hidden');
            areaCalcContext = null;
            areaCalcEntries = [];
            areaCalcEditIndex = null;
        }
        // Render list
        function renderList() {
            listDiv.innerHTML = '';
            let total = 0;
            areaCalcEntries.forEach((entry, i) => {
                const area = (entry.length * entry.width) / 1000000; // mm² to m²
                total += area;
                const div = document.createElement('div');
                div.className = 'area-calc-entry';
                div.innerHTML = `
                    <span><span class="area-calc-entry-label">${entry.label ? entry.label+':' : ''}</span> ${entry.length}mm × ${entry.width}mm = <strong>${area.toFixed(2)} m²</strong></span>
                    <span class="area-calc-entry-actions">
                        <button type="button" class="btn btn-secondary btn-xs" data-edit="${i}"><i class="fas fa-edit"></i></button>
                        <button type="button" class="btn btn-danger btn-xs" data-del="${i}"><i class="fas fa-trash"></i></button>
                    </span>
                `;
                div.querySelector('[data-edit]').onclick = () => {
                    areaCalcEditIndex = i;
                    labelInput.value = entry.label || '';
                    lengthInput.value = entry.length;
                    widthInput.value = entry.width;
                };
                div.querySelector('[data-del]').onclick = () => {
                    areaCalcEntries.splice(i,1);
                    renderList();
                };
                listDiv.appendChild(div);
            });
            totalSpan.textContent = total.toFixed(2);
        }
        // Add or edit entry
        addBtn.onclick = function(e) {
            e.preventDefault();
            if (!lengthInput || !widthInput) return;
            const label = labelInput ? labelInput.value.trim() : '';
            const length = parseFloat(lengthInput.value);
            const width = parseFloat(widthInput.value);
            if (!length || !width) return;
            const entry = { label, length, width };
            if (areaCalcEditIndex !== null) {
                areaCalcEntries[areaCalcEditIndex] = entry;
                areaCalcEditIndex = null;
            } else {
                areaCalcEntries.push(entry);
            }
            if (labelInput) labelInput.value = '';
            if (lengthInput) lengthInput.value = '';
            if (widthInput) widthInput.value = '';
            renderList();
        };
        // Save
        saveBtn.onclick = function() {
            const total = areaCalcEntries.reduce((sum,e)=>sum+(e.length*e.width)/1000000,0); // mm² to m²
            if (areaCalcContext === 'excavation') {
                document.getElementById('excavation_item_area').value = total > 0 ? total.toFixed(2) : '';
                document.getElementById('excavation-area-breakdown').innerHTML = areaCalcEntries.length ? AsphaltCalculator.prototype.renderBreakdownHTML(areaCalcEntries) : '';
                document.getElementById('excavation_item_area').dataset.breakdown = JSON.stringify(areaCalcEntries);
            } else if (areaCalcContext === 'import') {
                document.getElementById('new_import_area').value = total > 0 ? total.toFixed(2) : '';
                document.getElementById('import-area-breakdown').innerHTML = areaCalcEntries.length ? AsphaltCalculator.prototype.renderBreakdownHTML(areaCalcEntries) : '';
                document.getElementById('new_import_area').dataset.breakdown = JSON.stringify(areaCalcEntries);
            }
            closeModal();
        };
        // Cancel/close
        cancelBtn.onclick = closeBtn.onclick = function() { closeModal(); };
        // Open buttons
        if (openExcavationBtn) {
            openExcavationBtn.onclick = function() {
                let breakdown = [];
                try { breakdown = JSON.parse(document.getElementById('excavation_item_area').dataset.breakdown||'[]'); } catch(e){}
                openModal('excavation', breakdown);
            };
        }
        if (openImportBtn) {
            openImportBtn.onclick = function() {
                let breakdown = [];
                try { breakdown = JSON.parse(document.getElementById('new_import_area').dataset.breakdown||'[]'); } catch(e){}
                openModal('import', breakdown);
            };
        }
    }

    resetImportFormAndEditState() {
        this.editingImportMaterialId = null;
        if (this.addImportBtn) this.addImportBtn.style.display = '';
        if (this.saveImportEditBtn) this.saveImportEditBtn.style.display = 'none';
        if (this.cancelImportEditBtn) this.cancelImportEditBtn.style.display = 'none';
        document.getElementById('new_import_material').value = '';
        document.getElementById('new_import_area').value = '';
        document.getElementById('new_import_area').dataset.breakdown = '';
        document.getElementById('import-area-breakdown').innerHTML = '';
        document.getElementById('new_import_depth').value = '';
        document.getElementById('new_import_volume').value = '';
        document.getElementById('new_import_density').value = '';
        document.getElementById('new_import_cost_per_tonne').value = '30';
        document.getElementById('new_import_machine_hours').value = '0';
        document.getElementById('new_import_compaction').value = '';
        document.getElementById('new_import_tip_fee').value = '150';
    }

    saveImportMaterialEdit() {
        // Same logic as the edit/update part of addImportMaterial, but never adds a new item.
        const material = document.getElementById('new_import_material').value;
        const area = parseFloat(document.getElementById('new_import_area').value) || 0;
        let areaBreakdown = [];
        try { areaBreakdown = JSON.parse(document.getElementById('new_import_area').dataset.breakdown||'[]'); } catch(e){}
        const depth = parseFloat(document.getElementById('new_import_depth').value) || 0;
        let volume = parseFloat(document.getElementById('new_import_volume').value) || 0;
        const density = parseFloat(document.getElementById('new_import_density').value) || this.getMaterialDensity(material);
        const costPerTonne = parseFloat(document.getElementById('new_import_cost_per_tonne').value) || 30;
        const machineHours = parseFloat(document.getElementById('new_import_machine_hours').value) || 0;
        const compactionPercent = parseFloat(document.getElementById('new_import_compaction').value) || this.getMaterialCompactionFactor(material);
        const compactionFactor = 1 + (compactionPercent / 100);
        const tipFee = parseFloat(document.getElementById('new_import_tip_fee').value) || 150;
        if ((!area || !depth) && !volume) {
            this.showNotification('Please enter area and depth, or volume.', 'error');
            return;
        }
        let compactedVolume = area && depth ? area * (depth / 1000) : 0;
        let looseVolume = compactedVolume * compactionFactor;
        if (volume) {
            looseVolume = volume;
            compactedVolume = volume / compactionFactor;
        }
        volume = looseVolume;
        this.importMaterials.forEach(i => { i.id = Number(i.id); });
        const importItem = {
            id: this.editingImportMaterialId,
            material: material,
            area: area,
            areaBreakdown,
            depth: depth,
            volume: volume,
            density: density,
            costPerTonne: costPerTonne,
            machineHours: machineHours,
            compactedVolume: compactedVolume,
            looseVolume: looseVolume,
            compactionPercent: compactionPercent,
            tipFee: tipFee
        };
        const idx = this.importMaterials.findIndex(i => Number(i.id) === Number(this.editingImportMaterialId));
        if (idx !== -1) {
            this.importMaterials[idx] = importItem;
            this.showNotification('Import material updated!', 'success');
        } else {
            this.showNotification('Error: Could not find item to update. See console for details.', 'error');
            return;
        }
        this.refreshImportMaterials();
        this.resetImportFormAndEditState();
    }

    setupProjectImagesSection() {
        const imageInput = document.getElementById('project_images');
        const previewList = document.getElementById('image-preview-list');
        this.projectImages = [];
        if (!imageInput || !previewList) return;
        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                // Only add if not already present (by name + size)
                if (!this.projectImages.some(img => img.file.name === file.name && img.file.size === file.size)) {
                    this.projectImages.push({ file, comment: '' });
                }
            });
            this.renderImagePreviewList();
            imageInput.value = '';
        });
        // --- Annotation Integration ---
        let fabricCanvas = null;
        let currentAnnotateIdx = null;
        const annotationModal = document.getElementById('annotation-modal');
        const annotationCanvas = document.getElementById('annotation-canvas');
        const closeAnnotationModalBtn = document.getElementById('close-annotation-modal');
        const saveAnnotationBtn = document.getElementById('save-annotation-btn');
        const drawArrowBtn = document.getElementById('draw-arrow-btn');
        const drawRectBtn = document.getElementById('draw-rect-btn');
        const drawTextBtn = document.getElementById('draw-text-btn');
        const drawFreehandBtn = document.getElementById('draw-freehand-btn');
        const freehandBrushSizeInput = document.getElementById('freehand-brush-size');
        const freehandBrushSizeValue = document.getElementById('freehand-brush-size-value');
        const deleteObjectBtn = document.getElementById('annotation-delete-object-btn');
        const freehandBrushColorInput = document.getElementById('freehand-brush-color');
        const annotationTextColorInput = document.getElementById('annotation-text-color');
        // Dedicated annotation key handler (avoid global shadowing)
        function annotationDeleteKeyHandler(e) {
            if (!annotationModal.classList.contains('hidden') && (e.key === 'Delete' || e.key === 'Backspace')) {
                if (fabricCanvas) {
                    const active = fabricCanvas.getActiveObject();
                    if (active) {
                        fabricCanvas.remove(active);
                        fabricCanvas.discardActiveObject();
                        fabricCanvas.requestRenderAll();
                        hideDeleteBtn();
                        e.preventDefault();
                    }
                }
            }
        }
        // Helper: open annotation modal for image idx
        const openAnnotationModal = (imgObj, idx) => {
            annotationModal.classList.remove('hidden');
            if (!fabricCanvas) {
                fabricCanvas = new fabric.Canvas('annotation-canvas');
            } else {
                fabricCanvas.clear();
                fabricCanvas.backgroundImage = null;
            }
            currentAnnotateIdx = idx;
            // If annotation JSON exists, load it; otherwise, load image as background
            if (imgObj.annotationJson) {
                fabricCanvas.loadFromJSON(imgObj.annotationJson, () => {
                    fabricCanvas.renderAll();
                });
            } else {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    fabric.Image.fromURL(ev.target.result, function(img) {
                        // Always fit image within 600x400 and center in canvas
                        const maxWidth = 600;
                        const maxHeight = 400;
                        const scaleX = maxWidth / img.width;
                        const scaleY = maxHeight / img.height;
                        const scale = Math.min(scaleX, scaleY, 1);
                        const displayWidth = img.width * scale;
                        const displayHeight = img.height * scale;
                        const canvasWidth = annotationCanvas.width;
                        const canvasHeight = annotationCanvas.height;
                        const left = (canvasWidth - displayWidth) / 2;
                        const top = (canvasHeight - displayHeight) / 2;
                        img.set({
                            left: left,
                            top: top,
                            scaleX: scale,
                            scaleY: scale,
                            selectable: false,
                            evented: false
                        });
                        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
                    });
                };
                reader.readAsDataURL(imgObj.file);
            }
            // Default to selection mode
            fabricCanvas.isDrawingMode = false;
            // Hide delete button initially
            if (deleteObjectBtn) deleteObjectBtn.style.display = 'none';
            // Listen for selection events
            fabricCanvas.on('selection:created', showDeleteBtn);
            fabricCanvas.on('selection:updated', showDeleteBtn);
            fabricCanvas.on('selection:cleared', hideDeleteBtn);
            // Listen for delete button click
            if (deleteObjectBtn) {
                deleteObjectBtn.onclick = function() {
                    const active = fabricCanvas.getActiveObject();
                    if (active) {
                        fabricCanvas.remove(active);
                        fabricCanvas.discardActiveObject();
                        fabricCanvas.requestRenderAll();
                        hideDeleteBtn();
                    }
                };
            }
            // Register annotation-specific keydown event
            document.addEventListener('keydown', annotationDeleteKeyHandler);
        };
        // Helper to show/hide delete button
        function showDeleteBtn() {
            const active = fabricCanvas.getActiveObject();
            if (active && deleteObjectBtn && annotationModal.classList.contains('hidden') === false) {
                // Use the object's transform box top-right corner (oCoords.tr)
                if (active.oCoords && active.oCoords.tr) {
                    const tr = active.oCoords.tr;
                    // Canvas element and its position
                    const canvasEl = fabricCanvas.getElement();
                    // Find the modal body (relative parent)
                    const modalBody = annotationModal.querySelector('.modal-body');
                    const modalBodyRect = modalBody.getBoundingClientRect();
                    const canvasRect = canvasEl.getBoundingClientRect();
                    // Calculate offset of canvas within modal body
                    const offsetLeft = canvasRect.left - modalBodyRect.left;
                    const offsetTop = canvasRect.top - modalBodyRect.top;
                    // Calculate scale factors between canvas internal size and displayed size
                    const scaleX = canvasRect.width / canvasEl.width;
                    const scaleY = canvasRect.height / canvasEl.height;
                    // Place button just to the right of the top-right handle, vertically centered with the handle
                    const btnSize = 32; // px, matches .annotation-delete-btn
                    const offset = 4; // px, gap between handle and button
                    let btnLeft = offsetLeft + tr.x * scaleX + offset;
                    let btnTop = offsetTop + tr.y * scaleY - btnSize / 2;
                    // Clamp to canvas area (keep button visible)
                    btnLeft = Math.min(offsetLeft + canvasRect.width - btnSize, Math.max(offsetLeft, btnLeft));
                    btnTop = Math.min(offsetTop + canvasRect.height - btnSize, Math.max(offsetTop, btnTop));
                    // Set button position relative to modal body
                    deleteObjectBtn.style.display = 'block';
                    deleteObjectBtn.style.position = 'absolute';
                    deleteObjectBtn.style.left = btnLeft + 'px';
                    deleteObjectBtn.style.top = btnTop + 'px';
                    deleteObjectBtn.style.zIndex = 1002;
                } else {
                    // Fallback: use bounding box as before
                    const rect = active.getBoundingRect();
                    const canvasEl = fabricCanvas.getElement();
                    const modalBody = annotationModal.querySelector('.modal-body');
                    const modalBodyRect = modalBody.getBoundingClientRect();
                    const canvasRect = canvasEl.getBoundingClientRect();
                    const offsetLeft = canvasRect.left - modalBodyRect.left;
                    const offsetTop = canvasRect.top - modalBodyRect.top;
                    const scaleX = canvasRect.width / canvasEl.width;
                    const scaleY = canvasRect.height / canvasEl.height;
                    const btnSize = 32;
                    const offset = 4;
                    let btnLeft = offsetLeft + (rect.left + rect.width) * scaleX + offset;
                    let btnTop = offsetTop + rect.top * scaleY - btnSize / 2;
                    btnLeft = Math.min(offsetLeft + canvasRect.width - btnSize, Math.max(offsetLeft, btnLeft));
                    btnTop = Math.min(offsetTop + canvasRect.height - btnSize, Math.max(offsetTop, btnTop));
                    deleteObjectBtn.style.display = 'block';
                    deleteObjectBtn.style.position = 'absolute';
                    deleteObjectBtn.style.left = btnLeft + 'px';
                    deleteObjectBtn.style.top = btnTop + 'px';
                    deleteObjectBtn.style.zIndex = 1002;
                }
            }
        }
        function hideDeleteBtn() {
            if (deleteObjectBtn) deleteObjectBtn.style.display = 'none';
        }
        // Also reposition button when object is moved/scaled/rotated
        function updateDeleteBtnOnObjectChange() {
            if (deleteObjectBtn && deleteObjectBtn.style.display === 'block') {
                showDeleteBtn();
            }
        }
        if (fabricCanvas) {
            fabricCanvas.on('object:moving', updateDeleteBtnOnObjectChange);
            fabricCanvas.on('object:scaling', updateDeleteBtnOnObjectChange);
            fabricCanvas.on('object:rotating', updateDeleteBtnOnObjectChange);
        }
        // Close modal
        if (closeAnnotationModalBtn) closeAnnotationModalBtn.onclick = function() {
            annotationModal.classList.add('hidden');
            if (fabricCanvas) {
                fabricCanvas.clear();
                fabricCanvas.backgroundImage = null;
            }
            // Remove event listeners to avoid duplicates
            if (fabricCanvas) {
                fabricCanvas.off('selection:created', showDeleteBtn);
                fabricCanvas.off('selection:updated', showDeleteBtn);
                fabricCanvas.off('selection:cleared', hideDeleteBtn);
            }
            document.removeEventListener('keydown', annotationDeleteKeyHandler);
            hideDeleteBtn();
        };
        // Save annotation
        if (saveAnnotationBtn) saveAnnotationBtn.onclick = () => {
            if (!fabricCanvas) return;
            if (currentAnnotateIdx !== null) {
                const name = this.projectImages[currentAnnotateIdx].file.name.replace(/(\.[^.]+)?$/, '_annotated.png');
                // Save annotation JSON
                const annotationJson = fabricCanvas.toJSON();
                fabricCanvas.getElement().toBlob(blob => {
                    if (blob) {
                        const annotatedFile = new File([blob], name, { type: 'image/png' });
                        // If the current image is already an annotation (has annotationJson), update it in place
                        if (this.projectImages[currentAnnotateIdx].annotationJson) {
                            this.projectImages[currentAnnotateIdx].file = annotatedFile;
                            this.projectImages[currentAnnotateIdx].annotationJson = annotationJson;
                            this.projectImages[currentAnnotateIdx].comment = 'Annotated image';
                        } else {
                            // Otherwise, add a new annotated image
                            this.projectImages.push({ file: annotatedFile, comment: 'Annotated image', annotationJson });
                        }
                        this.renderImagePreviewList();
                        annotationModal.classList.add('hidden');
                        if (fabricCanvas) {
                            fabricCanvas.clear();
                            fabricCanvas.backgroundImage = null;
                        }
                    }
                }, 'image/png');
            }
        };
        // Drawing tools
        if (drawRectBtn) drawRectBtn.onclick = () => {
            fabricCanvas.isDrawingMode = false;
            const rect = new fabric.Rect({
                left: 100, top: 100, width: 120, height: 80, fill: 'rgba(255,255,0,0.2)', stroke: 'red', strokeWidth: 2 });
            fabricCanvas.add(rect);
        };
        if (drawTextBtn) drawTextBtn.onclick = () => {
            fabricCanvas.isDrawingMode = false;
            // Use the selected text color for new text
            let color = annotationTextColorInput ? annotationTextColorInput.value : '#000000';
            const text = new fabric.IText('Text', { left: 150, top: 150, fill: color, fontSize: 24 });
            fabricCanvas.add(text);
        };
        // Update selected text color when color picker changes
        if (annotationTextColorInput) {
            annotationTextColorInput.addEventListener('input', () => {
                if (fabricCanvas) {
                    const active = fabricCanvas.getActiveObject();
                    if (active && active.type === 'i-text') {
                        active.set('fill', annotationTextColorInput.value);
                        fabricCanvas.requestRenderAll();
                    }
                }
            });
        }
        if (drawFreehandBtn) drawFreehandBtn.onclick = () => {
            fabricCanvas.isDrawingMode = true;
            // Set brush size to slider value
            if (fabricCanvas.freeDrawingBrush && freehandBrushSizeInput) {
                fabricCanvas.freeDrawingBrush.width = parseInt(freehandBrushSizeInput.value, 10) || 5;
            }
            // Set brush color to color picker value
            if (fabricCanvas.freeDrawingBrush && freehandBrushColorInput) {
                fabricCanvas.freeDrawingBrush.color = freehandBrushColorInput.value || '#000000';
            }
        };
        // Update brush size when slider changes
        if (freehandBrushSizeInput && freehandBrushSizeValue) {
            freehandBrushSizeInput.addEventListener('input', () => {
                freehandBrushSizeValue.textContent = freehandBrushSizeInput.value;
                if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
                    fabricCanvas.freeDrawingBrush.width = parseInt(freehandBrushSizeInput.value, 10) || 5;
                }
            });
        }
        // Update brush color when color picker changes
        if (freehandBrushColorInput) {
            freehandBrushColorInput.addEventListener('input', () => {
                if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
                    fabricCanvas.freeDrawingBrush.color = freehandBrushColorInput.value || '#000000';
                }
            });
        }
        if (drawArrowBtn) drawArrowBtn.onclick = () => {
            fabricCanvas.isDrawingMode = false;
            // Draw a simple arrow (line + triangle)
            const line = new fabric.Line([200, 200, 300, 200], { stroke: 'green', strokeWidth: 4 });
            const triangle = new fabric.Triangle({ left: 295, top: 190, width: 20, height: 20, angle: 90, fill: 'green' });
            const group = new fabric.Group([line, triangle], { left: 200, top: 200 });
            fabricCanvas.add(group);
        };
        // Render preview list with annotate button
        this.renderImagePreviewList = () => {
            previewList.innerHTML = '';
            this.projectImages.forEach((imgObj, idx) => {
                const reader = new FileReader();
                const wrapper = document.createElement('div');
                wrapper.className = 'image-preview-item';
                reader.onload = (ev) => {
                    wrapper.innerHTML = `
                        <div class="image-thumb-wrapper">
                            <img src="${ev.target.result}" class="image-thumb" alt="Image Preview">
                        </div>
                        <textarea class="image-comment" placeholder="Add a comment (optional)">${imgObj.comment || ''}</textarea>
                        <button type="button" class="btn btn-secondary btn-xs annotate-image-btn">${imgObj.annotationJson ? 'Edit Annotation' : 'Annotate'}</button>
                        <button type="button" class="btn btn-danger btn-xs remove-image-btn">Remove</button>
                    `;
                    wrapper.querySelector('.image-comment').addEventListener('input', (e) => {
                        this.projectImages[idx].comment = e.target.value;
                    });
                    wrapper.querySelector('.remove-image-btn').addEventListener('click', () => {
                        this.projectImages.splice(idx, 1);
                        this.renderImagePreviewList();
                    });
                    wrapper.querySelector('.annotate-image-btn').addEventListener('click', () => {
                        openAnnotationModal(imgObj, idx);
                    });
                };
                reader.readAsDataURL(imgObj.file);
                previewList.appendChild(wrapper);
            });
        };
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

// Ensure cancelExcavationEditBtn is always present and works
let addExcavationItemCardBtn = document.getElementById('add-excavation-item-card');
let cancelExcavationEditBtn = document.getElementById('cancel-excavation-edit-btn');
if (!cancelExcavationEditBtn) {
    cancelExcavationEditBtn = document.createElement('button');
    cancelExcavationEditBtn.type = 'button';
    cancelExcavationEditBtn.className = 'btn btn-secondary';
    cancelExcavationEditBtn.textContent = 'Cancel';
    cancelExcavationEditBtn.style.marginLeft = '0.5em';
    cancelExcavationEditBtn.style.display = 'none';
    addExcavationItemCardBtn.parentNode.appendChild(cancelExcavationEditBtn);
    cancelExcavationEditBtn.id = 'cancel-excavation-edit-btn';
}
function resetExcavationFormAndEditState() {
    window.app.editingExcavationItemId = null;
    addExcavationItemCardBtn.innerHTML = '<i class="fas fa-plus"></i> Add Excavation Item';
    cancelExcavationEditBtn.style.display = 'none';
    document.getElementById('excavation_item_description').value = '';
    document.getElementById('excavation_item_area').value = '';
    document.getElementById('excavation_item_area').dataset.breakdown = '';
    document.getElementById('excavation-area-breakdown').innerHTML = '';
    document.getElementById('excavation_item_volume').value = '';
    document.getElementById('excavation_item_material').value = '';
    document.getElementById('excavation_item_depth').value = '';
    document.getElementById('excavation_item_equipment').value = '';
    document.getElementById('excavation_item_machine_hours').value = '';
    document.getElementById('excavation_item_disposal').value = 'Reuse';
    document.getElementById('excavation_item_tip_fee').value = '150';
    const isThirdPartyEl = document.getElementById('excavation_item_3rd_party');
    if (isThirdPartyEl) isThirdPartyEl.checked = false;
}
cancelExcavationEditBtn.onclick = resetExcavationFormAndEditState;

addExcavationItemCardBtn.onclick = function() {
    const desc = document.getElementById('excavation_item_description').value.trim();
    const area = parseFloat(document.getElementById('excavation_item_area').value) || 0;
    let areaBreakdown = [];
    try { areaBreakdown = JSON.parse(document.getElementById('excavation_item_area').dataset.breakdown||'[]'); } catch(e){}
    const volume = parseFloat(document.getElementById('excavation_item_volume').value) || 0;
    const material = document.getElementById('excavation_item_material').value;
    const depth = parseFloat(document.getElementById('excavation_item_depth').value) || 0;
    const equipmentId = document.getElementById('excavation_item_equipment').value;
    const machineHours = parseFloat(document.getElementById('excavation_item_machine_hours').value) || 0;
    const disposal = document.getElementById('excavation_item_disposal').value;
    const tipFee = parseFloat(document.getElementById('excavation_item_tip_fee').value) || 0;
    const isThirdPartyEl = document.getElementById('excavation_item_3rd_party');
    const isThirdParty = isThirdPartyEl ? isThirdPartyEl.checked : false;
    // Validation: require (area+depth) or volume
    if ((!area || !depth) && !volume) {
        window.app.showNotification('Please enter area and depth, or volume.', 'error');
        return;
    }
    // Calculate volume
    let finalVolume = volume;
    if (!volume && area && depth) {
        finalVolume = area * (depth / 1000);
    }
    const item = {
        id: window.app.editingExcavationItemId || Date.now(),
        desc, area, areaBreakdown, volume: finalVolume, material, depth, equipmentId, machineHours, disposal, tipFee, isThirdParty
    };
    if (window.app.editingExcavationItemId) {
        // Update existing
        const idx = window.app.excavationItemsV2.findIndex(i => i.id === window.app.editingExcavationItemId);
        if (idx !== -1) window.app.excavationItemsV2[idx] = item;
        window.app.showNotification('Excavation item updated!', 'success');
    } else {
        window.app.excavationItemsV2.push(item);
        window.app.showNotification('Excavation item added successfully!', 'success');
    }
    window.app.renderExcavationItemsCards();
    resetExcavationFormAndEditState();
};

// ... existing code ...
        // Listen for Delete/Backspace key
        function handleDeleteKey(e) {
            if (!annotationModal.classList.contains('hidden') && (e.key === 'Delete' || e.key === 'Backspace')) {
                if (fabricCanvas) {
                    const active = fabricCanvas.getActiveObject();
                    if (active) {
                        fabricCanvas.remove(active);
                        fabricCanvas.discardActiveObject();
                        fabricCanvas.requestRenderAll();
                        hideDeleteBtn();
                        e.preventDefault();
                    }
                }
            }
        }
        // Register keydown event when modal opens
        document.addEventListener('keydown', handleDeleteKey);
        // Remove event listener when modal closes
        if (closeAnnotationModalBtn) closeAnnotationModalBtn.onclick = function() {
            annotationModal.classList.add('hidden');
            if (fabricCanvas) {
                fabricCanvas.clear();
                fabricCanvas.backgroundImage = null;
            }
            // Remove event listeners to avoid duplicates
            if (fabricCanvas) {
                fabricCanvas.off('selection:created', showDeleteBtn);
                fabricCanvas.off('selection:updated', showDeleteBtn);
                fabricCanvas.off('selection:cleared', hideDeleteBtn);
            }
            document.removeEventListener('keydown', handleDeleteKey);
            hideDeleteBtn();
        };
// ... existing code ...
