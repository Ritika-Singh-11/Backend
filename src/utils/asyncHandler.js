// //async handler can be of promises and try catch but we will make with promises

// //here requestHandler is a function
// // asyncHandler is a wrapper around async Express routes that
// //  automatically catches errors and passes them to Express, 
// // so you don't have to write try...catch in every route.
// const asyncHandler=(requestHandler)=>{
// (req,res,next)=>{
//     Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
// }
// }





// export {asyncHandler}


// //higher order function uses in asynchandler by use of try catch block
// // const asyncHandler=(fn)=>
// // async(req,res,next)=>{
// //     try {
// //         await fn(req,res,next) 
// //     } catch (error) {
// //     res.status(error.code||500).json({
// //         success:true,
// //         message:error.message
// //     })
// //     }
// // }







const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
};

export { asyncHandler };




// const asyncHandler = (requestHandler) =>
//     (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next))
//             .catch((err) => next(err));
//     };

// export { asyncHandler };