import User from '../models/User.js';

export function userByID(request, response, next, id) {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return response.status(400).json({
        error: 'User not found',
      });
    }
    request.profile = user;
    next();
  });
}

export function read(request, response) {
  request.profile.hashed_password = undefined;
  request.profile.salt = undefined;

  return response.json(request.profile);
}

export function update(request, response) {
  User.findOneAndUpdate(
    { _id: request.profile._id }, 
    { $set:request.body }, 
    { new:true },
    (err, user) => {
      if(err) {
        return response.status(400).json({
          error: 'You are not authorized to perform this action'
        })
      }

      user.hashed_password = undefined;
      user.salt = undefined;

      response.json(user);
    }
  )
}

export default { userByID, read, update };
