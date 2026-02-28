const mongoose = require('mongoose');

const contentConfigSchema = mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    index: true 
  },
  
  name: { 
    type: String, 
    required: true 
  },
  
  description: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('ContentConfig', contentConfigSchema);