/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  deleteTodo,
  getTodos,
  addTodo,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { Header } from './components/Header/Header';
import { TodoList } from './components/TodoList/TodoList';
import { Footer } from './components/Footer/Footer';
import { Error } from './components/ErrorMessage/ErrorMessage';

export enum SortBy {
  All = 'all',
  Active = 'active',
  Completed = 'completed',
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [query, setQuery] = useState<string>('');
  const [isLoadingChange, setIsLoadingChange] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<number[] | null>(null);

  const [sortBy, setSortBy] = useState<SortBy>(SortBy.All);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteTodoId, setDeleteTodoId] = useState<number | null>(null);
  const [cleanCompleted, setCleanCompleted] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function getTodosFromServer() {
      try {
        const todosFromServer = await getTodos();

        setTodos(todosFromServer);
        setErrorMessage(null);
      } catch {
        setErrorMessage('Unable to load todos');
      }
    }

    getTodosFromServer();
  }, []);

  const itemsLeft = useMemo(() => {
    return todos.filter(todo => !todo.completed).length;
  }, [todos]);

  const handleFilter = useCallback(
    (sort: SortBy, tasks: Todo[] = todos) => {
      switch (sort) {
        case SortBy.All:
          return tasks;
        case SortBy.Active:
          return tasks.filter(todo => !todo.completed);
        case SortBy.Completed:
          return tasks.filter(todo => todo.completed);
      }
    },
    [todos],
  );

  const filteredTodos: Todo[] = useMemo(
    () => handleFilter(sortBy, todos),
    [sortBy, todos, handleFilter],
  );

  function handleUpdateTodoStatus(id: number) {
    const todo = todos.find(currentTodo => currentTodo.id === id);

    if (!todo) {
      return;
    }

    const updatedStatus = { completed: !todo.completed };

    if (updatedStatus) {
      setIsUpdating([id]);
      setErrorMessage(null);

      updateTodo(id, updatedStatus)
        .then(() => {
          setTodos(currentTodos =>
            currentTodos.map(item =>
              item.id === id
                ? { ...item, completed: updatedStatus.completed }
                : item,
            ),
          );
        })
        .catch(() => {
          setErrorMessage('Unable to update a todo');
        })
        .finally(() => {
          setIsUpdating(null);
        });
    }
  }

  function handleUpdateAllTodosStatus() {
    const hasUncompleteTodo = todos.findIndex(todo => !todo.completed);

    if (hasUncompleteTodo >= 0) {
      const updatedStatus = { completed: true };

      const updateTodos = async () => {
        const updatedTodos: Promise<number | null>[] = todos.map(async todo => {
          if (!todo.completed) {
            setIsUpdating(prev => {
              if (prev === null) {
                return [todo.id];
              } else {
                return [...prev, todo.id];
              }
            });
            setErrorMessage(null);

            try {
              await updateTodo(todo.id, updatedStatus);

              return todo.id;
            } catch {
              setErrorMessage('Unable to update a todo');

              return null;
            }
          }

          return null;
        });

        const updatedTodo = await Promise.all(updatedTodos);

        const successfulUpdated = updatedTodo.filter(
          id => id !== null,
        ) as number[];

        setTodos(currentTodos => {
          return currentTodos.map(todo => {
            if (successfulUpdated.includes(todo.id)) {
              return {
                ...todo,
                completed: true,
              };
            } else {
              return todo;
            }
          });
        });

        setIsUpdating(null);
      };

      updateTodos();
    }

    if (hasUncompleteTodo < 0) {
      const updatedStatus = { completed: false };

      const updateTodos = async () => {
        const updatedTodos: Promise<number | null>[] = todos.map(async todo => {
          setIsUpdating(prev => {
            if (prev === null) {
              return [todo.id];
            } else {
              return [...prev, todo.id];
            }
          });
          setErrorMessage(null);

          try {
            await updateTodo(todo.id, updatedStatus);

            return todo.id;
          } catch {
            setErrorMessage('Unable to update a todo');

            return null;
          }
        });

        const updatedTodo = await Promise.all(updatedTodos);

        const successfulUpdated = updatedTodo.filter(
          id => id !== null,
        ) as number[];

        setTodos(currentTodos => {
          return currentTodos.map(todo => {
            if (successfulUpdated.includes(todo.id)) {
              return {
                ...todo,
                completed: false,
              };
            } else {
              return todo;
            }
          });
        });
        setIsUpdating(null);
      };

      updateTodos();
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (query.trim() !== '') {
      setNewTask(query);
      setIsSubmiting(true);
    } else {
      setErrorMessage('Title should not be empty');
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  useEffect(() => {
    if (inputRef.current || (errorMessage && inputRef.current)) {
      inputRef.current.focus();
    }
  }, [query, errorMessage, todos]);

  useEffect(() => {
    if (newTask.trim() !== '') {
      const todo: Omit<Todo, 'id'> = {
        userId: USER_ID,
        title: newTask.trim(),
        completed: false,
      };

      setTempTodo({ id: 0, ...todo });

      addTodo(todo)
        .then(receivedTodo => {
          setTempTodo(null);
          setQuery('');
          setTodos(currentTodos => [...currentTodos, receivedTodo]);
        })
        .catch(() => {
          setErrorMessage('Unable to add a todo');

          if (inputRef.current) {
            inputRef.current.focus();
          }
        })
        .finally(() => {
          setTempTodo(null);
          setIsSubmiting(false);
          setNewTask('');
        });
    } else {
      setIsSubmiting(false);
    }
  }, [newTask]);

  useEffect(() => {
    let timerEmpty: NodeJS.Timeout;

    if (errorMessage) {
      timerEmpty = setTimeout(() => setErrorMessage(null), 3000);
    }

    return () => clearTimeout(timerEmpty);
  }, [errorMessage]);

  useEffect(() => {
    async function deleteTodoFromServer() {
      if (deleteTodoId !== null) {
        setIsLoadingChange(true);

        try {
          await deleteTodo(deleteTodoId).then(() => {
            const newTodos = todos.filter(todo => todo.id !== deleteTodoId);

            setTodos(newTodos);
          });
        } catch {
          setErrorMessage('Unable to delete a todo');
        } finally {
          setIsLoadingChange(false);
        }
      }
    }

    const cleanup = deleteTodoFromServer();

    return () => {
      if (cleanup instanceof Function) {
        cleanup();
      }
    };
  }, [deleteTodoId, todos]);

  useEffect(() => {
    async function deleteTodoFromServer() {
      if (cleanCompleted) {
        setIsLoadingChange(true);

        const completedTodos = todos.filter(todo => todo.completed);
        const deletionPromises = completedTodos.map(async todo => {
          try {
            await deleteTodo(todo.id);

            return todo.id;
          } catch (error) {
            setErrorMessage('Unable to delete a todo');

            return null;
          }
        });

        const resolvedDeletions = await Promise.all(deletionPromises);

        const successfulDeletions = resolvedDeletions.filter(
          id => id !== null,
        ) as number[];

        setTodos(prevTodos =>
          prevTodos.filter(todo => !successfulDeletions.includes(todo.id)),
        );
      }

      setIsLoadingChange(false);
      setCleanCompleted(false);
    }

    deleteTodoFromServer();
  }, [cleanCompleted, todos]);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          query={query}
          onInput={handleInput}
          onSubmit={handleSubmit}
          isSubmiting={isSubmiting}
          inputRef={inputRef}
          onUpdateAllTodos={handleUpdateAllTodosStatus}
          itemsLeft={itemsLeft}
          todosLength={todos.length}
        />

        <TodoList
          onDeleteTodo={setDeleteTodoId}
          todos={filteredTodos}
          isLoadingChange={isLoadingChange}
          deleteTodoId={deleteTodoId}
          cleanCompleted={cleanCompleted}
          tempTodo={tempTodo}
          onUpdateTodo={handleUpdateTodoStatus}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
          setErrorMessage={setErrorMessage}
          setTodos={setTodos}
          setDeleteTodoId={setDeleteTodoId}
        />

        {/* Hide the footer if there are no todos */}
        {todos.length !== 0 && (
          <Footer
            itemsLeft={itemsLeft}
            sortBy={sortBy}
            onSortBy={setSortBy}
            onCleanCompleted={setCleanCompleted}
            todosLength={todos.length}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}

      <Error errorMessage={errorMessage} onErrorMessage={setErrorMessage} />
    </div>
  );
};
