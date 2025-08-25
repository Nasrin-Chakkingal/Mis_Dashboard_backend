// src/middleware/notFound.js
export default (req, res, next) => {
  res.status(404).json({ error: 'Not found' });
};

// src/middleware/errorHandler.js
export default (err, req, res, next) => {
  console.error('❌', err);
  res.status(500).json({ error: 'Internal Server Error' });
};
