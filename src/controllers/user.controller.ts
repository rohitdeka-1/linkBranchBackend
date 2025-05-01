import { NextFunction, Request, Response } from "express";
import { uploadOnCloudinary } from "../services/cloudinary.service";
import mongoose, { ObjectId } from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.model";
import { Link } from "../models/link.model";
import { IRequest } from "../types/express";
import { UserProjection } from "../utils/projections/UserProjection";


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

  // TODO: Remove this checker as we used verifyToken middleware
  // if (!req.user) {
  //   return res.status(401).json({
  //     success: false,
  //     message: "Access Unauthorized",
  //   });
  // }

  try {
    await User.findOneAndUpdate(req.user?._id, {
      profilePic: uploadResult.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      image: uploadResult.secure_url,
    });
  } catch (err) {
    console.error(err, "<<-- Error in image upload");
    return res.status(401).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getCurrentUser = async (req: IRequest, res: Response) => {
  try {
    const userWithLinks = await User.aggregate([
      { $match: { _id: req.user?._id } },
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
        $project: UserProjection
      },
      // TODO: Use unwind to remove array and get a single object
    ]);

    if (!userWithLinks) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: userWithLinks[0],       // TODO: Dont use array. Look at above query
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

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user?._id },
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

  // TODO: Use payload validator

  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "No Body",
    });
  }

  if (!platform || !url) {
    return res.status(400).json({
      success: false,
      message: "Platform and URL are required",
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

  try {
    const linkCount = await Link.countDocuments({ user: req.user?._id });

    if (linkCount >= 6) {
      return res.status(400).json({
        success: false,
        message: "You can only create up to 6 links.",
      });
    }

    const existedUrl = await Link.findOne({
      user: req.user?._id,
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
      icon: icon || "default-icon",
      user: req.user?._id,
      order: linkCount,
    });

    if (!newLink) {
      return res.status(400).json({
        success: false,
        message: "Failed to add link",
      });
    }

    // TODO: Dont do this aggregate query because it takes time
    const userWithLinks = await User.aggregate([
      { $match: { _id: req.user?._id } },
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
        $project: UserProjection
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
      user: userWithLinks[0],   // Better send the link and add the link to the array in frontend
    });
  }

  catch (err) {
    console.log("Error", err);
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
  const { linkId } = req.params;

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

    const link = await Link.findOne({ _id: linkId, user: req.user?._id });
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found or unauthorized",
      });
    };
    const deleted = await Link.findOneAndDelete({
      _id: linkId,
      user: req.user?._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Link not found or unauthorized",
      });
    }

    const userWithLinks = await User.aggregate([
      { $match: { _id: req.user?._id } },
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
        $project: UserProjection
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


export const incrementVisitCount = async (req: IRequest, res: Response) => {
  const { username } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { username },
      { $inc: { visitCount: 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Visit count incremented successfully",
      visitCount: user.visitCount,    // TODO: Why are you sending this as a response? Is it neccessary for user to see??
    });
  } catch (error) {
    console.error("Error incrementing visit count:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { handleUploadImage, getCurrentUser, updateUser, addLinks, deleteLinks };

