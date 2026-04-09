const DEFAULT_PROFILE = {
  name: "张晓晨",
  bio: "热爱前端开发，喜欢把普通页面做得更清晰、更好看，也更有交互感。",
  theme: "warm",
};

const elements = {
  body: document.body,
  card: document.querySelector(".profile-card"),
  avatar: document.getElementById("profileAvatar"),
  displayName: document.getElementById("displayName"),
  displayBio: document.getElementById("displayBio"),
  nameInput: document.getElementById("nameInput"),
  bioInput: document.getElementById("bioInput"),
  avatarInput: document.getElementById("avatarInput"),
  saveButton: document.getElementById("saveButton"),
  saveStatus: document.getElementById("saveStatus"),
  fileHint: document.getElementById("fileHint"),
  themeToggle: document.getElementById("themeToggle"),
};

const STORAGE_KEY = "profile-card-homework";
let avatarDataUrl = elements.avatar.src;

function applyProfile(profile) {
  const name = (profile.name || DEFAULT_PROFILE.name).trim() || DEFAULT_PROFILE.name;
  const bio = (profile.bio || DEFAULT_PROFILE.bio).trim() || DEFAULT_PROFILE.bio;

  elements.nameInput.value = name;
  elements.bioInput.value = bio;
  elements.displayName.textContent = name;
  elements.displayBio.textContent = bio;
}

// 优先恢复本地保存的数据，保证刷新页面后内容不会丢失。
function loadSavedProfile() {
  const savedProfile = localStorage.getItem(STORAGE_KEY);

  if (!savedProfile) {
    applyProfile(DEFAULT_PROFILE);
    applyTheme(DEFAULT_PROFILE.theme);
    return;
  }

  try {
    const parsedProfile = JSON.parse(savedProfile);
    applyProfile(parsedProfile);

    if (parsedProfile.avatar) {
      avatarDataUrl = parsedProfile.avatar;
      elements.avatar.src = avatarDataUrl;
    }

    applyTheme(parsedProfile.theme || DEFAULT_PROFILE.theme);
    showStatus("已恢复上次保存内容", true);
  } catch (error) {
    applyProfile(DEFAULT_PROFILE);
    applyTheme(DEFAULT_PROFILE.theme);
    showStatus("本地数据读取失败，已使用默认内容", false);
  }
}

function showStatus(message, isSuccess) {
  elements.saveStatus.textContent = message;
  elements.saveStatus.classList.toggle("success", Boolean(isSuccess));
}

function applyTheme(theme) {
  const isCool = theme === "cool";
  elements.body.classList.toggle("cool", isCool);
  elements.themeToggle.textContent = isCool ? "切换为暖色主题" : "切换为清新主题";
}

function persistThemePreference(theme) {
  let previousProfile = {};

  try {
    previousProfile = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    previousProfile = {};
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name: previousProfile.name || DEFAULT_PROFILE.name,
      bio: previousProfile.bio || DEFAULT_PROFILE.bio,
      avatar: previousProfile.avatar || avatarDataUrl,
      theme,
    })
  );
}

function saveProfile() {
  const name = elements.nameInput.value.trim() || DEFAULT_PROFILE.name;
  const bio = elements.bioInput.value.trim() || DEFAULT_PROFILE.bio;
  const theme = elements.body.classList.contains("cool") ? "cool" : "warm";

  elements.displayName.textContent = name;
  elements.displayBio.textContent = bio;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name,
      bio,
      avatar: avatarDataUrl,
      theme,
    })
  );

  elements.card.classList.remove("saved");
  void elements.card.offsetWidth;
  elements.card.classList.add("saved");
  showStatus("保存成功，卡片内容已更新", true);
}

function handleAvatarUpload(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showStatus("请选择图片文件作为头像", false);
    elements.fileHint.textContent = "当前文件不是图片，请重新选择。";
    elements.avatarInput.value = "";
    return;
  }

  // 读取本地图片并立即预览，不需要上传到服务器。
  const reader = new FileReader();

  reader.onload = () => {
    avatarDataUrl = reader.result;
    elements.avatar.src = avatarDataUrl;
    elements.fileHint.textContent = `已选择头像：${file.name}`;
    showStatus("头像已更新，记得点击保存", false);
  };

  reader.readAsDataURL(file);
}

function toggleTheme() {
  const nextTheme = elements.body.classList.contains("cool") ? "warm" : "cool";
  applyTheme(nextTheme);
  persistThemePreference(nextTheme);
  showStatus(`已切换为${nextTheme === "cool" ? "清新蓝" : "暖色橙"}主题`, false);
}

elements.saveButton.addEventListener("click", saveProfile);
elements.avatarInput.addEventListener("change", handleAvatarUpload);
elements.themeToggle.addEventListener("click", toggleTheme);

loadSavedProfile();
