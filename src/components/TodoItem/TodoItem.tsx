import classNames from 'classnames';

import { useEffect, useRef } from 'react';
import { Todo } from '../../types/Todo';

type TodoItemProps = {
  onDeleteTodo: (id: number) => void;
  todo: Todo;
  isLoadingChange: boolean;
  deleteTodoId: number | null;
  cleanCompleted: boolean;
  isAdding?: boolean;
  onUpdateTodo: (id: number) => void;
  isUpdating?: null | number;
  itemEditingId?: null | number;
  onItemEditingId: (id: number | null) => void;
  newTitle: string;
  onSetNewTitle: (title: string) => void;
  onUpdateNewTitle: (id: number, title: string) => void;
};

export function TodoItem({
  todo,
  onDeleteTodo,
  isLoadingChange,
  deleteTodoId,
  cleanCompleted,
  isAdding,
  onUpdateTodo,
  isUpdating,
  itemEditingId,
  onItemEditingId,
  newTitle,
  onSetNewTitle,
  onUpdateNewTitle,
}: TodoItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCancel(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onItemEditingId(null);
      onSetNewTitle(todo.title);
    }
  }

  useEffect(() => {
    if (itemEditingId === todo.id && inputRef.current) {
      inputRef.current.focus();
      onSetNewTitle(todo.title);
    }
  }, [itemEditingId, todo.id]);

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: todo.completed })}
    >
      <label htmlFor={`${todo.id}`} className="todo__status-label">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <input
          id={`${todo.id}`}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => onUpdateTodo(todo.id)}
        />
      </label>

      {itemEditingId !== todo.id && (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => onItemEditingId(todo.id)}
          >
            {todo.title}
          </span>
          {/* Remove button appears only on hover */}
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDeleteTodo(todo.id)}
          >
            ×
          </button>
        </>
      )}

      {/* This todo is being edited */}

      {/* This form is shown instead of the title and remove button */}
      {itemEditingId === todo.id && (
        <form
          onSubmit={e => {
            e.preventDefault();
            onUpdateNewTitle(todo.id, newTitle);
          }}
        >
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={newTitle}
            ref={inputRef}
            onChange={e => onSetNewTitle(e.target.value)}
            onBlur={() => {
              onItemEditingId(null);
              onUpdateNewTitle(todo.id, newTitle);
            }}
            onKeyUp={handleCancel}
          />
        </form>
      )}

      {/* Overlay will cover the todo while it is being deleted or updated */}
      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active':
            (isLoadingChange && deleteTodoId === todo.id) ||
            (cleanCompleted && todo.completed) ||
            isAdding ||
            isUpdating === todo.id,
        })}
        key={todo.id}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
}
