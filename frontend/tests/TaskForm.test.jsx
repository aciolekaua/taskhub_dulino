// Testes do componente TaskForm

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TaskForm from '../src/components/TaskForm.jsx';

describe('TaskForm — modo criação', () => {
  it('deve renderizar campos de título e descrição', () => {
    render(<TaskForm task={null} onSubmit={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
  });

  it('deve exibir título "Nova Tarefa" no modo criação', () => {
    render(<TaskForm task={null} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument();
  });

  it('deve exibir botão "Criar tarefa" no modo criação', () => {
    render(<TaskForm task={null} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Criar tarefa')).toBeInTheDocument();
  });

  it('deve exibir erro se tentar enviar sem título', async () => {
    render(<TaskForm task={null} onSubmit={vi.fn()} onClose={vi.fn()} />);

    // Usa fireEvent.submit no form para bypassar validação nativa HTML5 no jsdom
    const form = document.getElementById('task-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/título da tarefa é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('deve chamar onSubmit com dados corretos ao submeter', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm task={null} onSubmit={onSubmit} onClose={onClose} />);

    await user.type(screen.getByLabelText(/título/i), 'Minha tarefa de teste');
    await user.type(screen.getByLabelText(/descrição/i), 'Uma descrição');

    fireEvent.click(screen.getByText('Criar tarefa'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Minha tarefa de teste',
        description: 'Uma descrição',
      });
    });
  });

  it('deve chamar onClose ao clicar em Cancelar', () => {
    const onClose = vi.fn();
    render(<TaskForm task={null} onSubmit={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve chamar onClose ao clicar no botão X', () => {
    const onClose = vi.fn();
    render(<TaskForm task={null} onSubmit={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Fechar modal'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('TaskForm — modo edição', () => {
  const editTask = {
    id: 5,
    title: 'Tarefa para editar',
    description: 'Descrição original',
    done: false,
    createdAt: new Date().toISOString(),
  };

  it('deve exibir título "Editar Tarefa" no modo edição', () => {
    render(<TaskForm task={editTask} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Editar Tarefa')).toBeInTheDocument();
  });

  it('deve pré-preencher campos com dados da tarefa', () => {
    render(<TaskForm task={editTask} onSubmit={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByLabelText(/título/i)).toHaveValue('Tarefa para editar');
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('Descrição original');
  });

  it('deve exibir botão "Salvar alterações" no modo edição', () => {
    render(<TaskForm task={editTask} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Salvar alterações')).toBeInTheDocument();
  });
});
