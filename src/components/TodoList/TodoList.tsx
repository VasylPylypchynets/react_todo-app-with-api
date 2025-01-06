import { Todo } from '../../types/Todo';
import { TodoItem } from '../TodoItem/TodoItem';

type TodoListProps = {
  onDeleteTodo: (id: number) => void;
  todos: Todo[];
  isLoadingChange: boolean;
  deleteTodoId: number | null;
  cleanCompleted: boolean;
  tempTodo: Todo | null;
  onUpdateTodo: (id: number) => void;
  isUpdating: null | number;
  itemEditingId: null | number;
  onItemEditingId: (id: number | null) => void;
  newTitle: string;
  onSetNewTitle: (title: string) => void;
  onUpdateNewTitle: (id: number, title: string) => void;
};

export function TodoList({
  onDeleteTodo,
  todos,
  isLoadingChange,
  deleteTodoId,
  cleanCompleted,
  tempTodo,
  onUpdateTodo,
  isUpdating,
  itemEditingId,
  onItemEditingId,
  newTitle,
  onSetNewTitle,
  onUpdateNewTitle,
}: TodoListProps) {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          todo={todo}
          onDeleteTodo={onDeleteTodo}
          isLoadingChange={isLoadingChange}
          deleteTodoId={deleteTodoId}
          key={todo.id}
          cleanCompleted={cleanCompleted}
          onUpdateTodo={onUpdateTodo}
          isUpdating={isUpdating}
          itemEditingId={itemEditingId}
          onItemEditingId={onItemEditingId}
          newTitle={newTitle}
          onSetNewTitle={onSetNewTitle}
          onUpdateNewTitle={onUpdateNewTitle}
        />
      ))}

      {tempTodo && (
        <TodoItem
          todo={tempTodo}
          onDeleteTodo={onDeleteTodo}
          isLoadingChange={isLoadingChange}
          deleteTodoId={deleteTodoId}
          key={tempTodo.id}
          cleanCompleted={cleanCompleted}
          onUpdateTodo={onUpdateTodo}
          isAdding={TodoItem !== null}
          itemEditingId={itemEditingId}
          onItemEditingId={onItemEditingId}
          newTitle={newTitle}
          onSetNewTitle={onSetNewTitle}
          onUpdateNewTitle={onUpdateNewTitle}
        />
      )}
    </section>
  );
}
