import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaBicycle, FaMotorcycle, FaPhone, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useApplyAsRiderMutation,
  useGetApprovedRidersQuery,
  useGetMyRiderApplicationQuery,
} from "../redux/Api/riderApiSlice.js";

const initialForm = {
  fullName: "",
  phone: "",
  location: "",
  vehicleType: "Motorbike",
  plateNumber: "",
  experience: "",
};

const formatWhatsappNumber = (phone) => phone.replace(/\D/g, "");

const RideBodaPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [form, setForm] = useState(initialForm);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const { data: riders = [], isLoading: loadingRiders, isError: ridersError } = useGetApprovedRidersQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data: application, isLoading: loadingApplication } = useGetMyRiderApplicationQuery(userInfo?._id || userInfo?.id, {
    skip: !userInfo,
    pollingInterval: userInfo ? 30000 : 0,
  });
  const [applyAsRider, { isLoading: submitting }] = useApplyAsRiderMutation();
  const selectedRider = riders.find((rider) => rider._id === selectedRiderId);

  useEffect(() => {
    if (userInfo?.username) {
      setForm((current) => ({ ...current, fullName: current.fullName || userInfo.username }));
    }
  }, [userInfo?.username]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    try {
      await applyAsRider(form).unwrap();
      toast.success("Application sent. We’ll notify you when it’s reviewed.");
    } catch (error) {
      toast.error(error?.data?.message || "Could not submit your application");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <section className="overflow-hidden rounded-[30px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-xl">
        <div className="p-6 md:p-10">
          <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">ShopLink Boda</p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                A trusted rider, just around the corner.
              </h1>
              <p className="mt-4 max-w-2xl text-slate-600">
                Choose an approved local rider to arrange a pickup or delivery, or apply to ride with ShopLink.
              </p>
            </div>
            <Link to="/shops/all" className="inline-flex w-fit items-center rounded-full bg-emerald-700 px-5 py-3 font-bold text-white shadow-lg transition-colors hover:bg-emerald-800">
              Browse local shops
            </Link>
          </div>

          <section aria-labelledby="available-riders-heading" className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur md:p-7">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Verified community</p>
                <h2 id="available-riders-heading" className="mt-1 text-2xl font-black text-slate-900">Available riders</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                {riders.length} approved
              </span>
            </div>

            {loadingRiders ? (
              <p className="py-8 text-center text-slate-500">Finding riders near campus…</p>
            ) : ridersError ? (
              <p role="alert" className="py-8 text-center text-rose-700">Riders could not be loaded. Please try again shortly.</p>
            ) : riders.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-5 py-8 text-center">
                <FaMotorcycle className="mx-auto text-3xl text-emerald-700" />
                <p className="mt-3 font-semibold text-slate-800">No riders are listed yet.</p>
                <p className="mt-1 text-sm text-slate-500">Apply below and be among the first trusted riders on campus.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {riders.map((rider) => (
                  <article key={rider._id} className={`rounded-2xl border p-5 transition-colors ${selectedRiderId === rider._id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                        {rider.vehicleType === "Bicycle" ? <FaBicycle /> : <FaMotorcycle />}
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Approved</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{rider.fullName}</h3>
                    <p className="mt-1 text-sm text-slate-600">{rider.vehicleType} · {rider.location}</p>
                    {rider.plateNumber && <p className="mt-1 text-xs text-slate-500">Plate {rider.plateNumber}</p>}
                    <button
                      type="button"
                      onClick={() => setSelectedRiderId(rider._id)}
                      className="mt-4 w-full rounded-xl border border-emerald-700 px-4 py-2.5 font-bold text-emerald-800 transition-colors hover:bg-emerald-700 hover:text-white"
                    >
                      {selectedRiderId === rider._id ? "Selected rider" : "Choose this rider"}
                    </button>
                  </article>
                ))}
              </div>
            )}

            {selectedRider && (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Ready to arrange a ride</p>
                  <p className="mt-1 font-semibold">Contact {selectedRider.fullName} directly to agree on pickup, drop-off, and fare.</p>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${selectedRider.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-bold text-slate-900">
                    <FaPhone /> Call
                  </a>
                  <a
                    href={`https://wa.me/${formatWhatsappNumber(selectedRider.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 font-bold text-white"
                  >
                    <FaWhatsapp /> Hire
                  </a>
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="apply-rider-heading" className="mt-7 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-3xl bg-slate-900 p-6 text-white md:p-8">
              <FaMotorcycle className="text-3xl text-emerald-300" />
              <h2 id="apply-rider-heading" className="mt-4 text-2xl font-black">Ride with us</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Join the campus rider network. Admins review every application before a rider profile appears publicly.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-200">
                <li>✓ Verified rider profiles</li>
                <li>✓ Reach nearby campus customers</li>
                <li>✓ Updates when your application is reviewed</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              {!userInfo ? (
                <div className="py-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900">Sign in to apply</h3>
                  <p className="mt-2 text-slate-600">Your rider application will be linked to your ShopLink account.</p>
                  <Link to="/login?redirect=%2Fride-boda" className="mt-5 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Sign in</Link>
                </div>
              ) : loadingApplication ? (
                <p className="py-8 text-center text-slate-500">Loading your rider application…</p>
              ) : application?.status === "pending" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-bold text-amber-900">Application under review</p>
                  <p className="mt-1 text-sm text-amber-800">We’ll send a notification as soon as an admin reviews your application.</p>
                  <p className="mt-3 text-sm text-slate-700">{application.fullName} · {application.location} · {application.vehicleType}</p>
                </div>
              ) : application?.status === "approved" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-bold text-emerald-900">You’re an approved ShopLink rider!</p>
                  <p className="mt-1 text-sm text-emerald-800">Your profile is listed above for customers to choose and hire.</p>
                </div>
              ) : (
                <form onSubmit={submitApplication} className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <h3 className="text-xl font-black text-slate-900">{application?.status === "rejected" ? "Update and reapply" : "Apply as a rider"}</h3>
                    <p className="mt-1 text-sm text-slate-500">Applications are reviewed by an admin before listing.</p>
                  </div>
                  <label className="text-sm font-semibold text-slate-700">
                    Full name
                    <input required name="fullName" value={form.fullName} onChange={updateForm} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="name" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Phone number
                    <input required name="phone" type="tel" value={form.phone} onChange={updateForm} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="tel" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Campus / area
                    <input required name="location" value={form.location} onChange={updateForm} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" placeholder="e.g. Main campus" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Vehicle
                    <select name="vehicleType" value={form.vehicleType} onChange={updateForm} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                      <option>Motorbike</option>
                      <option>Bicycle</option>
                      <option>On foot</option>
                    </select>
                  </label>
                  {form.vehicleType === "Motorbike" && (
                    <label className="text-sm font-semibold text-slate-700">
                      Number plate (optional)
                      <input name="plateNumber" value={form.plateNumber} onChange={updateForm} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                    </label>
                  )}
                  <label className="text-sm font-semibold text-slate-700">
                    Experience (optional)
                    <input name="experience" value={form.experience} onChange={updateForm} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" placeholder="e.g. 2 years" />
                  </label>
                  <button disabled={submitting} className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">
                    {submitting ? "Sending application…" : "Submit rider application"}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default RideBodaPage;
