const POST_URL = "http://localhost:3000/posts";
const COMMENT_URL = "http://localhost:3000/comments";

// ---------------- POSTS ----------------
async function LoadData() {
  let res = await fetch(POST_URL);
  let posts = await res.json();

  let body = document.getElementById("body_table");
  body.innerHTML = "";

  for (const post of posts) {
    const isDeleted = post.isDeleted === true;

    body.innerHTML += `
      <tr class="${isDeleted ? "deleted" : ""}">
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${post.views}</td>
        <td>${isDeleted ? "DELETED" : "ACTIVE"}</td>
        <td>
          <input type="submit" value="Edit" onclick="FillPostForm('${post.id}')" />
          <input type="submit" value="Delete" onclick="Delete('${post.id}')" ${isDeleted ? "disabled" : ""} />
        </td>
      </tr>
    `;
  }
}

async function getMaxPostId() {
  let res = await fetch(POST_URL);
  let posts = await res.json();

  let maxId = 0;
  for (const p of posts) {
    // id lưu dạng chuỗi -> parseInt để tìm max
    let n = parseInt(p.id, 10);
    if (!isNaN(n) && n > maxId) maxId = n;
  }
  return maxId;
}

function ClearPostForm() {
  document.getElementById("id_txt").value = "";
  document.getElementById("title_txt").value = "";
  document.getElementById("view_txt").value = "";
}

async function FillPostForm(id) {
  let res = await fetch(POST_URL + "/" + id);
  if (!res.ok) return;

  let post = await res.json();
  document.getElementById("id_txt").value = post.id;
  document.getElementById("title_txt").value = post.title;
  document.getElementById("view_txt").value = post.views;
}

async function Save() {
  let id = document.getElementById("id_txt").value.trim(); // nếu trống => tạo mới
  let title = document.getElementById("title_txt").value;
  let views = document.getElementById("view_txt").value;

  // UPDATE nếu có id và tồn tại
  if (id !== "") {
    let getItem = await fetch(POST_URL + "/" + id);

    if (getItem.ok) {
      // PUT: giữ isDeleted nếu có
      let oldPost = await getItem.json();
      let res = await fetch(POST_URL + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: String(id),
          title: title,
          views: views,
          isDeleted: oldPost.isDeleted === true
        }),
      });

      if (res.ok) console.log("Update post thanh cong");
      await LoadData();
      return false;
    }
  }

  // CREATE: id trống => tự tăng maxId + 1
  let maxId = await getMaxPostId();
  let newId = String(maxId + 1);

  try {
    let res = await fetch(POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newId,          // lưu chuỗi
        title: title,
        views: views,
        isDeleted: false
      }),
    });

    if (res.ok) console.log("Create post thanh cong");
  } catch (error) {
    console.log(error);
  }

  ClearPostForm();
  LoadData();
  return false;
}

// XÓA MỀM: PATCH isDeleted:true
async function Delete(id) {
  let res = await fetch(POST_URL + "/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isDeleted: true }),
  });

  if (res.ok) console.log("Soft delete thanh cong");
  LoadData();
  return false;
}

// ---------------- COMMENTS CRUD ----------------
async function LoadComments() {
  let res = await fetch(COMMENT_URL);
  let comments = await res.json();

  let body = document.getElementById("comment_table");
  body.innerHTML = "";

  for (const c of comments) {
    body.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.text}</td>
        <td>${c.postId}</td>
        <td>
          <input type="submit" value="Edit" onclick="FillCommentForm('${c.id}')" />
          <input type="submit" value="Delete" onclick="DeleteComment('${c.id}')" />
        </td>
      </tr>
    `;
  }
}

async function getMaxCommentId() {
  let res = await fetch(COMMENT_URL);
  let comments = await res.json();

  let maxId = 0;
  for (const c of comments) {
    let n = parseInt(c.id, 10);
    if (!isNaN(n) && n > maxId) maxId = n;
  }
  return maxId;
}

function ClearCommentForm() {
  document.getElementById("c_id_txt").value = "";
  document.getElementById("c_text_txt").value = "";
  document.getElementById("c_postid_txt").value = "";
}

async function FillCommentForm(id) {
  let res = await fetch(COMMENT_URL + "/" + id);
  if (!res.ok) return;

  let c = await res.json();
  document.getElementById("c_id_txt").value = c.id;
  document.getElementById("c_text_txt").value = c.text;
  document.getElementById("c_postid_txt").value = c.postId;
}

async function SaveComment() {
  let id = document.getElementById("c_id_txt").value.trim(); // trống => tạo mới
  let text = document.getElementById("c_text_txt").value;
  let postId = document.getElementById("c_postid_txt").value;

  // UPDATE nếu có id và tồn tại
  if (id !== "") {
    let getItem = await fetch(COMMENT_URL + "/" + id);
    if (getItem.ok) {
      let res = await fetch(COMMENT_URL + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: String(id),
          text: text,
          postId: String(postId),
        }),
      });

      if (res.ok) console.log("Update comment thanh cong");
      await LoadComments();
      return false;
    }
  }

  // CREATE: id trống => tự tăng
  let maxId = await getMaxCommentId();
  let newId = String(maxId + 1);

  let res = await fetch(COMMENT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: newId,           // lưu chuỗi
      text: text,
      postId: String(postId),
    }),
  });

  if (res.ok) console.log("Create comment thanh cong");

  ClearCommentForm();
  LoadComments();
  return false;
}

async function DeleteComment(id) {
  let res = await fetch(COMMENT_URL + "/" + id, {
    method: "DELETE",
  });

  if (res.ok) console.log("Delete comment thanh cong");
  LoadComments();
  return false;
}

// Load ban đầu
LoadData();
LoadComments();
