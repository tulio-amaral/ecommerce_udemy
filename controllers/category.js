import Category from '../models/Category.js';
import errorHandler from '../helpers/dbErrorHandler.js';

export function categoryById (request, response, next, id) {
  Category.findById(id).exec((err, category) => {
    if(err || !category) {
      return response.status(400).json({
        error: 'Category does not exist'
      })
    }
    request.category = category;
    next();
  })
}
export function create(request, response) {
  const category = new Category(request.body);
  category.save((err, data) => {
    if (err) {
      return response.status(400).json({
        error: errorHandler(err),
      });
    }
    response.json({ data });
  });
}

export function read(request, response) {
  return response.json(request.category);
}

export function list(request, response){
  Category.find().exec((err, data) => {
    if(err) {
      return response.status(400).json({
        error: errorHandler(err)
      })
    }

    response.json(data)
  })
}

export function update(request, response){
  const category = request.category;
  category.name = request.body.name;
  category.save((err, data) => {
    if(err) {
      return response.status(400).json({
        error: errorHandler(err)
      })
    }
    response.json(data);
  })
}

export function remove(request, response){
  const category = request.category;
  category.remove((err, data) => {
    if(err) {
      return response.status(400).json({
        error: errorHandler(err)
      })
    }
    response.json({
      message: 'Category deleted!'
    });
  })
}


export default { categoryById, create, read, list, update, remove };
