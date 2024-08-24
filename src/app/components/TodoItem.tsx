import React from "react";
import styles from "../styles/todo-list.module.css";

interface TodoItemProps {
  todo: { id: number; title: string; completed: boolean };
  editTodo: (id: number, newTitle: string) => void;
  onEdit: (id: number, newTitle: string) => void;
  onToggleComplete: (id: number, checked: boolean) => void;
  onDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, editTodo, onEdit, onToggleComplete, onDelete }) => {
  const handleEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      onEdit(todo.id, e.currentTarget.value.trim());
    }
  };

  return (
    <li className={`${styles.item} ${todo.completed ? styles.completed : ""}`}>
      <input
        type="text"
        value={todo.title}
        onChange={(e) => editTodo(todo.id, e.currentTarget.value)}
        onKeyPress={handleEdit}
        className={styles.editInput}
      />
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(event) => onToggleComplete(todo.id, event.target.checked)}
        className={styles.checkbox}
      />
      <button className={styles.deleteButton} onClick={() => onDelete(todo.id)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24px" height="24px" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
};

export default TodoItem;
