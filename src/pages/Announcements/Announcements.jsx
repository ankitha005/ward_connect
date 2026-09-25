import { motion } from "framer-motion";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
  User,
  Clock,
} from "lucide-react";
import useComplaintsStore from "../../store/complaintsStore";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

const CATEGORY_COLORS = {
  Development: "bg-blue-50 text-blue-600",
  Meeting: "bg-purple-50 text-purple-600",
  Infrastructure: "bg-amber-50 text-amber-700",
  Health: "bg-green-50 text-green-700",
  Education: "bg-pink-50 text-pink-700",
  General: "bg-slate-100 text-slate-600",
};

const Announcements = () => {
  const { announcements, likeAnnouncement } = useComplaintsStore();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">
              Ward Announcements
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Stay connected with live updates from your representatives
            </p>
          </div>
          <div className="bg-primary/10 text-primary font-bold text-sm px-4 py-2 rounded-xl border border-primary/20">
            {announcements.length} Updates
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-semibold">
            No announcements yet.
          </div>
        ) : (
          <div className="space-y-8">
            {announcements.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">{post.author}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.General}`}
                        >
                          {post.category || "General"}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                          <Clock size={11} /> {timeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-4">
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {post.content}
                  </p>
                  {post.img && (
                    <div className="rounded-2xl overflow-hidden shadow-inner">
                      <img
                        src={post.img}
                        alt="Update"
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => likeAnnouncement(post.id)}
                      className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm"
                    >
                      <ThumbsUp size={18} /> {post.likes}
                    </button>
                  </div>
                  <button className="text-slate-500 hover:text-primary transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
