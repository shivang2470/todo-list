const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchTodos = async (token: string) => {
  const response = await fetch(`${BASE_URL}/todos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 401) {
    throw new Error("Unauthorized");
  }
  return await response.json();
};

export const addTodo = async (title: string, token: string) => {
  const response = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, completed: false }),
  });
  return await response.json();
};

export const updateTodo = async (
  id: number,
  title?: string,
  completed?: boolean,
  token?: string
) => {
  const response = await fetch(`${BASE_URL}/todos?todo_id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, completed }),
  });
  return await response.json();
};

export const deleteTodo = async (id: number, token: string) => {
  await fetch(`${BASE_URL}/todos?todo_id=${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
