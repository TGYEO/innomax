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
  const sessionDuration = 1000 * 60 * 30; // 30분
  const remainingTime = sessionDuration - (now - loginTime);

  if (remainingTime <= 0) {
    alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
    localStorage.clear();
    window.location.href = "index.html";
    return;
  }

  // ✅ 스톱워치 초기화
  const stopwatchEl = document.getElementById("stopwatch");
  let timeLeft = remainingTime;

  function updateStopwatch() {
    if (!stopwatchEl) return;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    stopwatchEl.textContent = `남은 시간: ${minutes}:${seconds.toString().padStart(2, "0")}`;

    if (timeLeft <= 0) {
      alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
      localStorage.clear();
      window.location.href = "index.html";
      return;
    }

    timeLeft -= 1000;
  }

  updateStopwatch();
  const timer = setInterval(updateStopwatch, 1000);

  // ✅ 로그아웃 버튼 이벤트
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    clearInterval(timer); // 타이머 정지
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

  document.getElementById("logoImage")?.addEventListener("click", () => {
    window.location.href = "workspace.html";
  });
}
