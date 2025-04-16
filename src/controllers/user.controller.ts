import { NextFunction, Request, Response } from "express";
import { uploadOnCloudinary } from "../services/cloudinary.service";
import mongoose, { ObjectId } from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.model";
import { Link } from "../models/link.model";
import { IRequest } from "../types/express";


const handleUploadImage = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const localFilePath = req.file?.path;

  if (!localFilePath) {
    return res.status(400).json({
      success: false,
      message: "No file found",
    });
  }
  
  const uploadResult = await uploadOnCloudinary(localFilePath);
  if (!uploadResult) {
    return res.status(400).json({
      success: false,
      message: "Couldn't upload on cloud",
    });
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Access Unauthorized",
    });
  }

  try {
    const updatedUser = await User.findOneAndUpdate( req.user?._id , {
      profilePic: uploadResult.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      image: uploadResult.secure_url,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "" + err,
    });
  }
};

const fetchUser = async(req: IRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  try {
    const userWithLinks = await User.aggregate([
      { $match: { _id: req.user._id } },
      {
        $lookup: {
          from: "links", 
          localField: "_id",
          foreignField: "user",
          as: "links",
        },
      },
      { $sort: { "links.order": 1 } },
      {
        $project: {
          _id: 1,
          fullname: 1,
          username: 1,
          email: 1,
          bio: 1,
          profilePic: 1,
          links: 1, 
        },
      },
    ]);

    if (!userWithLinks || userWithLinks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: userWithLinks[0], 
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateUser = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { bio, fullname } = req.body;
    const updateData: Partial<{
      bio: string;
      profilePic: string;
      fullname: string;
    }> = {};

    if (bio) updateData.bio = bio;
    if (fullname) updateData.fullname = fullname;
    if (req.file) {
      const localFilePath = req.file.path;

      if (!localFilePath) {
        return res.status(400).json({
          success: false,
          message: "No file found",
        });
      }

      const uploadResult = await uploadOnCloudinary(localFilePath);
      if (!uploadResult) {
        return res.status(400).json({
          success: false,
          message: "Couldn't upload image to Cloudinary",
        });
      }

      if (req.user?.profilePic) {
        const publicId = req.user.profilePic.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
        console.log("Removed old profile photo");
      }

      updateData.profilePic = uploadResult.secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const securedUserObject = {
      _id: updatedUser._id,
      fullname: updatedUser.fullname,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
    };

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: securedUserObject,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const addLinks = async (
  req: IRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { platform, url, icon } = req.body;
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "No Body",
    });
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  if (!platform.trim() || !url.trim()) {
    return res.status(400).json({
      success: false,
      message: "Platform and URL cannot be empty",
    });
  }

  if (!/^https?:\/\/.+\..+/.test(url)) {
    return res.status(400).json({
      success: false,
      message: "Invalid URL format",
    });
  }

  try{
    const existedUrl = await Link.findOne({
      user: req.user._id,
      url,
    });
  
    console.log(existedUrl)
  
    if (existedUrl) {
      return res.status(409).json({
        success: false,
        message: "Link already exists for this platform and URL",
      });
    }

    const linkCount = await Link.countDocuments({ user: req.user._id });
  
    const newLink = await Link.create({
      url,
      title: platform,
      icon: icon || "defaul-icon",
      user: req.user._id,
      order: linkCount,
    });
  
    if (!newLink) {
      return res.status(400).json({
        success: false,
        message: "Failed to add link",
      });
    }

    const userWithLinks = await User.aggregate([
      { $match: { _id: req.user._id } },
      {
        $lookup: {
          from: "links", 
          localField: "_id",
          foreignField: "user",
          as: "links",
        },
      },

      { $sort: { "links.order": 1 } },
      {
        $project: {
          _id: 1,
          fullname: 1,
          username: 1,
          email: 1,
          bio: 1,
          profilePic: 1,
          links: 1,
        },
      },
    ]);

    if (!userWithLinks || userWithLinks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  
    return res.status(200).json({
      success: true,
      message: "Link Added",
      user: userWithLinks[0], 
    });
  }

  catch(err){
    console.log("Error",err);
    return res.status(400).json({
      "success": false,
      "message": "Internal Server error"
    })
  }
  
};

const deleteLinks = async (
  req: IRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { linkId } = req.body;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  if (!linkId) {
    return res.status(400).json({
      success: false,
      message: "LinkId is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(linkId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid link ID",
    });
  }

  try {
    console.log("req.user:", req.user);
    console.log("linkId:", linkId);

    const deleted = await Link.findOneAndDelete({
      _id: linkId,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Link not found or unauthorized",
      });
    }

    const userWithLinks = await User.aggregate([
      { $match: { _id: req.user._id } },
      {
        $lookup: {
          from: "links", 
          localField: "_id",
          foreignField: "user",
          as: "links",
        },
      },
      { $sort: { "links.order": 1 } },
      {
        $project: {
          _id: 1,
          fullname: 1,
          username: 1,
          email: 1,
          bio: 1,
          profilePic: 1,
          links: 1,
        },
      },
    ]);

    if (!userWithLinks || userWithLinks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Link deleted successfully",
      user: userWithLinks[0], 
    });
  } catch (err) {
    console.error("Error deleting link:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { handleUploadImage, fetchUser, updateUser, addLinks, deleteLinks };
