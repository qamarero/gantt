import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchIssues, fetchProjects, fetchWorkflowStates, updateIssueDueDate, updateIssueStartDate, updateIssueState } from '../api/linear';
import { toastError, toastSuccess } from '../components/Toast';
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
    try {
      const p = await fetchProjects(linearToken);
      setProjects(p);
      return p;
    } catch (e) {
      toastError(`Failed to load projects: ${(e as Error).message}`);
      throw e;
    }
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
            // Non-critical — status cycling won't work but chart still shows
          }
        }
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg);
        setTasks([]);
        setMilestones([]);
        toastError(`Failed to load issues: ${msg}`, () => loadIssues(projectId));
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

  // Optimistic reschedule (due date) with rollback
  const reschedule = useCallback(
    async (taskUuid: string, newDueDate: string) => {
      if (!linearToken) return;

      // Save previous state for rollback
      const prevTasks = tasks;
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.uuid === taskUuid ? { ...t, due: newDueDate } : t)),
      );

      try {
        await updateIssueDueDate(linearToken, taskUuid, newDueDate);
        toastSuccess('Due date updated');
      } catch (e) {
        // Rollback
        setTasks(prevTasks);
        toastError(
          `Failed to update due date: ${(e as Error).message}`,
          () => reschedule(taskUuid, newDueDate),
        );
      }
    },
    [linearToken, tasks],
  );

  // Optimistic reschedule (start date) with rollback
  const rescheduleStart = useCallback(
    async (taskUuid: string, newStartDate: string) => {
      if (!linearToken) return;

      const prevTasks = tasks;
      setTasks((prev) =>
        prev.map((t) => (t.uuid === taskUuid ? { ...t, startDate: newStartDate } : t)),
      );

      try {
        await updateIssueStartDate(linearToken, taskUuid, newStartDate);
        toastSuccess('Start date updated');
      } catch (e) {
        setTasks(prevTasks);
        toastError(
          `Failed to update start date: ${(e as Error).message}`,
          () => rescheduleStart(taskUuid, newStartDate),
        );
      }
    },
    [linearToken, tasks],
  );

  // Optimistic status cycle with rollback
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

      const prevTasks = tasks;
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.uuid === taskUuid ? { ...t, status: nextState.name, statusType: nextState.type } : t,
        ),
      );

      try {
        await updateIssueState(linearToken, taskUuid, nextState.id);
        toastSuccess(`Status → ${nextState.name}`);
      } catch (e) {
        setTasks(prevTasks);
        toastError(
          `Failed to update status: ${(e as Error).message}`,
          () => cycleStatus(taskUuid),
        );
      }
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
