import { toast } from "react-toastify";
import { useGetSellerApplicationsQuery, useReviewSellerApplicationMutation } from "../../redux/Api/sellerApiSlice";
import AdminMenu from "./AdminMenu";

const SellerApplications = () => {
  const { data: applications = [], isLoading, isError } = useGetSellerApplicationsQuery();
  const [review, { isLoading: reviewing }] = useReviewSellerApplicationMutation();

  const update = async (applicationId, status) => {
    try {
      await review({ applicationId, status }).unwrap();
      toast.success(`Seller application ${status}`);
    } catch (error) {
      toast.error(error?.data?.message || "Could not review seller application");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <AdminMenu />
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Super administrator</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900">Seller applications</h1>
      {isLoading && <p className="mt-6 rounded-2xl bg-white p-6 text-slate-600">Loading applications...</p>}
      {isError && <p role="alert" className="mt-6 rounded-2xl bg-rose-50 p-6 text-rose-800">Could not load seller applications.</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {applications.map((application) => (
          <article key={application._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {application.image && <img className="mb-4 h-40 w-full rounded-xl object-cover" src={application.image} alt={`${application.shopName} shop photo`} loading="lazy" />}
            <div className="flex justify-between gap-3">
              <div><h2 className="font-black text-slate-900">{application.shopName}</h2><p className="text-sm text-slate-500">{application.fullName} · {application.location}</p></div>
              <span className="h-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{application.status}</span>
            </div>
            {application.status === "pending" && (
              <div className="mt-5 flex gap-3">
                <button disabled={reviewing} onClick={() => update(application._id, "approved")} className="flex-1 rounded-xl bg-emerald-700 px-4 py-2.5 font-bold text-white">Approve seller</button>
                <button disabled={reviewing} onClick={() => update(application._id, "rejected")} className="rounded-xl border border-rose-200 px-4 py-2.5 font-bold text-rose-700">Reject</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default SellerApplications;
