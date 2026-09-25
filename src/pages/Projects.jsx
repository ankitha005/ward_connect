import { motion } from "framer-motion";
import {
  Construction,
  CheckCircle,
  Clock,
  MapPin,
  IndianRupee,
} from "lucide-react";

const Projects = () => {
  const projects = [
    {
      title: "Smart Road Reconstruction",
      area: "Main Market Road",
      progress: 75,
      budget: "₹45 Lakhs",
      status: "In Progress",
      date: "Est. Completion: June 20, 2026",
      img: "https://images.unsplash.com/photo-1517649563873-199dc6516315?auto=format&fit=crop&q=80&w=600",
    },
    {
      title: "New Public Park & Green Belt",
      area: "Sector 4 Housing",
      progress: 40,
      budget: "₹28 Lakhs",
      status: "In Progress",
      date: "Est. Completion: Aug 15, 2026",
      img: "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?auto=format&fit=crop&q=80&w=600",
    },
    {
      title: "Street Light Modernization (LED)",
      area: "Ward-wide",
      progress: 100,
      budget: "₹12 Lakhs",
      status: "Completed",
      date: "Completed on May 10, 2026",
      img: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=600",
    },
    {
      title: "Sewage Treatment Plant Upgrade",
      area: "Industrial Zone",
      progress: 20,
      budget: "₹1.2 Crores",
      status: "Proposed",
      date: "Scheduled Start: July 2026",
      img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600",
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-dark mb-4">
            Ward Development Projects
          </h1>
          <p className="text-slate-500 font-medium">
            Tracking Infrastructure and Growth in Bengaluru Municipal Wards
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row h-full"
            >
              <div className="md:w-2/5 relative h-48 md:h-auto">
                <img
                  src={project.img}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    project.status === "Completed"
                      ? "bg-success text-white"
                      : "bg-white/90 text-primary"
                  }`}
                >
                  {project.status}
                </div>
              </div>
              <div className="p-8 md:w-3/5 flex flex-col">
                <h3 className="text-xl font-bold text-dark mb-2">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                  <MapPin size={14} className="text-primary" /> {project.area}
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-400 uppercase tracking-widest">
                        Progress
                      </span>
                      <span className="text-primary">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${project.progress === 100 ? "bg-success" : "bg-primary"}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <IndianRupee size={10} /> Budget
                    </div>
                    <div className="text-sm font-bold text-dark">
                      {project.budget}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Clock size={10} /> Timeline
                    </div>
                    <div className="text-[10px] font-bold text-dark leading-tight">
                      {project.date}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
