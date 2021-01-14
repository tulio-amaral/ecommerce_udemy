import jwt from 'jsonwebtoken'; // to generate signed token
import expressJwt from 'express-jwt'; // for authorization check

import User from '../models/User.js';
import errorHandler from '../helpers/dbErrorHandler.js';

export function signUp(request, response) {
  const user = new User(request.body);
  user.save((err, user) => {
    if (err) {
      return response.status(400).json({
        err: errorHandler(err),
      });
    }

    user.salt = undefined;
    user.hashed_password = undefined;

    response.json({
      user,
    });
  });
}

export function signIn(request, response) {
  // find the user by e-mail
  const { email, password } = request.body;
  User.findOne({ email }, (error, user) => {
    if (error || !user) {
      return response.status(400).json({
        error: 'User with this e-mail does not exist. Check your credentials',
      });
    }
    // if user is found, check if password matches
    // create authenticate method in user model
    if (!user.authenticate(password)) {
      return response.status(401).json({
        error: "e-mail and password don't match",
      });
    }

    // generate a signed token with user id and secret
    const token = jwt.sign({
      _id: user._id,
    }, process.env.JWT_SECRET);

    // persist the token as 't' in cookie with expiry date
    response.cookie('t', token, { expire: new Date() + 9999 });

    // return response with user and token to frontend client
    const {
      _id, name, email, role,
    } = user;
    return response.json({
      token,
      user: {
        _id, email, name, role,
      },
    });
  });
}

export function signOut(request, response) {
  response.clearCookie('t');
  response.json({ message: 'Sign out sucessful' });
}

export const requireSignIn = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'], // added later
  userProperty: 'auth',
});

export function isAuth(request, response, next) {
  const user = request.profile && request.auth && request.profile._id == request.auth._id;
  if (!user) {
    return response.status(403).json({
      error: 'Access denied',
    });
  }
  next();
}

export function isAdmin(request, response, next) {
  if (request.profile.role === 0) {
    return response.status(403).json({
      error: 'Admin only! Access denied',
    });
  }
  next();
}

export default {
  signUp, signIn, signOut, requireSignIn, isAuth, isAdmin,
};
