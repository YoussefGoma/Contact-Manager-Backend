import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 20
  },
  address: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200
  },
  notes: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  lockedBy: { 
    type: String, 
    default: null 
  },
  lockedAt: { 
    type: Date, 
    default: null 
  }
}, {
  timestamps: true
});

contactSchema.index({ name: 1 });
contactSchema.index({ phone: 1 });
contactSchema.index({ createdAt: -1 });

export const Contact = mongoose.model('Contact', contactSchema);