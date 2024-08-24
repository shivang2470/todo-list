"use client";

import { useState, useEffect } from "react";
import Auth from "./Auth";
import TodoItem from "./TodoItem";
import Loader from "./Loader";
import { fetchTodos, addTodo, updateTodo, deleteTodo } from "../api/todos";
import styles from "../styles/todo-list.module.css";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setUserLoggedIn(true);
      loadTodos(userData.token);
    } else {
      const savedTodos = localStorage.getItem("todos");
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    }
  }, []);

  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  const loadTodos = async (token: string) => {
    setLoader(true);
    const todosData = await fetchTodos(token);
    setTodos(todosData);
    setLoader(false);
  };

  const syncTodosWithServer = async (token: string) => {
    setLoader(true);
    for (let todo of todos) {
      await addTodo(todo.title, token);
    }
    await loadTodos(token);
    setLoader(false);
  };

  const handleAddTodo = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTodo.trim()) {
      setLoader(true);
      userLoggedIn
        ? await addTodo(newTodo.trim(), user.token)
        : { id: Date.now(), title: newTodo.trim(), completed: false };
      setTodos([...todos, { id: Date.now(), title: newTodo.trim(), completed: false }]);
      setNewTodo("");
      setLoader(false);
    }
  };

  const handleEditTodo = async (id: number, newTitle: string) => {
    if (userLoggedIn) {
      setLoader(true);
      await updateTodo(id, newTitle, false, user.token);
      setLoader(false);
    }
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, title: newTitle } : todo));
    setTodos(updatedTodos);
  };

  const handleToggleComplete = async (id: number, checked: boolean) => {
    if (userLoggedIn) {
      setLoader(true);
      await updateTodo(id, undefined, checked, user.token);
      setLoader(false);
    }
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: checked } : todo));
    setTodos(updatedTodos);
  };

  const handleDeleteTodo = async (id: number) => {
    if (userLoggedIn) {
      setLoader(true);
      await deleteTodo(id, user.token);
      setLoader(false);
    }
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  const editTodo = (id: number, newTitle: string) => {
    const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, title: newTitle } : todo
      );
      setTodos(updatedTodos);
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <Auth user={user} setTodos={setTodos} setUser={setUser} setUserLoggedIn={setUserLoggedIn} setLoader={setLoader} syncTodosWithServer={syncTodosWithServer} />
      </div>
      <h1 className={styles.title}>My ToDo List</h1>
      <input
        type="text"
        placeholder="Add a new task..."
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyPress={handleAddTodo}
        className={styles.addInput}
      />
      <ul className={styles.list}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            editTodo={editTodo}
            onEdit={handleEditTodo}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTodo}
          />
        ))}
      </ul>
      {loader && <Loader />}
    </div>
  );
}
