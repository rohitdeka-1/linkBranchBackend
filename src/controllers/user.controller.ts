import { NextFunction, Request, Response } from "express";
import { uploadOnCloudinary } from "../services/cloudinary.service";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.model";
import { Link } from "../models/link.model";

const handleUploadImage = async (
  req: Request,
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
    const updatedUser = await User.findOneAndUpdate(req.user._id, {
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

const fetchUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const { _id, name, bio, email, profilePic } = req.user;

  return res.status(200).json({
    success: true,
    user: {
      id: _id,
      name,
      email,
      bio,
      profilePic,
    },
  });
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
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
  req: Request,
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
  
    const newLink = await Link.create({
      url,
      title: platform,
      icon: icon,
      user: req.user._id,
    });
  
    if (!newLink) {
      return res.status(400).json({
        success: false,
        message: "Failed to add link",
      });
    }
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { links: newLink._id } },
      { new: true }
    );
  
    const user = await User.findById(req.user._id).populate("links");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
  
    return res.status(200).json({
      success: true,
      message: "Link Added",
      user: {
        id: req.user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        links: user.links,
      },
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
  req: Request,
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

  try {
   
    const deleted = await Link.findOneAndDelete({
      _id: linkId,
      user: req.user._id,
    });


    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Link not found or unauthorized',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { links: linkId } }, 
      { new: true }
    ).populate("links");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Link deleted successfully",
      user : {
        id: updatedUser._id,
        links: updatedUser.links
      }
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
