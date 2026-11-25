export const notFound = (req, res) => {
  res.status(404).json({ message: `Route introuvable : ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.statusCode || (err.name === 'CastError' ? 400 : 500);
  const message = err.name === 'ValidationError'
    ? Object.values(err.errors).map((item) => item.message).join(', ')
    : err.message || 'Erreur serveur';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
};
