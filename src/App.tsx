/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
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

export const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [itemsLeft, setItemsLeft] = useState<number>(0);
  const [sortBy, setSortBy] = useState('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteTodoId, setDeleteTodoId] = useState<number | null>(null);
  const [isLoadingChange, setIsLoadingChange] = useState(false);
  const [cleanCompleted, setCleanCompleted] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isSubmiting, setIsSubmiting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [itemEditingId, setItemEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [todosLength, setTodosLength] = useState<number>(0);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilter(sort: string) {
    switch (sort) {
      case 'all':
        setTodos(currentTodos => currentTodos);
        break;
      case 'active':
        setTodos(currentTodos => currentTodos.filter(todo => !todo.completed));
        break;
      case 'completed':
        setTodos(currentTodos => currentTodos.filter(todo => todo.completed));
        break;
    }
  }

  function handleUpadateNewTitle(id: number, title: string) {
    const todo = todos.find(currentTodo => currentTodo.id === id);

    if (todo?.title === title) {
      setItemEditingId(null);
      setNewTitle('');

      return;
    }

    if (title) {
      setIsUpdating(id);
      setErrorMessage(null);

      if (!todo) {
        return;
      }

      const updatedTitle = { title: title.trim() };

      updateTodo(id, updatedTitle)
        .then(() => {
          setTodos(currentTodos =>
            currentTodos.map(item =>
              item.id === id ? { ...item, title: updatedTitle.title } : item,
            ),
          );

          setAllTodos(currentTodos => {
            return currentTodos.map(item =>
              item.id === id ? { ...item, title: updatedTitle.title } : item,
            );
          });
        })
        .catch(() => {
          setErrorMessage('Unable to update a todo');
        })
        .finally(() => {
          setIsUpdating(null);
        });
    }

    if (title.trim() === '') {
      setDeleteTodoId(id);
    }
  }

  function handleUpdateTodo(id: number) {
    const todo = todos.find(currentTodo => currentTodo.id === id);

    if (!todo) {
      return;
    }

    const updatedStatus = { completed: !todo.completed };

    if (updatedStatus) {
      setIsUpdating(id);
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

          setAllTodos(currentTodos =>
            currentTodos.map(item =>
              item.id === id
                ? { ...item, completed: updatedStatus.completed }
                : item,
            ),
          );

          handleFilter(sortBy);

          if (updatedStatus.completed) {
            setItemsLeft(currentItemsLeft => currentItemsLeft - 1);
          } else {
            setItemsLeft(currentItemsLeft => currentItemsLeft + 1);
          }
        })
        .catch(() => {
          setErrorMessage('Unable to update a todo');
        })
        .finally(() => {
          setIsUpdating(null);
        });
    }
  }

  function handleUpdateAllTodos() {
    const hasUncompleteTodo = todos.findIndex(todo => !todo.completed);

    if (hasUncompleteTodo >= 0) {
      const updatedStatus = { completed: true };

      const updateTodos = async () => {
        const updatedTodos: Promise<number | null>[] = todos.map(async todo => {
          if (!todo.completed) {
            setIsUpdating(todo.id);
            setErrorMessage(null);

            try {
              await updateTodo(todo.id, updatedStatus);

              setItemsLeft(currentItemsLeft => currentItemsLeft - 1);

              return todo.id;
            } catch {
              setErrorMessage('Unable to update a todo');

              return null;
            } finally {
              setIsUpdating(null);
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

        setAllTodos(currentTodos => {
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

        handleFilter(sortBy);
      };

      updateTodos();
    }

    if (hasUncompleteTodo < 0) {
      const updatedStatus = { completed: false };

      const updateTodos = async () => {
        const updatedTodos: Promise<number | null>[] = todos.map(async todo => {
          setIsUpdating(todo.id);
          setErrorMessage(null);

          try {
            await updateTodo(todo.id, updatedStatus);

            setItemsLeft(currentItemsLeft => currentItemsLeft + 1);

            return todo.id;
          } catch {
            setErrorMessage('Unable to update a todo');

            return null;
          } finally {
            setIsUpdating(null);
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

        setAllTodos(currentTodos => {
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

        handleFilter(sortBy);
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

  function handleDeleteTodo(id: number) {
    setDeleteTodoId(id);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  function handleCleanCompleted() {
    setCleanCompleted(true);
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
          setAllTodos(currentTodos => [...currentTodos, receivedTodo]);
          setItemsLeft(currentItemsLeft => currentItemsLeft + 1);
          setTodosLength(currentTodosLength => currentTodosLength + 1);
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
    if (errorMessage) {
      const timerEmpty = setTimeout(() => setErrorMessage(null), 3000);

      return () => clearTimeout(timerEmpty);
    }
  }, [errorMessage]);

  useEffect(() => {
    async function deleteTodoFromServer() {
      if (deleteTodoId !== null) {
        setIsLoadingChange(true);

        try {
          await deleteTodo(deleteTodoId).then(() => {
            const newTodos = todos.filter(todo => todo.id !== deleteTodoId);

            setTodos(newTodos);
            setAllTodos(newTodos);
            setTodosLength(newTodos.length);
          });
        } catch {
          setErrorMessage('Unable to delete a todo');
        } finally {
          setIsLoadingChange(false);

          const numbersOfItemsLeft: number = todos.filter(
            todo => !todo.completed,
          ).length;

          setItemsLeft(numbersOfItemsLeft);
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

        const completedTodos = allTodos.filter(todo => todo.completed);
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

        setAllTodos(prevTodos =>
          prevTodos.filter(todo => !successfulDeletions.includes(todo.id)),
        );

        setTodosLength(prevTodos => prevTodos - successfulDeletions.length);

        const numbersOfItemsLeft: number = todos.filter(
          todo => !todo.completed,
        ).length;

        setItemsLeft(numbersOfItemsLeft);
      }

      setIsLoadingChange(false);
      setCleanCompleted(false);
    }

    deleteTodoFromServer();
  }, [cleanCompleted, todos]);

  useEffect(() => {
    async function getTodosFromServer() {
      try {
        const todosFromServer = await getTodos();

        setTodosLength(todosFromServer.length);

        const numbersOfItemsLeft: number = todosFromServer.filter(
          todo => !todo.completed,
        ).length;

        setItemsLeft(numbersOfItemsLeft);
        setErrorMessage(null);
        setTodos(todosFromServer);
        setAllTodos(todosFromServer);

        handleFilter(sortBy);
      } catch {
        setErrorMessage('Unable to load todos');
      }
    }

    getTodosFromServer();
  }, [sortBy]);

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
          onUpdateAllTodos={handleUpdateAllTodos}
          itemsLeft={itemsLeft}
        />

        <TodoList
          onDeleteTodo={handleDeleteTodo}
          todos={todos}
          isLoadingChange={isLoadingChange}
          deleteTodoId={deleteTodoId}
          cleanCompleted={cleanCompleted}
          tempTodo={tempTodo}
          onUpdateTodo={handleUpdateTodo}
          isUpdating={isUpdating}
          itemEditingId={itemEditingId}
          onItemEditingId={setItemEditingId}
          newTitle={newTitle}
          onSetNewTitle={setNewTitle}
          onUpdateNewTitle={handleUpadateNewTitle}
        />

        {/* Hide the footer if there are no todos */}
        {todosLength !== 0 && (
          <Footer
            itemsLeft={itemsLeft}
            sortBy={sortBy}
            onSortBy={setSortBy}
            onCleanCompleted={handleCleanCompleted}
            todosLength={todosLength}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}

      <Error errorMessage={errorMessage} onErrorMessage={setErrorMessage} />
    </div>
  );
};
