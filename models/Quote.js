const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  // Client Information
  clientInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    apartment: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    postcode: { type: String, required: true, trim: true },
    state: { type: String, default: 'Queensland', trim: true },
    country: { type: String, default: 'Australia', trim: true }
  },

  // Company Information
  companyInfo: {
    name: { type: String, trim: true },
    abn: { type: String, trim: true },
    phone: { type: String, trim: true },
    fax: { type: String, trim: true }
  },

  // Service Details
  serviceInfo: {
    type: { type: String, required: true, trim: true },
    trafficControl: { type: String, enum: ['Yes', 'No'], default: 'No' },
    trafficControlHours: { type: Number, min: 0 },
    trafficControlWorkers: { type: Number, min: 0 },
    wasteDisposal: { type: String, enum: ['Yes', 'No'], default: 'No' },
    wasteType: { type: String, trim: true },
    wasteLoads: { type: Number, min: 0 }
  },

  // Project Details
  projectInfo: {
    quoteNumber: { type: String, required: true, unique: true, trim: true },
    validFor: { type: Number, default: 30, min: 1, max: 365 },
    profitMargin: { type: Number, default: 40, min: 0, max: 100 },
    taxRate: { type: Number, default: 10, min: 0, max: 50 }
  },

  // Materials
  materials: {
    asphalt: {
      area: { type: Number, required: true, min: 0 },
      depth: { type: Number, required: true, min: 0 },
      costPerTonne: { type: Number, default: 190, min: 0 },
      density: { type: Number, default: 2400, min: 0 }
    },
    foundation: {
      area: { type: Number, default: 0, min: 0 },
      depth: { type: Number, default: 0, min: 0 },
      costPerTonne: { type: Number, default: 30, min: 0 },
      density: { type: Number, default: 1800, min: 0 }
    }
  },

  // Labor
  labor: {
    workers: { type: Number, default: 2, min: 1 },
    hours: { type: Number, default: 2, min: 0 },
    hourlyRate: { type: Number, default: 30, min: 0 },
    superannuation: { type: Number, default: 11, min: 0, max: 100 },
    workersCompensation: { type: Number, default: 2, min: 0, max: 100 },
    otherCosts: { type: Number, default: 2, min: 0, max: 100 }
  },

  // Additional Labor Items
  otherLaborItems: [{
    type: { type: String, required: true, trim: true },
    hours: { type: Number, required: true, min: 0 },
    costPerHour: { type: Number, required: true, min: 0 },
    addGst: { type: Boolean, default: false }
  }],

  // Consumables
  consumables: {
    paint: {
      quantity: { type: Number, default: 1, min: 0 },
      cost: { type: Number, default: 3.99, min: 0 }
    },
    petrol: {
      litres: { type: Number, default: 0, min: 0 },
      costPerLitre: { type: Number, default: 2, min: 0 }
    },
    diesel: {
      litres: { type: Number, default: 0, min: 0 },
      costPerLitre: { type: Number, default: 2, min: 0 }
    },
    gas: {
      litres: { type: Number, default: 0, min: 0 },
      costPerLitre: { type: Number, default: 1.5, min: 0 }
    }
  },

  // Equipment
  equipment: {
    compactorPlate: { type: Number, default: 0, min: 0 },
    rammerCompactor: { type: Number, default: 0, min: 0 },
    leafBlower: { type: Number, default: 0, min: 0 },
    concreteCutter: { type: Number, default: 0, min: 0 },
    oneTRoller: { type: Number, default: 0, min: 0 },
    twoTRoller: { type: Number, default: 0, min: 0 },
    skidsteer: { type: Number, default: 0, min: 0 },
    mrTruck: { type: Number, default: 0, min: 0 },
    hrTruck: { type: Number, default: 0, min: 0 },
    trailer: { type: Number, default: 0, min: 0 },
    car: { type: Number, default: 0, min: 0 }
  },

  // Notes
  notes: { type: String, trim: true },

  // Calculated Results
  calculations: {
    asphaltWeight: { type: Number, min: 0 },
    asphaltCost: { type: Number, min: 0 },
    asphaltTruckLoads: { type: Number, min: 0 },
    baseWeight: { type: Number, min: 0 },
    baseCost: { type: Number, min: 0 },
    baseTruckLoads: { type: Number, min: 0 },
    emulsionRequired: { type: Number, min: 0 },
    emulsionCost: { type: Number, min: 0 },
    totalLaborCost: { type: Number, min: 0 },
    totalOtherLaborCost: { type: Number, min: 0 },
    equipmentDepreciation: { type: Number, min: 0 },
    consumablesCost: { type: Number, min: 0 },
    totalCosts: { type: Number, min: 0 },
    quote: { type: Number, min: 0 },
    profit: { type: Number, min: 0 },
    totalWithTax: { type: Number, min: 0 },
    costPerSquareMeter: { type: Number, min: 0 },
    quotePerSquareMeter: { type: Number, min: 0 },
    profitPerSquareMeter: { type: Number, min: 0 }
  },

  // Add these fields to the schema root
  formData: { type: Object, required: true }, // Store all raw form fields and dynamic arrays
  results: { type: Object, required: true },  // Store calculation results for preview

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full client name
QuoteSchema.virtual('clientInfo.fullName').get(function() {
  return `${this.clientInfo.firstName} ${this.clientInfo.lastName}`;
});

// Virtual for full address
QuoteSchema.virtual('clientInfo.fullAddress').get(function() {
  const parts = [
    this.clientInfo.address,
    this.clientInfo.apartment,
    this.clientInfo.city,
    this.clientInfo.postcode,
    this.clientInfo.state,
    this.clientInfo.country
  ].filter(Boolean);
  return parts.join(', ');
});

// Indexes for better search performance
QuoteSchema.index({ 'clientInfo.firstName': 1, 'clientInfo.lastName': 1 });
QuoteSchema.index({ 'projectInfo.quoteNumber': 1 });
QuoteSchema.index({ 'serviceInfo.type': 1 });
QuoteSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
QuoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Quote', QuoteSchema); 