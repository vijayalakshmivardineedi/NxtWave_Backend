const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
  tag_name: { type: String, required: true },
  icon_url: { type: String, required: true },
  category: { type: String, required: true },
 });s

module.exports = mongoose.model('Resource', ResourceSchema);
