"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { auth, provider, signInWithPopup } from "./firebase";
import styles from "./todo-list.module.css";
import Loader from './components/loader';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [userLoggedIn , setUserLoggedIn] = useState<boolean>(false)
  const BASE_URL = 'http://localhost:8000'

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setUserLoggedIn(true)
      fetchTodos(JSON.parse(storedUser).token);
    } else {
      setUserLoggedIn(false)
      const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    }
  }, []);

  const fetchTodos = async (token: string) => {
    const response = await fetch(`${BASE_URL}/todos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if(response.status == 401){
      auth.signOut();
      setUser(null);
      setTodos([]);
      localStorage.removeItem('user');
      localStorage.removeItem('todos');
    } else {
      const todosData = await response.json();
      setTodos(todosData);
    }
  };

  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(userLoggedIn){
      if (e.key === 'Enter' && newTodo.trim()) {
        const response = await fetch(`${BASE_URL}/todos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            title: newTodo.trim(),
            completed: false,
          }),
        });
        const newTodoData = await response.json();
        setTodos([...todos, { id: newTodoData.id, title: newTodo.trim(), completed: false }]);
        setNewTodo('');
      }
    } else {
      if (e.key === 'Enter' && newTodo.trim()) {
        const newTodoItem = { id: Date.now(), title: newTodo.trim(), completed: false };
        setTodos([...todos, newTodoItem]);
        setNewTodo('');
      }
    }
  };

  const editTodo = (id: number, newTitle: string) => {
    const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, title: newTitle } : todo
      );
      setTodos(updatedTodos);
  };

  const handleEdit = async (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if(userLoggedIn){
      if (e.key == 'Enter' && e.currentTarget.value.trim()) {
        const response = await fetch(`${BASE_URL}/todos?todo_id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            title: e.currentTarget.value.trim(),
            completed: false,
          }),
        });
        const newTodoData = await response.json();
        alert("ToDo list updated")
        setTodos([...todos])
      }
    } else {
      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
        editTodo(id, e.currentTarget.value.trim());
      }
    }
  };

  const toggleComplete = async (id: number, checked: boolean) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    if(userLoggedIn){
        await fetch(`${BASE_URL}/todos?todo_id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            completed: checked,
          }),
        });
    }
  };

  const setAlreadyInsertedTodos = (todo:object, token:string) => {
    const promises = todos.map(todo => {
      return fetch(`${BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: todo.title,
          completed: todo.completed,
        }),
      });
    });
  
    return Promise.all(promises);
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result)
      const token = await result.user.getIdToken();
      const userData = { token, uid: result.user.uid, email: result.user.email, name: result.user.displayName };
      localStorage.setItem('user', JSON.stringify(userData));
      if (todos.length > 0) {
        localStorage.setItem('todos', JSON.stringify(todos));
      }
      for(let i = 0; i < todos.length; i++){
        await setAlreadyInsertedTodos(todos[i], userData.token);
      }
      setUser(userData);
      fetchTodos(token);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    setUserLoggedIn(false)
    setTodos([]);
    localStorage.removeItem('user');
    localStorage.removeItem('todos');
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.loginContainer}>
        {!user ? (
          <button className={styles.loginButton} onClick={handleLogin}>
            Login <span className={styles.infoIcon} title="To sync changes, please login now.">ⓘ</span>
          </button>

        ): 
        <>
        <span className={styles.displayName}>Welcome {user.name}!</span>
        <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
        </button>
        </>
      }
        </div>
      </div>
      <h1 className={styles.title}>My ToDo List</h1>
      <input
        type="text"
        placeholder="Add a new task..."
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyPress={addTodo}
        className={styles.addInput}
      />
      <ul className={styles.list}>
        {todos.map((todo) => (
          <li key={todo.id} className={`${styles.item} ${todo.completed ? styles.completed : ""}`}>
            <input
              type="text"
              value={todo.title}
              onChange={(e) => editTodo(todo.id, e.target.value)}
              onKeyPress={(e) => handleEdit(e, todo.id)}
              className={styles.editInput}
            />
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(event) => toggleComplete(todo.id, event.target.checked)}
              className={styles.checkbox}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
