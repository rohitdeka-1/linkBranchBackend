import { NextFunction, Request, Response } from "express";
import { uploadOnCloudinary } from "../services/cloudinary.service";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.model";

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
  const { platform, url } = req.body;
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

  if (!platform || !url) {
    return res.status(400).json({
      success: false,
      message: "Platform and URL are required",
    });
  }

  if (!/^https?:\/\/.+\..+/.test(url)) {
    return res.status(400).json({
      success: false,
      message: "Invalid URL format",
    });
  }

  const existedUrl = await User.findOne({
    _id: req.user._id,
    "socialLinks.url": url,
  });

  console.log(existedUrl);

  if (existedUrl) {
    return res.status(300).json({
      success: false,
      message: "Link already Exists",
    });
  }

  const updatedUser = await User.findOneAndUpdate(
    req.user._id,
    { $push: { socialLinks: { platform, url } } },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(400).json({
      success: false,
      message: "User does not exits",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Link Added",
    socialLinks: updatedUser.socialLinks,
  });
};

const deleteLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { platform, url } = req.body;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  if (!platform || !url) {
    return res.status(400).json({
      success: false,
      message: "Platform and URL are required",
    });
  }

  try {
    const user = await User.findOne({
      _id: req.user._id,
      "socialLinks.platform": platform,
      "socialLinks.url": url,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

  
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { socialLinks: { platform, url } } },
      { new: true } 
    );

    return res.status(200).json({
      success: true,
      message: "Link deleted successfully",
      socialLinks: updatedUser?.socialLinks, 
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
