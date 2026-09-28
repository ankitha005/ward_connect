import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Send,
  Megaphone,
  Clock,
  User,
  X,
} from "lucide-react";
import useComplaintsStore from "../../store/complaintsStore";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CATEGORIES = [
  "Development",
  "Meeting",
  "Infrastructure",
  "Health",
  "Education",
  "General",
];
const CATEGORY_COLORS = {
  Development: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  Meeting: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
  Infrastructure: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  Health: "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-emerald-300 border-green-200 dark:border-emerald-500/30",
  Education: "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-500/30",
  General: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

export default function ContentStudio() {
  const {
    announcements,
    beforeAfter,
    addAnnouncement,
    deleteAnnouncement,
    addStandaloneActivity,
  } = useComplaintsStore();
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  const [postMode, setPostMode] = useState("announcement"); // 'announcement' | 'activity'
  const [activityFiles, setActivityFiles] = useState([]);
  const [activityPreviews, setActivityPreviews] = useState([]);

  const [form, setForm] = useState({
    author: "Ward 12 Admin",
    category: "General",
    content: "",
    img: "",
    title: "",
    description: "", // for activity story
  });

  const resetForm = () => {
    setForm({
      author: "Ward 12 Admin",
      category: "General",
      content: "",
      img: "",
      title: "",
      description: "",
    });
    setActivityFiles([]);
    setActivityPreviews([]);
  };

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Append to existing
    setActivityFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setActivityPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handlePost = async () => {
    if (
      postMode === "announcement" &&
      (!form.content.trim() || !form.author.trim())
    )
      return;
    if (
      postMode === "activity" &&
      (!form.title.trim() || activityFiles.length === 0)
    )
      return;

    setPosting(true);
    await new Promise((r) => setTimeout(r, 600));

    if (postMode === "announcement") {
      addAnnouncement({ ...form });
    } else {
      // Convert all standalone activity images to Base64
      const base64Images = await Promise.all(
        activityFiles.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        }),
      );

      addStandaloneActivity({
        title: form.title,
        category: form.category,
        description: form.description,
        images: base64Images,
        after: base64Images[0], // Fallback primary image for simple grid mapping
      });
    }

    setPosting(false);
    setPosted(true);
    resetForm();
    setTimeout(() => {
      setPosted(false);
      setShowForm(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark dark:text-white">Content Studio</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
            Post ward announcements and updates for citizens
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {/* Compose Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5"
          >
            <div className="flex items-center gap-2 text-primary font-bold mb-4">
              <Megaphone size={18} /> Compose New{" "}
              {postMode === "announcement" ? "Announcement" : "Social Activity"}
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
              <button
                onClick={() => setPostMode("announcement")}
                className={`flex-1 text-sm font-bold py-2 rounded-lg transition-colors ${postMode === "announcement" ? "bg-white dark:bg-slate-900 shadow text-primary" : "text-slate-500 dark:text-slate-400 hover:text-dark dark:hover:text-white"}`}
              >
                Announcement
              </button>
              <button
                onClick={() => setPostMode("activity")}
                className={`flex-1 text-sm font-bold py-2 rounded-lg transition-colors ${postMode === "activity" ? "bg-white dark:bg-slate-900 shadow text-primary" : "text-slate-500 dark:text-slate-400 hover:text-dark dark:hover:text-white"}`}
              >
                Standalone Social Activity
              </button>
            </div>

            {postMode === "announcement" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-style">Posted By</label>
                    <input
                      value={form.author}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, author: e.target.value }))
                      }
                      className="input-style"
                      placeholder="e.g. Office of the MLA"
                    />
                  </div>
                  <div>
                    <label className="label-style">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="input-style"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label-style">
                    Announcement Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, content: e.target.value }))
                    }
                    className="input-style resize-none"
                    rows={5}
                    placeholder="Write the announcement or update here…"
                  />
                  <div className="text-right text-[10px] text-slate-400 mt-1">
                    {form.content.length} chars
                  </div>
                </div>

                <div>
                  <label className="label-style flex items-center gap-1.5">
                    <ImageIcon size={12} /> Image URL (Optional)
                  </label>
                  <input
                    value={form.img}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, img: e.target.value }))
                    }
                    className="input-style"
                    placeholder="https://example.com/image.jpg"
                  />
                  {form.img && (
                    <img
                      src={form.img}
                      alt="preview"
                      className="mt-3 w-full h-40 object-cover rounded-xl border border-slate-100"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-style">
                      Activity Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      className="input-style"
                      placeholder="e.g. Volunteer Cleanliness Drive"
                    />
                  </div>
                  <div>
                    <label className="label-style">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="input-style"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label-style">
                    Activity Description & Story
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="input-style resize-none"
                    rows={4}
                    placeholder="Describe the activity, mention volunteers, add captions/interesting stories…"
                  />
                </div>

                <div>
                  <label className="label-style flex items-center gap-1.5">
                    <ImageIcon size={12} /> Upload Activity Photos (Multiple
                    Allowed) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFile}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:transition-colors file:cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-2">
                    Select one or more photos. This will create an instant
                    gallery on the Social Activity page.
                  </p>

                  {activityPreviews.length > 0 && (
                    <div className="mt-3 overflow-x-auto pb-2 flex gap-3 snap-x">
                      {activityPreviews.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative w-32 h-32 shrink-0 snap-start"
                        >
                          <img
                            src={src}
                            alt="preview"
                            className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-200"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                            onClick={() => {
                              setActivityFiles((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                              setActivityPreviews((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={handlePost}
                disabled={
                  posting ||
                  (postMode === "announcement"
                    ? !form.content.trim()
                    : !form.title.trim() || activityFiles.length === 0)
                }
                className={`flex items-center gap-2 font-bold text-sm px-6 py-2.5 rounded-xl transition-all ${
                  posted
                    ? "bg-green-500 text-white"
                    : "bg-primary text-white hover:bg-orange-600 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {posted ? (
                  "✓ Published!"
                ) : posting ? (
                  "Publishing…"
                ) : (
                  <>
                    <Send size={15} /> Publish{" "}
                    {postMode === "announcement" ? "Announcement" : "Activity"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      <div className="space-y-4">
        {(() => {
          const allPosts = [
            ...announcements.map((a) => ({
              ...a,
              _sortDate: new Date(a.createdAt).getTime(),
              _feedType: "announcement",
            })),
            ...beforeAfter.map((b) => ({
              id: b.id,
              title: b.title,
              content: b.story || b.description,
              author: "Ward 12 Admin",
              category: b.category,
              img: (b.images && b.images[0]) || b.after,
              likes: 0,
              createdAt: b.date,
              _sortDate: new Date(b.date).getTime(),
              _feedType: "activity",
            })),
          ].sort((a, b) => b._sortDate - a._sortDate);

          if (allPosts.length === 0) {
            return (
              <div className="text-center py-16 text-slate-400 font-semibold">
                No content published yet. Post your first update above.
              </div>
            );
          }

          return allPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex gap-4"
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 ${post._feedType === "activity" ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" : "bg-primary/10 text-primary"} rounded-full flex items-center justify-center shrink-0`}
              >
                {post._feedType === "activity" ? (
                  <ImageIcon size={18} />
                ) : (
                  <User size={18} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-dark dark:text-white text-sm">
                      {post.author}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.General}`}
                    >
                      {post.category}
                    </span>
                    {post._feedType === "activity" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 uppercase tracking-widest">
                        Activity Gallery
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Clock size={10} /> {timeAgo(post.createdAt)}
                    </span>
                    {post._feedType === "announcement" && (
                      <button
                        onClick={() => setConfirmDelete(post.id)}
                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                {post._feedType === "activity" && post.title && (
                  <h4 className="font-bold text-dark dark:text-white mb-1">{post.title}</h4>
                )}
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium line-clamp-3">
                  {post.content}
                </p>
                {post.img && (
                  <img
                    src={post.img}
                    alt=""
                    className="mt-3 w-full max-h-40 object-cover rounded-xl border border-slate-100 dark:border-slate-800"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                {post._feedType === "announcement" && (
                  <div className="mt-2 text-xs text-slate-400 font-medium">
                    👍 {post.likes} likes
                  </div>
                )}
              </div>
            </motion.div>
          ));
        })()}
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center border border-slate-200 dark:border-slate-800"
            >
              <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-transparent dark:border-red-500/30">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-dark dark:text-white mb-2">
                Delete Announcement?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">
                This will permanently remove the post from the public page.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteAnnouncement(confirmDelete);
                    setConfirmDelete(null);
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
