import { Response } from "express";
import { IRequest } from "../types/express";
import { Link } from "../models/link.model";

export const fetchLinksByUser = async (req: IRequest, res: Response) => {
	try {
		const links = await Link.aggregate([
			{
				$group: {
					_id: req.user?._id,
					userDetails: { $first: "$user" },
					links: { $push: "$$ROOT" },
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "userDetails",
					foreignField: "_id",
					as: "userDetails",
				},
			},
			{ $unwind: { path: "$userDetails" } },
		]);

		if (links?.length > 0) {
			res.status(200).send({
				success: true,
				data: links,
				message: "Links fetched successfully",
			});
		} else {
			res.status(404).send({
				success: false,
				message: "No data found",
			});
		}
	} catch (error) {
		console.error(error, "<<-- Error in fetch links");
		res.status(500).send({
			success: false,
			code: "INTERNAL_SERVER_ERROR",
			message: "Internal server error",
		});
	}
};
