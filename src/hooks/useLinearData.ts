import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchIssues, fetchProjects, fetchWorkflowStates, updateIssueDueDate, updateIssueStartDate, updateIssueState } from '../api/linear';
import { DEFAULT_DAY_WIDTH, MAX_DAY_WIDTH, MIN_DAY_WIDTH } from '../types';
import type { Filters, GroupBy, Milestone, Project, Task, WorkflowState } from '../types';

const DEFAULT_PRIORITIES = new Set([0, 1, 2, 3, 4]);

export function useLinearData(linearToken: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(
    () => localStorage.getItem('linear_selected_project') || '',
  );
  const [projectName, setProjectName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSynced, setLastSynced] = useState('');
  const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [filters, setFilters] = useState<Filters>({
    assignee: '',
    status: '',
    priorities: new Set(DEFAULT_PRIORITIES),
    search: '',
  });

  const initialLoadDone = useRef(false);

  const assignees = useMemo(() => [...new Set(tasks.map((t) => t.assignee))].sort(), [tasks]);
  const statuses = useMemo(() => [...new Set(tasks.map((t) => t.status))].sort(), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!filters.priorities.has(t.priorityVal)) return false;
      if (filters.assignee && t.assignee !== filters.assignee) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.search) {
        const hay = `${t.id} ${t.title} ${t.assignee} ${t.status}`.toLowerCase();
        if (!hay.includes(filters.search.toLowerCase())) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const loadProjects = useCallback(async () => {
    if (!linearToken) return;
    const p = await fetchProjects(linearToken);
    setProjects(p);
    return p;
  }, [linearToken]);

  const loadIssues = useCallback(
    async (projectId: string) => {
      if (!linearToken || !projectId) return;
      setLoading(true);
      setError('');
      try {
        const result = await fetchIssues(linearToken, projectId);
        setTasks(result.tasks);
        setProjectName(result.projectName);
        setMilestones(result.milestones);
        setLastSynced(
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        );
        if (result.tasks.length > 0 && result.tasks[0].teamId) {
          try {
            const states = await fetchWorkflowStates(linearToken, result.tasks[0].teamId);
            setWorkflowStates(states);
          } catch {
            console.warn('Failed to fetch workflow states');
          }
        }
      } catch (e) {
        setError((e as Error).message);
        setTasks([]);
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    },
    [linearToken],
  );

  const selectProject = useCallback(
    (id: string) => {
      setSelectedProjectId(id);
      localStorage.setItem('linear_selected_project', id);
      setFilters({ assignee: '', status: '', priorities: new Set(DEFAULT_PRIORITIES), search: '' });
      loadIssues(id);
    },
    [loadIssues],
  );

  const refresh = useCallback(() => {
    if (selectedProjectId) loadIssues(selectedProjectId);
  }, [selectedProjectId, loadIssues]);

  const zoomIn = useCallback(() => {
    setDayWidth((w) => Math.min(w + 7, MAX_DAY_WIDTH));
  }, []);

  const zoomOut = useCallback(() => {
    setDayWidth((w) => Math.max(w - 7, MIN_DAY_WIDTH));
  }, []);

  const reschedule = useCallback(
    async (taskUuid: string, newDueDate: string) => {
      if (!linearToken) return;
      await updateIssueDueDate(linearToken, taskUuid, newDueDate);
      setTasks((prev) =>
        prev.map((t) => (t.uuid === taskUuid ? { ...t, due: newDueDate } : t)),
      );
    },
    [linearToken],
  );

  const rescheduleStart = useCallback(
    async (taskUuid: string, newStartDate: string) => {
      if (!linearToken) return;
      await updateIssueStartDate(linearToken, taskUuid, newStartDate);
      setTasks((prev) =>
        prev.map((t) => (t.uuid === taskUuid ? { ...t, startDate: newStartDate } : t)),
      );
    },
    [linearToken],
  );

  const cycleStatus = useCallback(
    async (taskUuid: string) => {
      if (!linearToken || workflowStates.length === 0) return;
      const task = tasks.find((t) => t.uuid === taskUuid);
      if (!task) return;

      const typeOrder = ['unstarted', 'started', 'completed'];
      const currentTypeIdx = typeOrder.indexOf(task.statusType);
      const nextType = typeOrder[Math.min(currentTypeIdx + 1, typeOrder.length - 1)];

      const nextState = workflowStates.find((s) => s.type === nextType);
      if (!nextState || nextState.name === task.status) return;

      await updateIssueState(linearToken, taskUuid, nextState.id);
      setTasks((prev) =>
        prev.map((t) =>
          t.uuid === taskUuid ? { ...t, status: nextState.name, statusType: nextState.type } : t,
        ),
      );
    },
    [linearToken, workflowStates, tasks],
  );

  // Initial load when token is available
  useEffect(() => {
    if (!linearToken || initialLoadDone.current) return;
    initialLoadDone.current = true;

    (async () => {
      try {
        const p = await loadProjects();
        if (!p?.length) return;
        const target = selectedProjectId && p.find((x) => x.id === selectedProjectId)
          ? selectedProjectId
          : p[0].id;
        setSelectedProjectId(target);
        localStorage.setItem('linear_selected_project', target);
        await loadIssues(target);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [linearToken, selectedProjectId, loadProjects, loadIssues]);

  return {
    projects,
    selectedProjectId,
    projectName,
    tasks,
    filteredTasks,
    milestones,
    workflowStates,
    assignees,
    statuses,
    loading,
    error,
    lastSynced,
    dayWidth,
    groupBy,
    filters,
    setFilters,
    setGroupBy,
    selectProject,
    refresh,
    zoomIn,
    zoomOut,
    reschedule,
    rescheduleStart,
    cycleStatus,
  };
}
