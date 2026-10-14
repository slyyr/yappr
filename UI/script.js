(function () {
  "use strict";

  const sidebar = document.getElementById("sidebar");
  const filesPanel = document.getElementById("filesPanel");
  const scrim = document.getElementById("scrim");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileFilesBtn = document.getElementById("mobileFilesBtn");
  const navItems = document.querySelectorAll(".nav-item");
  const emptyNotice = document.getElementById("emptyNotice");
const noticeClose = document.getElementById("noticeClose");

  const chatTitle = document.getElementById("chatTitle");
  const renameBtn = document.getElementById("renameBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const messages = document.getElementById("messages");

  const attachBtn = document.getElementById("attachBtn");
  const attachMenu = document.getElementById("attachMenu");
  const attachDocBtn = document.getElementById("attachDocBtn");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const hiddenFileInput = document.getElementById("hiddenFileInput");

  const dropzone = document.getElementById("dropzone");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileList = document.getElementById("fileList");
  const fileEmpty = document.getElementById("fileEmpty");
  const fileCount = document.getElementById("fileCount");
  const toast = document.getElementById("toast");

  const ALLOWED_EXTENSIONS = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "csv",
    "ppt",
    "pptx",
    "txt",
    "md",
  ];
  const ACCEPT = ALLOWED_EXTENSIONS.map((e) => "." + e).join(",");

  const ICONS = {
    pdf: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M15 2v5h5"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M15 2v5h5"/><path d="M8 13h8M8 17h6"/></svg>',
    text: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M8 13h8M8 17h8M8 9h3"/></svg>',
    slide:
      '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/></svg>',
    sheet:
      '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>',
  };

  function extOf(name) {
    return name.split(".").pop().toLowerCase();
  }

  function typeFromName(name) {
    const ext = extOf(name);
    if (ext === "pdf") return "pdf";
    if (["doc", "docx"].includes(ext)) return "doc";
    if (["txt", "md"].includes(ext)) return "text";
    if (["ppt", "pptx"].includes(ext)) return "slide";
    return "sheet";
  }

  function isAllowedDocument(file) {
    return ALLOWED_EXTENSIONS.includes(extOf(file.name));
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function currentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const suffix = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return hours + ":" + minutes + " " + suffix;
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }

  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  let fileRecords = [
    {
      name: "Project_Notes.pdf",
      size: "2.4 MB",
      time: "2 hours ago",
      type: "pdf",
    },
    {
      name: "coding_plan.txt",
      size: "12 KB",
      time: "5 hours ago",
      type: "text",
    },
    {
      name: "presentation.pptx",
      size: "4.2 MB",
      time: "1 day ago",
      type: "slide",
    },
    { name: "dataset.csv", size: "856 KB", time: "1 day ago", type: "sheet" },
  ];

  function updateCount() {
    fileCount.textContent = fileRecords.length;
    fileCount.classList.add("is-bump");
    setTimeout(() => fileCount.classList.remove("is-bump"), 250);
    fileEmpty.hidden = fileRecords.length > 0;
  }

  function renderFileList() {
    fileList.innerHTML = "";
    fileRecords.forEach((record, index) => {
      const li = document.createElement("li");
      li.className = "file-item";
      li.style.animationDelay = Math.min(index * 60, 360) + "ms";
      li.innerHTML =
        '<span class="file-icon file-icon--' +
        record.type +
        '">' +
        ICONS[record.type] +
        "</span>" +
        '<span class="file-info">' +
        '<span class="file-name">' +
        escapeHtml(record.name) +
        "</span>" +
        '<span class="file-meta">' +
        escapeHtml(record.size) +
        " · " +
        escapeHtml(record.time) +
        "</span>" +
        "</span>" +
        '<button class="file-menu-btn" data-index="' +
        index +
        '" aria-label="File options">' +
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg>' +
        "</button>" +
        '<div class="file-menu" data-menu="' +
        index +
        '">' +
        '<button data-action="open">Open</button>' +
        '<button data-action="download">Download</button>' +
        '<button data-action="rename">Rename</button>' +
        '<button class="danger" data-action="delete">Delete</button>' +
        "</div>";
      fileList.appendChild(li);
    });
    updateCount();
  }

  function buildFileCard(name, size, type) {
    return (
      '<div class="msg__attachment-file">' +
      '<span class="file-icon file-icon--' +
      type +
      '">' +
      ICONS[type] +
      "</span>" +
      '<span class="file-info">' +
      '<span class="file-name">' +
      escapeHtml(name) +
      "</span>" +
      '<span class="file-meta">' +
      escapeHtml(size) +
      "</span>" +
      "</span></div>"
    );
  }

  function scrollToBottom() {
    messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
  }

  function appendUserMessage(text, fileHtml) {
    const el = document.createElement("div");
    el.className = "msg msg--user";
    el.innerHTML =
      '<div class="msg__bubble">' +
      (text ? "<p></p>" : "") +
      (fileHtml || "") +
      "</div>" +
      '<span class="msg__time">' +
      currentTime() +
      "</span>";
    if (text) el.querySelector("p").textContent = text;
    messages.appendChild(el);
    scrollToBottom();
  }

  function appendWelcome() {
    const el = document.createElement("div");
    el.className = "msg msg--assistant";
    el.innerHTML =
      '<span class="avatar avatar--bot">Py</span>' +
      '<div class="msg__bubble">' +
      "<p><strong>Welcome to PyAssistant.</strong><br />Upload a document and I can help you work with it. Let me know if you'd like me to:</p>" +
      '<ul class="msg__actions">' +
      "<li>Summarize a document</li>" +
      "<li>Extract key points or data</li>" +
      "<li>Answer questions about its content</li>" +
      "</ul>" +
      '<span class="msg__time msg__time--inline">' +
      currentTime() +
      "</span>" +
      "</div>";
    messages.appendChild(el);
  }

  let noticeTimer;

  function showEmptyNotice() {
    emptyNotice.classList.add("is-visible");
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(hideEmptyNotice, 4000);
  }

  function hideEmptyNotice() {
    emptyNotice.classList.remove("is-visible");
  }

  noticeClose.addEventListener("click", hideEmptyNotice);

  function resetChat() {
    messages.innerHTML = "";
    chatTitle.textContent = "New Chat";
    appendWelcome();
  }

  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) {
      messageInput.value = "";
      messageInput.focus();
      showEmptyNotice();
      return;
    }
    hideEmptyNotice();
    appendUserMessage(text);
    messageInput.value = "";
    sendBtn.classList.remove("is-sent");
    void sendBtn.offsetWidth;
    sendBtn.classList.add("is-sent");
  }

  function addUploadedFile(file) {
    const type = typeFromName(file.name);
    const size = formatSize(file.size || 1024);
    fileRecords.unshift({
      name: file.name,
      size: size,
      time: "Just now",
      type: type,
    });
    renderFileList();
    return { name: file.name, size: size, type: type };
  }

  function handleIncomingFiles(incoming, postToChat) {
    const files = Array.from(incoming);
    let rejected = 0;
    let accepted = 0;
    files.forEach((file) => {
      if (isAllowedDocument(file)) {
        const info = addUploadedFile(file);
        accepted += 1;
        if (postToChat) {
          appendUserMessage("", buildFileCard(info.name, info.size, info.type));
        }
      } else {
        rejected += 1;
      }
    });
    if (rejected) {
      showToast(
        "Only documents are supported: PDF, DOC, DOCX, XLS, XLSX, CSV, PPT, PPTX, TXT, MD.",
      );
    } else if (accepted) {
      showToast(
        accepted === 1
          ? "Document uploaded."
          : accepted + " documents uploaded.",
      );
    }
  }

  function openMobileSidebar() {
    sidebar.classList.add("is-open");
    scrim.classList.add("is-open");
  }
  function closeMobileSidebar() {
    sidebar.classList.remove("is-open");
    if (!filesPanel.classList.contains("is-open")) {
      scrim.classList.remove("is-open");
    }
  }
  function openFilesPanel() {
    if (window.innerWidth <= 1180) {
      filesPanel.classList.add("is-open");
      scrim.classList.add("is-open");
    }
  }
  function closeFilesPanel() {
    filesPanel.classList.remove("is-open");
    if (!sidebar.classList.contains("is-open")) {
      scrim.classList.remove("is-open");
    }
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((n) => n.classList.remove("is-active"));
      item.classList.add("is-active");
      if (item.dataset.view === "files") {
        openFilesPanel();
      } else {
        closeFilesPanel();
      }
      closeMobileSidebar();
    });
  });

  mobileMenuBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("is-open")) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  });
  mobileFilesBtn.addEventListener("click", () => {
    if (filesPanel.classList.contains("is-open")) {
      closeFilesPanel();
    } else {
      openFilesPanel();
    }
  });
  scrim.addEventListener("click", () => {
    closeMobileSidebar();
    closeFilesPanel();
  });

  newChatBtn.addEventListener("click", resetChat);

  renameBtn.addEventListener("click", () => {
    const next = prompt("Rename this chat", chatTitle.textContent);
    if (next && next.trim()) {
      chatTitle.textContent = next.trim();
    }
  });

  sendBtn.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  let uploadTarget = "panel";

  function pickFiles(target) {
    uploadTarget = target;
    hiddenFileInput.accept = ACCEPT;
    hiddenFileInput.click();
  }

  attachBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    attachMenu.classList.toggle("is-open");
  });

  attachDocBtn.addEventListener("click", () => {
    attachMenu.classList.remove("is-open");
    pickFiles("chat");
  });

  document.addEventListener("click", (e) => {
    if (
      !attachMenu.contains(e.target) &&
      e.target !== attachBtn &&
      !attachBtn.contains(e.target)
    ) {
      attachMenu.classList.remove("is-open");
    }
  });

  hiddenFileInput.addEventListener("change", (e) => {
    handleIncomingFiles(e.target.files, uploadTarget === "chat");
    hiddenFileInput.value = "";
  });

  uploadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    pickFiles("panel");
  });
  dropzone.addEventListener("click", () => pickFiles("panel"));

  ["dragenter", "dragover"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("is-dragover");
    });
  });
  ["dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("is-dragover");
    });
  });
  dropzone.addEventListener("drop", (e) => {
    handleIncomingFiles(e.dataTransfer.files, false);
  });

  function closeAllFileMenus() {
    fileList
      .querySelectorAll(".file-menu.is-open")
      .forEach((m) => m.classList.remove("is-open"));
  }

  fileList.addEventListener("click", (e) => {
    const menuBtn = e.target.closest(".file-menu-btn");
    const actionBtn = e.target.closest("[data-action]");

    if (menuBtn) {
      e.stopPropagation();
      const menu = fileList.querySelector(
        '.file-menu[data-menu="' + menuBtn.dataset.index + '"]',
      );
      const isOpen = menu.classList.contains("is-open");
      closeAllFileMenus();
      if (!isOpen) menu.classList.add("is-open");
      return;
    }

    if (actionBtn) {
      const menu = actionBtn.closest(".file-menu");
      const index = Number(menu.dataset.menu);
      const item = menu.closest(".file-item");
      closeAllFileMenus();
      handleFileAction(actionBtn.dataset.action, index, item);
    }
  });

  function handleFileAction(action, index, item) {
    const record = fileRecords[index];
    if (!record) return;

    if (action === "delete") {
      item.classList.add("is-leaving");
      setTimeout(() => {
        fileRecords.splice(index, 1);
        renderFileList();
        showToast("Deleted " + record.name);
      }, 260);
    } else if (action === "rename") {
      const next = prompt("Rename file", record.name);
      if (next && next.trim()) {
        const trimmed = next.trim();
        if (!ALLOWED_EXTENSIONS.includes(extOf(trimmed))) {
          showToast(
            "Keep a supported document extension, such as .pdf or .docx.",
          );
          return;
        }
        record.name = trimmed;
        record.type = typeFromName(trimmed);
        renderFileList();
      }
    }
  }

  document.addEventListener("click", closeAllFileMenus);

  renderFileList();
  resetChat();
})();
