import Rider from "../models/riderModel.js";
import User from "../models/userModel.js";
import {
  notifyAdmins,
  notifyUser,
} from "../services/notificationBadgeService.js";

const notifyDeliveryResults = async (results, label) => {
  results.filter((result) => result.status === "rejected")
    .forEach((result) => console.error(`${label} notification failed:`, result.reason));
};

const deleteExpiredSuspendedRiders = async () => {
  const suspensionDeadline = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await Rider.deleteMany({
    status: "suspended",
    suspendedAt: { $lte: suspensionDeadline },
    appealStatus: { $ne: "pending" },
  });
  if (result.deletedCount) {
    console.info(`Deleted ${result.deletedCount} rider account(s) suspended for at least 30 days.`);
  }
  return result.deletedCount || 0;
};

const startRiderSuspensionCleanupWorker = () => {
  const timer = setInterval(() => {
    deleteExpiredSuspendedRiders().catch((error) => {
      console.error("Rider suspension cleanup failed:", error);
    });
  }, 60 * 60 * 1000);
  timer.unref?.();
  deleteExpiredSuspendedRiders().catch((error) => {
    console.error("Initial rider suspension cleanup failed:", error);
  });
  return timer;
};

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
      const alreadyApplied = existing.status === "approved" || existing.status === "suspended";
      return res.status(409).json({
        message: alreadyApplied
          ? existing.status === "suspended"
            ? "Your rider account is suspended. Submit an appeal instead of a new application."
            : "You are already an approved rider"
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
          suspendedAt: null,
          suspendedBy: null,
          suspensionReason: "",
          appealStatus: "none",
          appealMessage: "",
          appealedAt: null,
          appealReviewedAt: null,
          appealReviewedBy: null,
          appealDecision: "",
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
    await notifyDeliveryResults(results, "Rider application");

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
    if (status === "approved") {
      rider.suspendedAt = null;
      rider.suspendedBy = null;
      rider.suspensionReason = "";
      rider.appealStatus = "none";
      rider.appealMessage = "";
      rider.appealedAt = null;
      rider.appealReviewedAt = null;
      rider.appealReviewedBy = null;
      rider.appealDecision = "";
    }
    await rider.save();

    const notificationResult = await Promise.allSettled([notifyUser(rider.user, {
      type: "rider",
      title: status === "approved" ? "Rider application approved" : "Rider application update",
      message: status === "approved"
        ? "Your application is approved. You are now listed among available ShopLink riders."
        : "Your rider application was not approved this time. You can update your details and apply again.",
      link: "/ride-boda",
    })]);
    await notifyDeliveryResults(notificationResult, "Rider review");

    return res.json({ message: `Rider application ${status}`, application: rider });
  } catch (error) {
    console.error("Rider application review failed:", error);
    return res.status(500).json({ message: "Unable to review rider application" });
  }
};

const suspendRider = async (req, res) => {
  try {
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (!reason) return res.status(400).json({ message: "A suspension reason is required." });
    if (reason.length > 500) return res.status(400).json({ message: "The suspension reason must be 500 characters or fewer." });

    const rider = await Rider.findOneAndUpdate(
      { _id: req.params.id, status: "approved" },
      {
        $set: {
          status: "suspended",
          suspendedAt: new Date(),
          suspendedBy: req.user._id,
          suspensionReason: reason,
          appealStatus: "none",
          appealMessage: "",
          appealedAt: null,
          appealReviewedAt: null,
          appealReviewedBy: null,
          appealDecision: "",
        },
      },
      { new: true }
    );
    if (!rider) {
      const current = await Rider.findById(req.params.id);
      if (!current) return res.status(404).json({ message: "Rider not found." });
      return res.status(409).json({ message: "Only an approved rider can be suspended." });
    }

    const results = await Promise.allSettled([notifyUser(rider.user, {
      type: "rider",
      title: "Rider account suspended",
      message: `Your rider profile is no longer listed. Reason: ${reason} You may appeal from your rider page. Rider records are deleted after 30 suspended days if there is no appeal awaiting review.`,
      link: "/ride-boda",
    })]);
    await notifyDeliveryResults(results, "Rider suspension");
    return res.json({ message: "Rider suspended.", rider });
  } catch (error) {
    console.error("Rider suspension failed:", error);
    return res.status(500).json({ message: "Unable to suspend rider." });
  }
};

const submitRiderAppeal = async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (message.length < 20 || message.length > 2000) {
      return res.status(400).json({ message: "Explain your appeal in 20 to 2,000 characters." });
    }
    const now = new Date();
    const rider = await Rider.findOneAndUpdate(
      { user: req.user._id, status: "suspended", appealStatus: { $ne: "pending" } },
      {
        $set: {
          appealStatus: "pending",
          appealMessage: message,
          appealedAt: now,
          appealReviewedAt: null,
          appealReviewedBy: null,
          appealDecision: "",
        },
      },
      { new: true }
    );
    if (!rider) {
      const existing = await Rider.findOne({ user: req.user._id });
      if (!existing || existing.status !== "suspended") {
        return res.status(409).json({ message: "Only suspended riders can submit an appeal." });
      }
      return res.status(409).json({ message: "Your appeal is already awaiting super-admin review." });
    }

    const superAdmins = await User.find({
      isAdmin: true,
      isSuperAdmin: true,
      _id: { $ne: req.user._id },
    }).select("_id").lean();
    const appealNotification = {
      type: "rider",
      title: "Rider suspension appeal",
      message: `${rider.fullName} submitted an appeal for super-admin review.`,
      link: "/admin/riders",
    };
    const results = await Promise.allSettled([
      ...superAdmins.map(({ _id }) => notifyUser(_id, appealNotification)),
      notifyUser(req.user._id, {
        type: "rider",
        title: "Rider appeal submitted",
        message: "Your appeal has been sent to the super admin for review.",
        link: "/ride-boda",
      }),
    ]);
    await notifyDeliveryResults(results, "Rider appeal");
    return res.status(201).json({ message: "Appeal submitted for super-admin review.", application: rider });
  } catch (error) {
    console.error("Rider appeal submission failed:", error);
    return res.status(500).json({ message: "Unable to submit rider appeal." });
  }
};

const reviewRiderAppeal = async (req, res) => {
  try {
    const { decision } = req.body || {};
    const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";
    if (!["reinstate", "uphold"].includes(decision)) {
      return res.status(400).json({ message: "Choose whether to reinstate or uphold the suspension." });
    }
    const now = new Date();
    const update = {
      appealStatus: decision === "reinstate" ? "accepted" : "rejected",
      appealReviewedAt: now,
      appealReviewedBy: req.user._id,
      appealDecision: note,
    };
    if (decision === "reinstate") {
      Object.assign(update, {
        status: "approved",
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: "",
      });
    }
    const rider = await Rider.findOneAndUpdate(
      { _id: req.params.id, status: "suspended", appealStatus: "pending" },
      { $set: update },
      { new: true }
    );
    if (!rider) {
      const current = await Rider.findById(req.params.id);
      if (!current) return res.status(404).json({ message: "Rider appeal not found." });
      return res.status(409).json({ message: "This rider has no appeal awaiting review." });
    }

    const results = await Promise.allSettled([notifyUser(rider.user, {
      type: "rider",
      title: decision === "reinstate" ? "Rider appeal approved" : "Rider appeal declined",
      message: decision === "reinstate"
        ? "Your appeal was approved. Your rider profile is active and visible again."
        : `Your appeal was reviewed and the suspension remains in place.${note ? ` Decision: ${note}` : ""}`,
      link: "/ride-boda",
    })]);
    await notifyDeliveryResults(results, "Rider appeal decision");

    if (decision === "uphold") await deleteExpiredSuspendedRiders();
    return res.json({
      message: decision === "reinstate" ? "Rider reinstated." : "Suspension upheld.",
      rider,
    });
  } catch (error) {
    console.error("Rider appeal review failed:", error);
    return res.status(500).json({ message: "Unable to review rider appeal." });
  }
};

export {
  applyAsRider,
  getApprovedRiders,
  getMyRiderApplication,
  getRiderApplications,
  reviewRiderApplication,
  suspendRider,
  submitRiderAppeal,
  reviewRiderAppeal,
  startRiderSuspensionCleanupWorker,
};
