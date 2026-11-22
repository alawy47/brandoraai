import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

  const createProject = useCallback((input, concepts, seed) => {
    const now = Date.now();
    const project = { id: uid('brand'), input, seed, concepts, selected: 0, status: 'progress', favorite: false, createdAt: now, updatedAt: now };
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
    projects, createProject, updateProject, updateConcept, deleteProject, duplicateProject, toggleFavorite, resetSamples,
    getProject: (id) => projects.find((p) => p.id === id),
  }), [projects, createProject, updateProject, updateConcept, deleteProject, duplicateProject, toggleFavorite, resetSamples]);

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export const useProjects = () => useContext(ProjectsContext);
