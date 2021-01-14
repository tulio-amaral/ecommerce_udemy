import formidable from 'formidable'
import _ from 'lodash'
import fs from 'fs'

import Product from '../models/Product.js';
import errorHandler from '../helpers/dbErrorHandler.js';

export function create(request, response) {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(request, (err, fields, files) => {
    if(err) {
      return response.status(400).json({
        error: ' Image could not be uploaded'
      })
    }

    //check for all fields
    const { name, description, price, category, quantity, shipping } = fields;

    if(!name || !description|| !price || !category || !quantity || !shipping) {
      response.status(400).json({
        error: 'All fields are required'
      })
    }

    let product = new Product(fields);

    if(files.photo) {
      if(files.photo.size > 1000000) {
        return response.status(400).json({
          error: 'Max file size is 1MB'
        })
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, result) => {
      if (err) {
        return response.status(400).json({
          error: errorHandler(err),
        });
      }

      response.json( result );
    });

  })
}

export function productById(request, response, next, id){
  Product.findById(id).exec((err, product) => {
    if(err || !product) {
      return response.status(400).json({
        error: 'Product not found'
      })
    }

    request.product = product
    next()
  })
}

export function read(request, response) {
  request.product.photo = undefined;
  return response.json(request.product);
}



export function remove(request, response) {
  let product = request.product
  product.remove((err) => {
    if(err) {
      return response.status(400).json({
        error: errorHandler(err)
      })
    }
    response.json({
      message: 'Product deleted with success!'
    })
  })
}

export function update(request, response) {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(request, (err, fields, files) => {
    if(err) {
      return response.status(400).json({
        error: ' Image could not be uploaded'
      })
    }

    //check for all fields
    const { name, description, price, category, quantity, shipping } = fields;

    if(!name || !description|| !price || !category || !quantity || !shipping) {
      response.status(400).json({
        error: 'All fields are required'
      })
    }

    let product = request.product;
    product = _.extend(product, fields);

    if(files.photo) {
      if(files.photo.size > 1000000) {
        return response.status(400).json({
          error: 'Max file size is 1MB'
        })
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, result) => {
      if (err) {
        return response.status(400).json({
          error: errorHandler(err),
        });
      }

      response.json( result );
    });

  })
}

/**
 * QUERY PARA PRODUTOS:
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrrival = /products?sortBy=updatadAt&order=desc&limit=4
 * if no params are sent, return all products
 */

export function list(request, response) {
  let order = request.query.order ? request.query.order : 'asc';
  let sortBy = request.query.sortBy ? request.query.sortBy : '_id';
  let limit = request.query.limit ? parseInt(request.query.limit) : 6;

  Product.find()
    .select("-photo")
    .populate('category')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if(err) {
        return response.status(400).json({
          error: 'Products not found'
        })
      }
      response.send(products)
    })
}

/**
 * it will find products based on the request product category
 * other products that has the same category, will be returned
 */
export function listRelated(request, response) {
  let limit = request.query.limit ? parseInt(request.query.limit) : 6;

  Product.find({_id: {$ne:request.product}, category: request.product.category})
    .limit(limit)
    .populate('category', '_id name')
    .exec((err, products) => {
      if(err) {
        return response.status(400).json({
          error: 'Product not found'
        })
      }
      response.json(products)
    })
}

export function listCategoriesInProducts(request, response) {
  Product.distinct("category", {}, (err, categories) => {
    if(err) {
      return response.status(400).json({
        error: 'Product not found'
      })
    }
    response.json(categories)
  })
}

export function listBySearch(req, res) {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
      if (req.body.filters[key].length > 0) {
          if (key === "price") {
              // gte -  greater than price [0-10]
              // lte - less than
              findArgs[key] = {
                  $gte: req.body.filters[key][0],
                  $lte: req.body.filters[key][1]
              };
          } else {
              findArgs[key] = req.body.filters[key];
          }
      }
  }

  Product.find(findArgs)
      .select("-photo")
      .populate("category")
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec((err, data) => {
          if (err) {
              return res.status(400).json({
                  error: "Products not found"
              });
          }
          res.json({
              size: data.length,
              data
          });
      });
};

export function photo(request, response, next) {
  if(request.product.photo.data) {
    response.set('Content-Type', request.product.photo.contentType)
    return response.send(request.product.photo.data)
  }
  next()
}

export default 
{ 
  create, 
  productById, 
  read, 
  remove, 
  update, 
  list, 
  listRelated, 
  listCategoriesInProducts,
  listBySearch,
  photo 
};


