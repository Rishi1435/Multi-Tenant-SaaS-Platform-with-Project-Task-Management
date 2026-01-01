const validate = (schema) => (req, res, next) => {
  // We can add Zod/Joi validation here later
  // For now, it's a pass-through
  next();
};
module.exports = validate;