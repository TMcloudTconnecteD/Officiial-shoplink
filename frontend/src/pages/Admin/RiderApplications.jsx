import { toast } from "react-toastify";
import {
  useGetRiderApplicationsQuery,
  useReviewRiderApplicationMutation,
  useReviewRiderAppealMutation,
  useSuspendRiderMutation,
} from "../../redux/Api/riderApiSlice.js";
import { useSelector } from "react-redux";
import AdminMenu from "./AdminMenu";

const RiderApplications = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: applications = [], isLoading, isError } = useGetRiderApplicationsQuery(undefined, {
    skip: !userInfo?.isSuperAdmin,
    pollingInterval: userInfo?.isSuperAdmin ? 30000 : 0,
  });
  const [reviewApplication, { isLoading: isReviewing }] = useReviewRiderApplicationMutation();
  const [suspendRider, { isLoading: isSuspending }] = useSuspendRiderMutation();
  const [reviewAppeal, { isLoading: isReviewingAppeal }] = useReviewRiderAppealMutation();

  const review = async (riderId, status) => {
    try {
      await reviewApplication({ riderId, status }).unwrap();
      toast.success(`Application ${status}`);
    } catch (error) {
      toast.error(error?.data?.message || "Could not update rider application");
    }
  };

  const suspend = async (riderId) => {
    const reason = window.prompt("Why is this rider being suspended? The reason will be sent to the rider.");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Enter a reason before suspending this rider.");
      return;
    }
    try {
      await suspendRider({ riderId, reason: reason.trim() }).unwrap();
      toast.success("Rider suspended. They can appeal from the Ride Boda page.");
    } catch (error) {
      toast.error(error?.data?.message || "Could not suspend rider.");
    }
  };

  const decideAppeal = async (riderId, decision) => {
    const note = window.prompt(
      decision === "reinstate"
        ? "Optional note for the rider:"
        : "Why is the suspension being upheld? This note will be sent to the rider:"
    );
    if (note === null) return;
    if (decision === "uphold" && !note.trim()) {
      toast.error("Provide a reason when upholding a suspension.");
      return;
    }
    try {
      await reviewAppeal({ riderId, decision, note: note.trim() }).unwrap();
      toast.success(decision === "reinstate" ? "Rider reinstated." : "Suspension upheld.");
    } catch (error) {
      toast.error(error?.data?.message || "Could not review rider appeal.");
    }
  };

  if (!userInfo?.isSuperAdmin) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <AdminMenu />
        <p role="alert" className="mt-6 rounded-2xl bg-rose-50 p-5 text-rose-800">
          Rider applications and appeals are available to the super admin only.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <AdminMenu />
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Rider management</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Rider applications</h1>
        <p className="mt-2 text-slate-600">Approve a rider to publish their profile on the Boda page. Applicants are notified of your decision.</p>
      </div>

      {isLoading && <p className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm">Loading applications…</p>}
      {isError && <p role="alert" className="rounded-2xl bg-rose-50 p-6 text-rose-800">Could not load rider applications.</p>}
      {!isLoading && !isError && applications.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm">No rider applications yet.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((application) => (
          <article key={application._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{application.fullName}</h2>
                <p className="mt-1 text-sm text-slate-600">{application.user?.email || "Account unavailable"}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                application.status === "approved" ? "bg-emerald-100 text-emerald-800"
                  : application.status === "rejected" ? "bg-rose-100 text-rose-800"
                    : application.status === "suspended" ? "bg-slate-200 text-slate-800"
                      : "bg-amber-100 text-amber-800"
              }`}>
                {application.status}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Phone</dt><dd className="font-semibold text-slate-800">{application.phone}</dd></div>
              <div><dt className="text-slate-500">Area</dt><dd className="font-semibold text-slate-800">{application.location}</dd></div>
              <div><dt className="text-slate-500">Vehicle</dt><dd className="font-semibold text-slate-800">{application.vehicleType}</dd></div>
              {application.plateNumber && <div><dt className="text-slate-500">Plate</dt><dd className="font-semibold text-slate-800">{application.plateNumber}</dd></div>}
              {application.experience && <div className="col-span-2"><dt className="text-slate-500">Experience</dt><dd className="font-semibold text-slate-800">{application.experience}</dd></div>}
              <div className="col-span-2"><dt className="text-slate-500">Applied</dt><dd className="font-semibold text-slate-800">{new Date(application.createdAt).toLocaleString()}</dd></div>
              {application.status === "suspended" && (
                <>
                  <div className="col-span-2"><dt className="text-slate-500">Suspended</dt><dd className="font-semibold text-slate-800">{application.suspendedAt ? new Date(application.suspendedAt).toLocaleString() : "Date unavailable"}</dd></div>
                  <div className="col-span-2"><dt className="text-slate-500">Suspension reason</dt><dd className="font-semibold text-slate-800">{application.suspensionReason || "Not recorded"}</dd></div>
                  <div className="col-span-2"><dt className="text-slate-500">Appeal status</dt><dd className="font-semibold capitalize text-slate-800">{application.appealStatus || "none"}</dd></div>
                </>
              )}
            </dl>
            {application.status === "pending" && (
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => review(application._id, "approved")}
                  className="flex-1 rounded-xl bg-emerald-700 px-4 py-2.5 font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
                >
                  Approve & list
                </button>
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => review(application._id, "rejected")}
                  className="rounded-xl border border-rose-200 px-4 py-2.5 font-bold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            )}
            {application.status === "approved" && (
              <button
                type="button"
                disabled={isSuspending}
                onClick={() => suspend(application._id)}
                className="mt-5 w-full rounded-xl border border-rose-300 px-4 py-2.5 font-bold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
              >
                {isSuspending ? "Suspending…" : "Suspend rider"}
              </button>
            )}
            {application.status === "suspended" && application.appealStatus === "pending" && (
              <section className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-bold text-amber-950">Appeal awaiting review</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{application.appealMessage}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Submitted {application.appealedAt ? new Date(application.appealedAt).toLocaleString() : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={isReviewingAppeal}
                    onClick={() => decideAppeal(application._id, "reinstate")}
                    className="flex-1 rounded-xl bg-emerald-700 px-4 py-2.5 font-bold text-white disabled:opacity-60"
                  >
                    Reinstate rider
                  </button>
                  <button
                    type="button"
                    disabled={isReviewingAppeal}
                    onClick={() => decideAppeal(application._id, "uphold")}
                    className="flex-1 rounded-xl border border-rose-300 px-4 py-2.5 font-bold text-rose-700 disabled:opacity-60"
                  >
                    Uphold suspension
                  </button>
                </div>
              </section>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default RiderApplications;
