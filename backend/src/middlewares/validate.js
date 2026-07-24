export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    return res.status(400).json({ success: false, error: error.message });
  }
};
