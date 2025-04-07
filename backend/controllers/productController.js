import asyncHandler from "../middlewares/asyncHandler.js";
import product from "../models/productModel.js";

const createProduct = asyncHandler(async (req, res) => {
  //res.send ('hallo')


        try {

            const {name, description, price, category, quantity,brand} = req.fields;
          // console.log(name, description, price, category, quantity,brand)
            switch (true) {
                case !name:
                    return res.json({name: "Name is required, come on!"})
                case !description:
                    return res.json({description: "Description is required, come on!"})
                case !price:
                    return res.json({price: "Price is required, come on!"})
                case !category:
                    return res.json({category: "Category is required, come on!"})
                case !quantity:
                    return res.json({quantity: "Quantity is required, come on!"})
                case !brand:
                    return res.json({brand: "Brand is required, come on!"})



            }
          const newProduct = new product({...req.fields})   
            await newProduct.save()
            res.json(newProduct)

        } catch (error) {
            console.error(error)
           res.status(400).json(error.message)
            
        }

})

const updateProduct = asyncHandler(async (req, res) => {
    try {
        const {name, description, price, category, quantity,brand} = req.fields;
          // console.log(name, description, price, category, quantity,brand)
            switch (true) {
                case !name:
                    return res.json({name: "Name is required, come on!"})
                case !description:
                    return res.json({description: "Description is required, come on!"})
                case !price:
                    return res.json({price: "Price is required, come on!"})
                case !category:
                    return res.json({category: "Category is required, come on!"})
                case !quantity:
                    return res.json({quantity: "Quantity is required, come on!"})
                case !brand:
                    return res.json({brand: "Brand is required, come on!"})



            }
             const product = await product
             .findByIdAndUpdate(req.params.id , 
                {...req.fields} , 
                {new: true})
                await product.save()
            res.json(product)


    } catch (error) {
        console.error(error)
        res.status(400).json(error.message)

    }
})

const deleteProduct = asyncHandler(async (req, res) => {
    try {

        const product = await product.findByIdAndDelete(req.params.id)
        res.json(product)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({error: "Error deleting product"}) 
        
    }
})

const fetchProducts = asyncHandler(async (req, res) => {
    try {
        
        const pageSize = 6
        const keyword = req.query.keyword ?
         {name: {$regex: req.query.keyword, 
            $options: "i"}} : {}
            const count = await product.countDocuments({...keyword})
            const products = await product.find({...keyword})
            .limit(pageSize)
            res.json({products,
                 page: 1,
                  pages: Math.ceil(count / pageSize), hasMore: false, })
    } catch (error) {
        console.error(error)
        res.status(500).json({error: "Error getting product"}) 

        
    }
})


const fetchProductsbyId = asyncHandler(async (req, res) => {
    try {
        const product = await product.findById(req.params.id)
        if (product) {
            return res.json(product)
            
        } else {
            res.status(404)
            throw new Error("Product not found")
        }
        
    } catch (error) {
        console.error(error)
        res.status(404).json({error: "Product not Found"}) 
        
    }
})


const fetchAllProducts = asyncHandler(async (req, res) => {
    try {
        
        await product.find({})
        .populate("category")
        .limit(10)
        .sort({createdAt: -1})
        res.json(products)



    } catch (error) {
        console.error(error)
        res.status(500).json({error: "Error getting product"}) 

        
    }
})


const createProductReviews = asyncHandler(async (req, res) => {
    try {
        const {rating, comment} = req.body
        const product = await product.findById(req.params.id)

        if (product) {
            const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString())
            if (alreadyReviewed) {
                res.status(400)
                throw new Error("Product already reviewed")
                
            }
            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            }
            product.reviews.push(review)
            product.numReviews = product.reviews.length
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
            await product.save()
            res.status(201).json({message: "Review added"})

        }
        else {
            res.status(404)
            throw new Error("Product not found")
        }
    } catch (error) {
        console.error(error)
        res.status(400).json(error.message) 
        
    }
})

const fetchTopProducts = asyncHandler(async (req, res) => {
    try {
        

        const products = await product.find({}).sort({rating: -1}).limit(4)
        res.json(products)


    } catch (error) {
        console.error(error)
        res.status(400).json(error.message) 

        
    }
})

const fetchNewProducts = asyncHandler(async (req, res) => {
    try {
       
        
        const products = await product.find({}).sort({_id: -1}).limit(5)
        res.json(products)


    } catch (error) {
        console.error(error)
        res.status(400).json(error.message) 

        
    }
})


export { createProduct,fetchNewProducts, fetchTopProducts ,createProductReviews , updateProduct , deleteProduct, fetchProducts, fetchProductsbyId, fetchAllProducts};
