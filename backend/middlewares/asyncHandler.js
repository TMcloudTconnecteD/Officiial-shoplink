const asyncHandler = (fn) => (req, res, next) => {
Promise.resolve(fn(req, res, next)).catch(Error => {
    res.status(500).json({message: Error.message})

});


}

export default asyncHandler;