const BASE_URL = "Your API";

// GET
async function getData(endpoint) {
  const res = await fetch(`${BASE_URL}/${endpoint}`);
  if (!res.ok) throw new Error("GET failed");
  return res.json();
}

// INSERT
async function insertData(endpoint, data) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("POST failed");
  return res.json();
}

// UPDATE
async function updateData(endpoint, id, data) {
  const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("PUT failed");
  return res.json();
}

// DELETE
async function deleteData(endpoint, id) {
  const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("DELETE failed");
  return res.json();
}
