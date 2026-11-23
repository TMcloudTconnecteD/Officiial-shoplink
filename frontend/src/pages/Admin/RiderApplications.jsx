import { toast } from "react-toastify";
import {
  useGetRiderApplicationsQuery,
  useReviewRiderApplicationMutation,
} from "../../redux/Api/riderApiSlice.js";

const RiderApplications = () => {
  const { data: applications = [], isLoading, isError } = useGetRiderApplicationsQuery();
  const [reviewApplication, { isLoading: isReviewing }] = useReviewRiderApplicationMutation();

  const review = async (riderId, status) => {
    try {
      await reviewApplication({ riderId, status }).unwrap();
      toast.success(`Application ${status}`);
    } catch (error) {
      toast.error(error?.data?.message || "Could not update rider application");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
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
          </article>
        ))}
      </div>
    </div>
  );
};

export default RiderApplications;
