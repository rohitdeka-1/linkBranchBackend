import { Request, Response } from "express";
import { Link } from "../models/link.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { IRequest } from "../types/express";

 
export const fetchLinksByUser = async (req: IRequest, res: Response) => {
  const { username } = req.params; 
  const userId = req.user?._id;  
  try {
    let user;
 
    if (username) {
      user = await User.findOne({ username }).select("_id fullname username profilePic");
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
    }
 
    const targetUserId = username ? user?._id : userId;

    if (!targetUserId) {
      return res.status(400).send({
        success: false,
        message: "User ID or username is required",
      });
    }

    const links = await Link.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(targetUserId) }, 
      },
      {
        $group: {
          _id: "$user",
          links: { $push: "$$ROOT" },  
        },
      },
      {
        $lookup: {
          from: "users",  
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails" } },  
      {
        $project: {
          _id: 0,
          userDetails: {
            _id: 1,
            fullname: 1,
            username: 1,
            profilePic: 1,
            
          },
          links: {
            _id: 1,
            title: 1,
            url: 1,
            backgroundImage: 1,
          },
        },
      },
    ]);

    if (links?.length > 0) {
      res.status(200).send({
        success: true,
        data: links[0],  
        message: "Links fetched successfully",
      });
    } else {
      res.status(404).send({
        success: false,
        message: "No links found for the specified user",
      });
    }
  } catch (error) {
    console.error("Error in fetchLinksByUser:", error);
    res.status(500).send({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
};


export const updateLink = async (req: IRequest, res: Response) => {

  const {linkId} = req.params;
  const { title, url, backgroundImage } = req.body;

  const userId = req.user?._id;

  try{

    const link = await Link.findOne({ _id: linkId, user: userId });
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found or unauthorized",
      });
    }


    const updatedLink = await Link.findByIdAndUpdate(
      linkId,
      {
        title,
        url,
        backgroundImage,
      },
      { new: true }
    );  

    if(!updatedLink){
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Link updated successfully",
      data: updatedLink,
    });

  }catch(err){
    console.error("Error in updateLink:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


