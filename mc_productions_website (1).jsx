import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STORAGE_KEY = "mc_productions_portfolio_v2";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `project_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const Icons = {
  camera: "M14.5 4l-1.5-2h-5l-1.5 2H3a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-6.5z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  film: "M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M7 2v20 M17 2v20 M2 7h5 M17 7h5 M2 12h20 M2 17h5 M17 17h5",
  upload: "M12 3v12 M7 8l5-5 5 5 M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  trash: "M3 6h18 M8 6V4h8v2 M6 6l1 18h10l1-18 M10 11v8 M14 11v8",
  edit: "M4 20h4l12-12-4-4L4 16v4z M14 6l4 4",
  save: "M5 3h14l2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M7 3v7h10V3 M8 21v-7h8v7",
  plus: "M12 5v14 M5 12h14",
  mail: "M3 5h18v14H3V5z M3 7l9 6 9-6",
  phone: "M6 2l4 4-3 3c2 4 5 7 9 9l3-3 4 4-2 4c-1 1-3 1-5 0C8 20 4 16 1 8 0 6 0 4 2 3l4-1z",
  instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M18 6.5h.01",
  linkedin: "M4 9h4v12H4V9z M6 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M10 9h4v2c1-2 6-3 6 3v7h-4v-6c0-2-2-2-3-1v7h-3V9z",
  play: "M8 5v14l11-7-11-7z",
  image: "M4 4h16v16H4V4z M7 16l4-4 3 3 2-2 3 3 M8 8h.01",
  close: "M6 6l12 12 M18 6L6 18",
};

function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={Icons[name]} />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardHover = {
  y: -8,
  scale: 1.02,
  transition: { duration: 0.25, ease: "easeOut" },
};

const defaultProjects = [
  {
    id: createId(),
    title: "Corporate Event Coverage",
    category: "Corporate",
    description: "A polished event recap designed to turn live moments into marketing assets.",
    type: "image",
    media: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: createId(),
    title: "Wedding Storytelling",
    category: "Weddings",
    description: "Cinematic wedding visuals focused on emotion, atmosphere, and timeless detail.",
    type: "image",
    media: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: createId(),
    title: "Live Music & BTS",
    category: "Events",
    description: "Behind-the-scenes and performance-driven content for artists and event brands.",
    type: "image",
    media: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
  },
];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function safeLoadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultProjects;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultProjects;
  } catch (error) {
    console.warn("Could not load saved MC Productions projects:", error);
    return defaultProjects;
  }
}

function runBasicTests() {
  console.assert(createId().length > 5, "createId should return a usable id");
  console.assert(Array.isArray(defaultProjects), "defaultProjects should be an array");
  console.assert(defaultProjects.length === 3, "defaultProjects should include three starter projects");
  console.assert(defaultProjects.every((project) => project.title && project.category && project.media), "Every starter project should include title, category and media");
  console.assert(typeof fileToDataUrl === "function", "fileToDataUrl should exist for uploads");
}

export default function MCProductionsWebsite() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", description: "", type: "image", media: "" });
  const [message, setMessage] = useState("Ready to create content that moves your brand?");

  useEffect(() => {
    runBasicTests();
    setProjects(safeLoadProjects());
  }, []);

  useEffect(() => {
    try {
      if (projects.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.warn("Could not save MC Productions projects:", error);
      setMessage("Your browser storage is full. Try using smaller uploads or removing older projects.");
    }
  }, [projects]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))], [projects]);
  const filteredProjects = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", category: "", description: "", type: "image", media: "" });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
      setMessage("Please upload an image or video file only.");
      return;
    }

    try {
      const media = await fileToDataUrl(file);
      const type = file.type.startsWith("video") ? "video" : "image";
      setForm((prev) => ({ ...prev, media, type }));
      setMessage(`${type === "video" ? "Video" : "Image"} ready. Add details and save it to your portfolio.`);
    } catch (error) {
      console.warn("Upload failed:", error);
      setMessage("Upload failed. Try a smaller file or a different format.");
    }
  };

  const saveProject = () => {
    if (!form.title.trim() || !form.media) {
      setMessage("Add at least a title and image/video before saving.");
      return;
    }

    const projectData = {
      title: form.title.trim(),
      category: form.category.trim() || "Uncategorized",
      description: form.description.trim() || "Portfolio project by MC Productions.",
      type: form.type,
      media: form.media,
    };

    if (editingId) {
      setProjects((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...projectData } : p)));
      setMessage("Project updated successfully.");
    } else {
      setProjects((prev) => [{ id: createId(), ...projectData }, ...prev]);
      setMessage("Project added to your portfolio.");
    }
    resetForm();
  };

  const editProject = (project) => {
    setEditingId(project.id);
    setForm({ title: project.title, category: project.category, description: project.description, type: project.type, media: project.media });
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setMessage("Project removed from your portfolio.");
  };

  const clearAllProjects = () => {
    setProjects(defaultProjects.map((project) => ({ ...project, id: createId() })));
    setFilter("All");
    resetForm();
    setMessage("Portfolio reset to starter projects.");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 28%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08), transparent 30%)",
            "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.12), transparent 28%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08), transparent 30%)",
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 28%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08), transparent 30%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: "easeOut" }} className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 6, scale: 1.08 }} transition={{ type: "spring", stiffness: 300 }} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-[10px] text-neutral-500">
              LOGO
            </motion.div>
            <div>
              <p className="text-lg font-bold tracking-tight">MC Productions</p>
              <p className="text-xs text-neutral-400">Strategic Visual Storytelling</p>
            </div>
          </div>
          <div className="hidden gap-6 text-sm text-neutral-300 md:flex">
            {["Work", "Services", "Upload", "Contact"].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative hover:text-white"
                whileHover={{ y: -2 }}
              >
                {item}
                <motion.span className="absolute -bottom-1 left-0 h-px w-full origin-left bg-white" initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} />
              </motion.a>
            ))}
          </div>
        </div>
      </motion.nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.p variants={fadeUp} className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300">Johannesburg-based production company</motion.p>
          <motion.h1 variants={fadeUp} className="text-5xl font-black leading-tight tracking-tight md:text-7xl">We turn moments into marketing assets.</motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg text-neutral-300">MC Productions helps brands, events, artists, and businesses create cinematic video, photography, and social-first content that builds attention, trust, and visibility.</motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Button className="rounded-2xl px-6 py-6 text-base" onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}>View Work</Button>
            <Button variant="outline" className="rounded-2xl border-white/20 bg-transparent px-6 py-6 text-base text-white hover:bg-white hover:text-black" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Book a Shoot</Button>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative">
          <motion.div className="absolute -inset-4 rounded-[2rem] bg-white/10 blur-3xl" animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
          <Card className="relative overflow-hidden rounded-[2rem] border-white/10 bg-white/5 shadow-2xl">
            <CardContent className="p-0">
              <div className="relative aspect-[4/5] overflow-hidden bg-black">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-10 z-10 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-3xl border border-dashed border-white/20 bg-black/70 text-sm text-neutral-500 shadow-2xl">
                  YOUR LOGO
                </motion.div>
                <motion.div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-70" whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6">
                <p className="text-sm text-neutral-300">Featured Capability</p>
                <h2 className="text-2xl font-bold">Event Films · Reels · BTS · Brand Stories</h2>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <motion.section id="services" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="relative z-10 mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <motion.div variants={fadeUp}>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Services</p>
            <h2 className="mt-2 text-4xl font-bold">What we create</h2>
          </motion.div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["film", "Videography", "Cinematic event coverage, brand films, interviews, reels, and live content."],
            ["camera", "Photography", "Clean, professional visuals for brands, events, campaigns, and portfolios."],
            ["play", "Social Content", "Short-form content packs designed for Instagram, TikTok, LinkedIn, and ads."],
          ].map(([icon, title, text]) => (
            <motion.div key={title} variants={fadeUp} whileHover={cardHover}>
              <Card className="h-full rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur-xl transition-shadow hover:shadow-2xl hover:shadow-white/10">
              <CardContent className="p-6">
                <Icon name={icon} className="mb-5 h-8 w-8" />
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-neutral-300">{text}</p>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section id="upload" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <Card className="rounded-[2rem] border-white/10 bg-white/5 text-white">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Portfolio Manager</p>
              <h2 className="mt-2 text-3xl font-bold">Upload and edit your work</h2>
              <p className="mt-3 text-neutral-300">Add pictures or videos, update titles, categories and descriptions. This prototype saves your changes in your browser.</p>
              <p className="mt-4 rounded-2xl bg-black/40 p-4 text-sm text-neutral-300">{message}</p>
              <button className="mt-4 rounded-2xl border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:bg-white/10" onClick={clearAllProjects}>Reset starter projects</button>
            </div>
            <div className="grid gap-3">
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" placeholder="Project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" placeholder="Category e.g. Weddings, Corporate, Events" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <textarea className="min-h-24 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-black/30 px-4 py-6 text-neutral-300 hover:bg-white/10">
                <Icon name="upload" className="h-5 w-5" />
                Upload image or video
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
              </label>
              {form.media && (
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  {form.type === "video" ? <video src={form.media} className="max-h-80 w-full object-cover" controls /> : <img src={form.media} className="max-h-80 w-full object-cover" alt="Preview" />}
                  <button className="absolute right-3 top-3 rounded-full bg-black/70 p-2" onClick={() => setForm({ ...form, media: "" })} aria-label="Remove preview"><Icon name="close" className="h-4 w-4" /></button>
                </div>
              )}
              <div className="flex gap-3">
                <Button className="flex-1 rounded-2xl py-6" onClick={saveProject}>{editingId ? <Icon name="save" className="mr-2 h-4 w-4" /> : <Icon name="plus" className="mr-2 h-4 w-4" />}{editingId ? "Save Changes" : "Add Project"}</Button>
                {editingId && <Button variant="outline" className="rounded-2xl border-white/20 bg-transparent px-6 text-white hover:bg-white hover:text-black" onClick={resetForm}>Cancel</Button>}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section id="work" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <motion.div variants={fadeUp}>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Portfolio</p>
            <h2 className="mt-2 text-4xl font-bold">Selected Work</h2>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)} className={`rounded-full px-4 py-2 text-sm ${filter === cat ? "bg-white text-black" : "bg-white/10 text-neutral-300 hover:bg-white/20"}`}>{cat}</button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-neutral-300">No projects in this category yet.</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={fadeUp} whileHover={cardHover} layout>
                <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur-xl transition-shadow hover:shadow-2xl hover:shadow-white/10">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] bg-black">
                    {project.type === "video" ? <video src={project.media} className="h-full w-full object-cover" controls /> : <img src={project.media} className="h-full w-full object-cover" alt={project.title} />}
                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs">{project.type === "video" ? <span className="inline-flex items-center gap-1"><Icon name="play" className="h-3 w-3" /> Video</span> : <span className="inline-flex items-center gap-1"><Icon name="image" className="h-3 w-3" /> Image</span>}</div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-neutral-400">{project.category}</p>
                    <h3 className="mt-1 text-xl font-bold">{project.title}</h3>
                    <p className="mt-2 text-sm text-neutral-300">{project.description}</p>
                    <div className="mt-5 flex gap-2">
                      <Button size="sm" variant="outline" className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white hover:text-black" onClick={() => editProject(project)}><Icon name="edit" className="mr-2 h-4 w-4" />Edit</Button>
                      <Button size="sm" variant="outline" className="rounded-xl border-white/20 bg-transparent text-white hover:bg-red-500 hover:text-white" onClick={() => deleteProject(project.id)}><Icon name="trash" className="mr-2 h-4 w-4" />Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section id="contact" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <Card className="rounded-[2rem] border-white/10 bg-white text-black">
          <CardContent className="grid gap-8 p-8 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Book MC Productions</p>
              <h2 className="mt-3 text-4xl font-black">Let’s create content that makes your brand impossible to ignore.</h2>
              <p className="mt-4 text-neutral-700">Send a message for event coverage, social-first content packs, brand films, wedding storytelling, or corporate campaigns.</p>
            </div>
            <div className="grid gap-3 text-sm">
              <a className="flex items-center gap-3 rounded-2xl bg-neutral-100 p-4 hover:bg-neutral-200" href="mailto:motsotojack@gmail.com"><Icon name="mail" className="h-5 w-5" /> motsotojack@gmail.com</a>
              <a className="flex items-center gap-3 rounded-2xl bg-neutral-100 p-4 hover:bg-neutral-200" href="tel:+27000000000"><Icon name="phone" className="h-5 w-5" /> Add your phone number here</a>
              <a className="flex items-center gap-3 rounded-2xl bg-neutral-100 p-4 hover:bg-neutral-200" href="https://www.instagram.com" target="_blank" rel="noreferrer"><Icon name="instagram" className="h-5 w-5" /> Add MC Productions Instagram</a>
              <a className="flex items-center gap-3 rounded-2xl bg-neutral-100 p-4 hover:bg-neutral-200" href="https://www.linkedin.com/in/jack-motsoto-734609289" target="_blank" rel="noreferrer"><Icon name="linkedin" className="h-5 w-5" /> LinkedIn</a>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-neutral-500">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-xs text-neutral-500">
            LOGO
          </div>
        </div>
        © {new Date().getFullYear()} MC Productions. Built for strategic visual storytelling.
      </footer>
    </main>
  );
}
