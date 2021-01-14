const userSignUpValidator = (request, response, next) => {
  request.check('name', 'Name is required').notEmpty();
  request
    .check('email', 'e-mail must be between 3 to 32 characters')
    .matches(/.+\@.+\..+/)
    .withMessage('e-mail must contain @')
    .isLength({
      min: 4,
      max: 32,
    });

  request.check('password', 'Password is required').notEmpty();
  request.check('password')
    .isLength({ min: 6 })
    .withMessage('Password must contain at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number');

  const errors = request.validationErrors();

  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return response.status(400).json({ error: firstError });
  }

  next();
};

export default userSignUpValidator;
