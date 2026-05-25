// Testes do componente TaskItem

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskItem from '../src/components/TaskItem.jsx';

// Tarefa de exemplo para os testes
const mockTask = {
  id: 1,
  title: 'Estudar React',
  description: 'Aprender hooks e context API',
  done: false,
  createdAt: new Date().toISOString(),
};

const mockTaskDone = {
  ...mockTask,
  id: 2,
  done: true,
};

describe('TaskItem', () => {
  it('deve renderizar o título da tarefa', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Estudar React')).toBeInTheDocument();
  });

  it('deve renderizar a descrição quando presente', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Aprender hooks e context API')).toBeInTheDocument();
  });

  it('deve exibir badge "Pendente" para tarefa não concluída', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve exibir badge "Concluída" para tarefa concluída', () => {
    render(
      <TaskItem
        task={mockTaskDone}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Concluída')).toBeInTheDocument();
  });

  it('deve chamar onToggle ao clicar no checkbox', async () => {
    const onToggle = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskItem
        task={mockTask}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith(mockTask.id, mockTask.done);
  });

  it('deve chamar onEdit ao clicar no botão de editar', () => {
    const onEdit = vi.fn();
    render(
      <TaskItem
        task={mockTask}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByLabelText('Editar tarefa');
    fireEvent.click(editBtn);

    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('deve exibir confirmação ao clicar em deletar', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const deleteBtn = screen.getByLabelText('Deletar tarefa');
    fireEvent.click(deleteBtn);

    // Deve aparecer botão de confirmação
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('deve chamar onDelete ao confirmar exclusão', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskItem
        task={mockTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('Deletar tarefa'));
    fireEvent.click(screen.getByText('Confirmar'));

    expect(onDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('deve cancelar exclusão ao clicar em Cancelar', () => {
    const onDelete = vi.fn();
    render(
      <TaskItem
        task={mockTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('Deletar tarefa'));
    fireEvent.click(screen.getByText('Cancelar'));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('checkbox deve estar marcado para tarefa concluída', () => {
    render(
      <TaskItem
        task={mockTaskDone}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
});
