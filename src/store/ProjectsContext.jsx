import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cloudEnabled, onAuthChange, loadProjects, saveProjects, removeProjects, signInWithEmail, signOut } from '../services/cloud';
import { buildSampleProjects } from '../data/sampleProjects';
import { uid } from '../lib/random';

const KEY = 'brandora.projects.v1';
const ProjectsContext = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to samples */ }
  return buildSampleProjects();
}

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(projects)); } catch { /* quota or private mode */ }
  }, [projects]);

  // Cloud sync (Supabase): load on sign-in, then save changed projects and deletions, debounced.
  const [user, setUser] = useState(null);
  const [syncState, setSyncState] = useState(cloudEnabled ? 'signed-out' : 'local');
  const synced = useRef(new Map()); // id -> updatedAt last saved
  useEffect(() => {
    let off = () => {};
    onAuthChange(async (session) => {
      setUser(session?.user ?? null);
      if (!session) { setSyncState(cloudEnabled ? 'signed-out' : 'local'); synced.current.clear(); return; }
      setSyncState('syncing');
      try {
        const remote = await loadProjects();
        const local = load().filter((p) => !p.sample && !remote.some((r) => r.id === p.id));
        if (local.length) await saveProjects(local, session.user.id); // first sign-in: keep what was made on this device
        const all = [...local, ...remote].sort((a, b) => b.updatedAt - a.updatedAt);
        synced.current = new Map(all.map((p) => [p.id, p.updatedAt]));
        setProjects(all);
        setSyncState('synced');
      } catch (e) { console.error(e); setSyncState('error'); }
    }).then((fn) => { off = fn; });
    return () => off();
  }, []);
  useEffect(() => {
    if (!user || syncState === 'syncing') return;
    const timer = setTimeout(async () => {
      const changed = projects.filter((p) => !p.sample && synced.current.get(p.id) !== p.updatedAt);
      const removed = [...synced.current.keys()].filter((id) => !projects.some((p) => p.id === id));
      if (!changed.length && !removed.length) return;
      try {
        await saveProjects(changed, user.id);
        await removeProjects(removed);
        changed.forEach((p) => synced.current.set(p.id, p.updatedAt));
        removed.forEach((id) => synced.current.delete(id));
        setSyncState('synced');
      } catch (e) { console.error(e); setSyncState('error'); }
    }, 800);
    return () => clearTimeout(timer);
  }, [projects, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const createProject = useCallback((input, concepts, seed, extra = {}) => {
    const now = Date.now();
    const project = { id: uid('brand'), input, seed, concepts, selected: 0, status: 'progress', favorite: false, createdAt: now, updatedAt: now, ...extra };
    setProjects((ps) => [project, ...ps]);
    return project.id;
  }, []);

  const updateProject = useCallback((id, patch) => {
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, ...(typeof patch === 'function' ? patch(p) : patch), updatedAt: Date.now() } : p)));
  }, []);

  const updateConcept = useCallback((id, index, patch) => {
    updateProject(id, (p) => ({ concepts: p.concepts.map((c, i) => (i === index ? { ...c, ...patch } : c)) }));
  }, [updateProject]);

  const deleteProject = useCallback((id) => setProjects((ps) => ps.filter((p) => p.id !== id)), []);

  const duplicateProject = useCallback((id) => {
    setProjects((ps) => {
      const src = ps.find((p) => p.id === id);
      if (!src) return ps;
      const now = Date.now();
      const copy = { ...structuredClone(src), id: uid('brand'), sample: false, favorite: false, createdAt: now, updatedAt: now, input: { ...src.input, name: `${src.input.name} 2` } };
      return [copy, ...ps];
    });
  }, []);

  const toggleFavorite = useCallback((id) => {
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
  }, []);

  const resetSamples = useCallback(() => {
    setProjects((ps) => [...ps.filter((p) => !p.sample), ...buildSampleProjects()]);
  }, []);

  const value = useMemo(() => ({
    cloudEnabled, user, syncState, signIn: signInWithEmail, signOut,
    projects, createProject, updateProject, updateConcept, deleteProject, duplicateProject, toggleFavorite, resetSamples,
    getProject: (id) => projects.find((p) => p.id === id),
  }), [user, syncState, projects, createProject, updateProject, updateConcept, deleteProject, duplicateProject, toggleFavorite, resetSamples]);

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export const useProjects = () => useContext(ProjectsContext);
