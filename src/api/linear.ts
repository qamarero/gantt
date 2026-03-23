import { PRIORITY_MAP, type Milestone, type Project, type Task, type WorkflowState } from '../types';

const LINEAR_API = 'https://api.linear.app/graphql';

async function gql(apiKey: string, query: string) {
  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data;
}

export async function testAuth(apiKey: string): Promise<{ id: string; name: string }> {
  const data = await gql(apiKey, '{ viewer { id name } }');
  if (!data?.viewer) throw new Error('Invalid API key');
  return data.viewer;
}

export async function fetchProjects(apiKey: string): Promise<Project[]> {
  const data = await gql(
    apiKey,
    `query {
      projects(first: 100) {
        nodes { id name }
      }
    }`,
  );
  return (data.projects.nodes as Project[]).sort((a, b) => a.name.localeCompare(b.name));
}

/** Parse `start: DD-MM-YY` from issue description */
function parseStartDate(description: string): string | null {
  const match = description.match(/start:\s*(\d{2})-(\d{2})-(\d{2})/i);
  if (!match) return null;
  const [, dd, mm, yy] = match;
  const year = 2000 + parseInt(yy);
  const month = parseInt(mm);
  const day = parseInt(dd);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export async function fetchIssues(
  apiKey: string,
  projectId: string,
): Promise<{ projectName: string; tasks: Task[]; milestones: Milestone[] }> {
  const data = await gql(
    apiKey,
    `query {
      project(id: "${projectId}") {
        name
        projectMilestones {
          nodes {
            id
            name
            targetDate
          }
        }
        issues(first: 250, filter: { completedAt: { null: true } }) {
          nodes {
            id
            identifier
            title
            description
            dueDate
            url
            priority
            state { name type }
            createdAt
            assignee { name }
            team { id }
          }
        }
      }
    }`,
  );

  if (!data.project) throw new Error('Project not found');

  const issueNodes = data.project.issues.nodes as Array<{
    id: string;
    identifier: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    url: string;
    priority: number;
    state: { name: string; type: string } | null;
    createdAt: string;
    assignee: { name: string } | null;
    team: { id: string } | null;
  }>;

  // Query 2: fetch relations and children using issue UUIDs
  const issueIds = issueNodes.filter((n) => n.dueDate).map((n) => n.id);

  let relationsMap: Record<string, { blocks: string[]; blockedBy: string[] }> = {};
  let childrenMap: Record<string, { total: number; completed: number }> = {};

  if (issueIds.length > 0) {
    try {
      const detailData = await gql(
        apiKey,
        `query {
          issues(filter: { id: { in: [${issueIds.map((id) => `"${id}"`).join(',')}] } }) {
            nodes {
              id
              identifier
              relations {
                nodes {
                  type
                  relatedIssue { identifier }
                }
              }
              children {
                nodes {
                  id
                  completedAt
                }
              }
            }
          }
        }`,
      );

      interface RelNode { type: string; relatedIssue: { identifier: string } }
      interface ChildNode { id: string; completedAt: string | null }

      for (const node of detailData.issues.nodes) {
        const identifier = node.identifier as string;
        const relations = (node.relations?.nodes || []) as RelNode[];
        const blocks: string[] = [];
        const blockedBy: string[] = [];
        for (const rel of relations) {
          if (rel.type === 'blocks') blocks.push(rel.relatedIssue.identifier);
          else if (rel.type === 'blocked_by') blockedBy.push(rel.relatedIssue.identifier);
        }
        relationsMap[identifier] = { blocks, blockedBy };

        const children = (node.children?.nodes || []) as ChildNode[];
        childrenMap[identifier] = {
          total: children.length,
          completed: children.filter((c) => c.completedAt !== null).length,
        };
      }
    } catch {
      console.warn('Failed to fetch relations/children — continuing without them');
    }
  }

  const tasks: Task[] = issueNodes
    .filter((n) => n.dueDate)
    .map((n) => {
      const rel = relationsMap[n.identifier] || { blocks: [], blockedBy: [] };
      const ch = childrenMap[n.identifier] || { total: 0, completed: 0 };
      const progress = ch.total > 0 ? Math.round((ch.completed / ch.total) * 100) : 0;

      return {
        id: n.identifier,
        uuid: n.id,
        title: n.title,
        description: n.description || '',
        due: n.dueDate!,
        startDate: parseStartDate(n.description || ''),
        url: n.url,
        priorityVal: n.priority,
        priority: PRIORITY_MAP[n.priority] || 'None',
        status: n.state?.name || '',
        statusType: n.state?.type || '',
        assignee: n.assignee?.name || 'Unassigned',
        teamId: n.team?.id || '',
        blocks: rel.blocks,
        blockedBy: rel.blockedBy,
        progress,
        totalChildren: ch.total,
        completedChildren: ch.completed,
      };
    })
    .sort((a, b) => a.priorityVal - b.priorityVal || new Date(a.due).getTime() - new Date(b.due).getTime());

  const milestones: Milestone[] = (data.project.projectMilestones?.nodes || []).map(
    (m: { id: string; name: string; targetDate: string | null }) => ({
      id: m.id,
      name: m.name,
      targetDate: m.targetDate,
    }),
  );

  return { projectName: data.project.name, tasks, milestones };
}

// ---- Mutations ----

export async function updateIssueDueDate(apiKey: string, issueId: string, dueDate: string): Promise<void> {
  await gql(
    apiKey,
    `mutation {
      issueUpdate(id: "${issueId}", input: { dueDate: "${dueDate}" }) {
        success
      }
    }`,
  );
}

/**
 * Update the start date stored in the issue description as `start: DD-MM-YY`.
 * Fetches the current description, replaces or appends the start date tag, then updates via mutation.
 */
export async function updateIssueStartDate(apiKey: string, issueId: string, startDate: string): Promise<void> {
  // Fetch current description
  const data = await gql(
    apiKey,
    `query { issue(id: "${issueId}") { description } }`,
  );
  const currentDesc: string = data.issue?.description || '';

  // Format the new start tag: start: DD-MM-YY
  const d = new Date(startDate + 'T00:00:00');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const newTag = `start: ${dd}-${mm}-${yy}`;

  let newDesc: string;
  if (/start:\s*\d{2}-\d{2}-\d{2}/i.test(currentDesc)) {
    // Replace existing start tag
    newDesc = currentDesc.replace(/start:\s*\d{2}-\d{2}-\d{2}/i, newTag);
  } else {
    // Append start tag at end
    newDesc = currentDesc.trim() ? `${currentDesc.trim()}\n${newTag}` : newTag;
  }

  // Escape description for GraphQL string (handle newlines, quotes, backslashes)
  const escaped = newDesc
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');

  await gql(
    apiKey,
    `mutation {
      issueUpdate(id: "${issueId}", input: { description: "${escaped}" }) {
        success
      }
    }`,
  );
}

export async function updateIssueState(apiKey: string, issueId: string, stateId: string): Promise<void> {
  await gql(
    apiKey,
    `mutation {
      issueUpdate(id: "${issueId}", input: { stateId: "${stateId}" }) {
        success
      }
    }`,
  );
}

export async function fetchWorkflowStates(apiKey: string, teamId: string): Promise<WorkflowState[]> {
  const data = await gql(
    apiKey,
    `query {
      workflowStates(filter: { team: { id: { eq: "${teamId}" } } }) {
        nodes {
          id
          name
          type
          position
        }
      }
    }`,
  );
  return (data.workflowStates.nodes as WorkflowState[]).sort((a, b) => a.position - b.position);
}
