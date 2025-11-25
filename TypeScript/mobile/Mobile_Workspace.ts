// ======================================================
// 📱 정호개발 - 모바일 워크스페이스 (메인 엔트리)
// 작성자: 여태검
// 설명: 로그인 인증 + 세션만료 + 대시보드/출고/입고/점검 초기화 + 서버상태 모니터링
// ======================================================

import { initMobile_DashBoard } from "./Mobile_DashBoard";
import { initMobile_Lift_OutBound } from "./Mobile_Lift_OutBound";
import { initMobile_Lift_InBound } from "./Mobile_Lift_InBound";
import { initMobile_Lift_Check } from "./Mobile_Lift_Check";
import { Mobile_Loading } from "./mobileUtils/Mobile_Loading";

// ======================================================
// 🌐 API BASE 설정
// ======================================================
const isLocal =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1" ||
  location.hostname.includes("app.github.dev");

const API_BASE = isLocal
  ? "http://127.0.0.1:5050"
  : "https://port-0-innomax-mghorm7bef413a34.sel3.cloudtype.app";

console.log("📱 [Mobile_Workspace] 초기화 시작");

// ======================================================
// 👤 로그인 인증 및 세션 관리
// ======================================================
function initAuthAndUserInfo() {
  const userData = localStorage.getItem("user");

  if (!userData) {
    alert("세션 만료 또는 비정상 접근입니다.");
    window.location.href = "index.html"; // ✅ 로그인 페이지로 이동
    return false;
  }

  const user = JSON.parse(userData);
  const userName = document.getElementById("userName");
  const userRole = document.getElementById("userRole");

  if (userName) userName.textContent = user.name;
  if (userRole) userRole.textContent = "정호개발 관리자";

  // ✅ 세션 만료 검사 (30분)
  const loginTime = user.loginTime;
  const now = Date.now();
  if (now - loginTime > 1000 * 60 * 30) {
    alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
    localStorage.clear();
    window.location.href = "index.html";
    return false;
  }

  // ✅ 로그아웃 버튼 이벤트
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      const ok = confirm("정말 로그아웃 하시겠습니까?");
      if (!ok) return;

      localStorage.clear();
      try {
        await fetch(`${API_BASE}/api/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {
        /* 무시 */
      }
      window.location.href = "index.html";
    });
  }

  // ✅ 뒤로가기 방지
  history.pushState(null, "", location.href);
  window.onpopstate = function () {
    history.go(1);
  };

  return true;
}

// ======================================================
// 📱 메인 초기화
// ======================================================
export async function initMobile_Workspace() {
  try {
    Mobile_Loading.show("로딩 중...");

    // ✅ 로그인/세션 검증
    const ok = initAuthAndUserInfo();
    if (!ok) return;

    // ✅ 각 탭 초기화
    console.log("🧭 [Mobile_Workspace] 모듈 초기화 시작");
    initMobile_DashBoard(API_BASE);
    initMobile_Lift_OutBound(API_BASE);
    initMobile_Lift_InBound(API_BASE);
    initMobile_Lift_Check(API_BASE);
    console.log("✅ [Mobile_Workspace] 모든 모듈 초기화 완료");

    // ✅ 서버 상태 모니터링 시작
    startServerConnectionCheck();
  } catch (err) {
    console.error("❌ [Mobile_Workspace] 초기화 오류:", err);
    alert("모바일 워크스페이스 초기화 중 오류가 발생했습니다.");
  } finally {
    Mobile_Loading.hide();
  }
}

// ======================================================
// 📦 DOM 로드 후 자동 실행
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  initMobile_Workspace();
});

// ======================================================
// 🌐 서버 연결 상태 체크 (Footer 표시)
// ======================================================
async function checkServerStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return true;
  } catch {
    return false;
  }
}

function updateFooterStatus(connected: boolean) {
  const el = document.getElementById("serverStatus");
  if (!el) return;

  if (connected) {
    el.textContent = "서버 연결됨";
    el.classList.remove("before:text-red-500", "text-gray-400");
    el.classList.add("before:text-green-400", "text-green-300");
  } else {
    el.textContent = "서버 연결 끊김";
    el.classList.remove("before:text-green-400", "text-green-300");
    el.classList.add("before:text-red-500", "text-gray-400");
  }
}

/**
 * 5초 간격으로 서버 연결 상태를 점검하고 footer에 표시
 */
function startServerConnectionCheck() {
  checkServerStatus().then(updateFooterStatus);
  setInterval(async () => {
    const ok = await checkServerStatus();
    updateFooterStatus(ok);
  }, 5000);
}
