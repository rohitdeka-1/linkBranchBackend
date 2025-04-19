import {Request,Response, NextFunction } from "express"
import { body, checkSchema, validationResult } from "express-validator"
import { register } from "module"


// export const registerationInputValidator = [
//     body('username','Username too lengthy').isString().isLength({max:25}),
//     body('email','Invalid Email').notEmpty(),
//     body('email','Invalid Email').isEmail(),
//     body('password','Password should be greater than 3').isLength({min:4}),
// ]

// export const loginInputValidator = [
//     body('identity','Username/Email cannot be empty').notEmpty(),
//     body('password').notEmpty().isLength({min:4}),
// ]

export const registerationInputValidator = checkSchema(
    {
        username: {
            notEmpty: {
                errorMessage:"Username is required",
            },
            isString:{
                errorMessage:"Username should be strictly string",
            },
            isLength:{
                options:{
                    max:25
                },
                errorMessage:"Username too lengthy"
            },
            trim:true,
        },
        email: {
            notEmpty: {
                errorMessage:"Email is required",
            },
            isEmail:{
                errorMessage:"Invalid Email",
            }
        },
        password:{
            notEmpty:{
                errorMessage:"Password is required"
            },
            isLength:{
                options:{
                    min:4
                },
                errorMessage:"Password too short"
            }
        },
        fullname:{
            notEmpty:{
                errorMessage:"Fullname is required"
            },
            isString:{
                errorMessage:"Fullname should be strictly string",
            }
        }
    }
)


export const loginInputValidator = checkSchema(
    {
        identity: {
            notEmpty: {
               errorMessage:"Username/Email is required",
            },
            isString:{
                errorMessage:"Username should be strictly string",
            },
        },
        password:{
            notEmpty:{
                errorMessage:"Password is required"
            },
            isLength:{
                options:{
                    min:4
                },
                errorMessage:"Password too short"
            }
        }
    }
)


export const inputValidationError = (req:Request,res:Response,next:NextFunction) =>{
    const errors  = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            "success" : false,
            "message" : "Input not valid",
            "error" : errors.array()
        })
    }
    next()
}


