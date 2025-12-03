// src/view.ts

export function initView(API_BASE: string) {
  const userData = localStorage.getItem("user");

  if (!userData) {
    alert("세션 만료 또는 비정상 접근입니다.");
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(userData);
  const userName = document.getElementById("userName");
  const avatar = document.getElementById("avatar");

  if (userName) userName.textContent = user.name;
  if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();

  // ✅ 세션 만료 체크 (30분 기준)
  const loginTime = user.loginTime;
  const now = Date.now();
  if (now - loginTime > 1000 * 60 * 30) {
    alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
    localStorage.clear();
    window.location.href = "index.html";
  }

  // ✅ 로그아웃 버튼 이벤트
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    fetch(`${API_BASE}/api/login/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => { /* 무시 */ });
    window.location.href = "index.html";
  });

  // ✅ 뒤로가기 방지
  history.pushState(null, "", location.href);
  window.onpopstate = function () {
    history.go(1);
  };
}
