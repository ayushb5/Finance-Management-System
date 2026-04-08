const BASE_URL = "https://69d340ac336103955f8eb706.mockapi.io";

// POST create user

async function createUser(data) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function getUsers() {
  const response = await fetch(`${BASE_URL}/users`);
  return response.json();
}
