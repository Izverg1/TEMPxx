import React, { useState, useMemo } from 'react';
import { Agent, Project, Task } from '../../types';
import { Button } from '../../components/ui/Button';
import { CreateTaskModal } from '../../components/platform/CreateTaskModal';
import { TaskCard } from '../../components/platform/TaskCard';
import { TaskConfirmationModal } from '../../components/platform/TaskConfirmationModal';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  agents: Agent[];
  onAddTask: (taskData: Omit<Task, 'id'>) => void;
  onUpdateTask: (taskId: string, newStatus: Task['status']) => void;
}

const TaskColumn: React.FC<{
  title: Task['status'];
  tasks: Task[];
  projects: Project[];
  onUpdateTask: (taskId: string, newStatus: Task['status']) => void;
  onDragStart: (taskId: string) => void;
  onDragOver: (e: React.DragEvent, status: Task['status']) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (status: Task['status']) => void;
  isDragOver: boolean;
}> = ({ title, tasks, projects, onUpdateTask, onDragStart, onDragOver, onDragLeave, onDrop, isDragOver }) => {
  const getProjectName = (projectId: string) => projects.find(p => p.id === projectId)?.name || 'N/A';
  return (
    <div
      onDragOver={(e) => onDragOver(e, title)}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(title)}
      className={`flex-1 bg-brand-bg p-4 rounded-lg flex flex-col gap-4 min-w-[300px] transition-colors ${isDragOver ? 'bg-brand-primary/10' : ''}`}
    >
      <h3 className="font-semibold text-brand-text-light">{title} ({tasks.length})</h3>
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            projectName={getProjectName(task.projectId)}
            onUpdateTask={onUpdateTask}
            onDragStart={onDragStart}
          />
        ))}
        {tasks.length === 0 && <p className="text-sm text-center text-brand-text-dark pt-4">No tasks in this column.</p>}
      </div>
    </div>
  );
};


const TasksView: React.FC<TasksViewProps> = ({ tasks, projects, agents, onAddTask, onUpdateTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);
  const [taskToConfirm, setTaskToConfirm] = useState<Task | null>(null);


  const filteredAndSortedTasks = useMemo(() => {
    let processedTasks = [...tasks];

    // Filtering by project
    if (filterProject !== 'all') {
      processedTasks = processedTasks.filter(task => task.projectId === filterProject);
    }
    // Filtering by assignee
    if (filterAssignee !== 'all') {
      if (filterAssignee === 'unassigned') {
        processedTasks = processedTasks.filter(task => !task.assigneeId);
      } else {
        processedTasks = processedTasks.filter(task => task.assigneeId === filterAssignee);
      }
    }

    // Sorting
    processedTasks.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return processedTasks;
  }, [tasks, filterProject, filterAssignee, sortBy]);

  const tasksToDo = filteredAndSortedTasks.filter(t => t.status === 'To Do');
  const tasksInProgress = filteredAndSortedTasks.filter(t => t.status === 'In Progress');
  const tasksDone = filteredAndSortedTasks.filter(t => t.status === 'Done');
  
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (tasks.find(t => t.id === draggedTaskId)?.status !== status) {
      setDragOverColumn(status);
    }
  };
  
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };
  
  const handleRequestStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (newStatus === 'Done' && task && task.status !== 'Done') {
        setTaskToConfirm(task);
    } else {
        onUpdateTask(taskId, newStatus);
    }
  };

  const handleConfirmCompletion = () => {
    if (taskToConfirm) {
        onUpdateTask(taskToConfirm.id, 'Done');
    }
    setTaskToConfirm(null);
  };


  const handleDrop = (newStatus: Task['status']) => {
    if (draggedTaskId) {
      handleRequestStatusUpdate(draggedTaskId, newStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="filterProject" className="text-xs text-brand-text-dark mr-2">Project</label>
            <select
              id="filterProject"
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="h-9 bg-brand-bg-light border border-brand-border rounded-md px-3 text-sm text-brand-text-light focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filterAssignee" className="text-xs text-brand-text-dark mr-2">Assignee</label>
            <select
              id="filterAssignee"
              value={filterAssignee}
              onChange={e => setFilterAssignee(e.target.value)}
              className="h-9 bg-brand-bg-light border border-brand-border rounded-md px-3 text-sm text-brand-text-light focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sortBy" className="text-xs text-brand-text-dark mr-2">Sort by</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-9 bg-brand-bg-light border border-brand-border rounded-md px-3 text-sm text-brand-text-light focus:ring-2 focus:ring-brand-primary"
            >
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create New Task</Button>
      </div>
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        <TaskColumn 
            title="To Do" 
            tasks={tasksToDo} 
            projects={projects} 
            onUpdateTask={handleRequestStatusUpdate} 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDragOver={dragOverColumn === 'To Do'}
        />
        <TaskColumn 
            title="In Progress" 
            tasks={tasksInProgress} 
            projects={projects} 
            onUpdateTask={handleRequestStatusUpdate}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDragOver={dragOverColumn === 'In Progress'}
        />
        <TaskColumn 
            title="Done" 
            tasks={tasksDone} 
            projects={projects} 
            onUpdateTask={handleRequestStatusUpdate}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDragOver={dragOverColumn === 'Done'}
        />
      </div>
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreate={onAddTask}
        projects={projects}
        agents={agents}
      />
      <TaskConfirmationModal
        isOpen={!!taskToConfirm}
        onClose={() => setTaskToConfirm(null)}
        onConfirm={handleConfirmCompletion}
        task={taskToConfirm}
      />
    </div>
  );
};

export default TasksView;