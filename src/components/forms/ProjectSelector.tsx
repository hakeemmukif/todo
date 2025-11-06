import { Project } from '../../types/task';
import { TaskFormField } from './TaskFormField';

interface ProjectSelectorProps {
  value: string | null;
  onChange: (projectId: string | null) => void;
  projects: Project[];
  required?: boolean;
  showLabel?: boolean;
}

export const ProjectSelector = ({
  value,
  onChange,
  projects,
  required = true,
  showLabel = true,
}: ProjectSelectorProps) => {
  const activeProjects = projects.filter(p => !p.isArchived);

  return (
    <TaskFormField label={showLabel ? "Project" : undefined} required={showLabel && required}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        aria-label="Project"
        aria-required={required}
        title="Project"
        className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A]
                   focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA]
                   bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA]
                   appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          paddingRight: '2.5rem'
        }}
      >
        <option value="">📥 Inbox</option>
        {activeProjects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.icon} {project.name}
          </option>
        ))}
      </select>
    </TaskFormField>
  );
};
