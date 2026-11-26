import Rider from "../models/riderModel.js";
import {
  notifyAdmins,
  notifyUser,
} from "../services/notificationBadgeService.js";

const applyAsRider = async (req, res) => {
  try {
    const { fullName, phone, location, vehicleType, plateNumber, experience } = req.body || {};
    const optionalText = (value) => typeof value === "string" ? value.trim() : "";
    if (
      typeof fullName !== "string" || !fullName.trim()
      || typeof phone !== "string" || !phone.trim()
      || typeof location !== "string" || !location.trim()
      || !["Motorbike", "Bicycle", "On foot"].includes(vehicleType)
    ) {
      return res.status(400).json({ message: "Name, phone, location, and vehicle type are required" });
    }

    const existing = await Rider.findOne({ user: req.user._id });
    if (existing && existing.status !== "rejected") {
      return res.status(409).json({
        message: existing.status === "approved"
          ? "You are already an approved rider"
          : "Your rider application is already being reviewed",
        application: existing,
      });
    }

    const rider = existing
      ? Object.assign(existing, {
          fullName: fullName.trim(),
          phone: phone.trim(),
          location: location.trim(),
          vehicleType,
          plateNumber: optionalText(plateNumber),
          experience: optionalText(experience),
          status: "pending",
          reviewedAt: undefined,
          reviewedBy: undefined,
        })
      : new Rider({
          user: req.user._id,
          fullName: fullName.trim(),
          phone: phone.trim(),
          location: location.trim(),
          vehicleType,
          plateNumber: optionalText(plateNumber),
          experience: optionalText(experience),
        });

    await rider.save();
    const notification = {
      type: "rider",
      title: "New rider application",
      message: `${rider.fullName} applied to ride in ${rider.location}.`,
      link: "/admin/riders",
    };
    const results = await Promise.allSettled([
      notifyAdmins(notification, req.user._id),
      notifyUser(req.user._id, {
        type: "rider",
        title: "Application received",
        message: "Your rider application is with our admin team for review.",
        link: "/ride-boda",
      }),
    ]);
    results.filter((result) => result.status === "rejected")
      .forEach((result) => console.error("Rider application notification failed:", result.reason));

    return res.status(201).json({ message: "Rider application submitted", application: rider });
  } catch (error) {
    console.error("Rider application failed:", error);
    return res.status(500).json({ message: "Unable to submit rider application" });
  }
};

const getApprovedRiders = async (_req, res) => {
  try {
    const riders = await Rider.find({ status: "approved" })
      .select("fullName phone location vehicleType plateNumber experience createdAt")
      .sort({ reviewedAt: -1 })
      .lean();
    return res.json(riders);
  } catch (error) {
    console.error("Could not load approved riders:", error);
    return res.status(500).json({ message: "Unable to load riders" });
  }
};

const getMyRiderApplication = async (req, res) => {
  try {
    const application = await Rider.findOne({ user: req.user._id });
    return res.json(application);
  } catch (error) {
    console.error("Could not load rider application:", error);
    return res.status(500).json({ message: "Unable to load your rider application" });
  }
};

const getRiderApplications = async (_req, res) => {
  try {
    const applications = await Rider.find({})
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    return res.json(applications);
  } catch (error) {
    console.error("Could not load rider applications:", error);
    return res.status(500).json({ message: "Unable to load rider applications" });
  }
};

const reviewRiderApplication = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    const rider = await Rider.findById(req.params.id);
    if (!rider) return res.status(404).json({ message: "Rider application not found" });
    if (rider.status !== "pending") {
      return res.status(409).json({ message: "This application has already been reviewed" });
    }

    rider.status = status;
    rider.reviewedAt = new Date();
    rider.reviewedBy = req.user._id;
    await rider.save();

    const notificationResult = await Promise.allSettled([notifyUser(rider.user, {
      type: "rider",
      title: status === "approved" ? "Rider application approved" : "Rider application update",
      message: status === "approved"
        ? "Your application is approved. You are now listed among available ShopLink riders."
        : "Your rider application was not approved this time. You can update your details and apply again.",
      link: "/ride-boda",
    })]);
    notificationResult.filter((result) => result.status === "rejected")
      .forEach((result) => console.error("Rider review notification failed:", result.reason));

    return res.json({ message: `Rider application ${status}`, application: rider });
  } catch (error) {
    console.error("Rider application review failed:", error);
    return res.status(500).json({ message: "Unable to review rider application" });
  }
};

export {
  applyAsRider,
  getApprovedRiders,
  getMyRiderApplication,
  getRiderApplications,
  reviewRiderApplication,
};
