const Resource = require('../models/resource');

// Get all resources
exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

// Create a new resource
exports.createResource = async (req, res) => {
  const { name, description, link, tag_name, icon_url, category } = req.body;

  const resource = new Resource({
    name,
    description,
    link,
    tag_name,
    icon_url,
    category
  });

  try {
    const newResource = await resource.save();
    res.status(201).json(newResource);
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error creating resource', err});
  }
};


exports.getAllResourceName = async (req, res) => {
  try {
    const resources = await Resource.find();
    const resourceNames = resources.map(resource => resource.name);
    res.json(resourceNames);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching resource names' });
  }
};