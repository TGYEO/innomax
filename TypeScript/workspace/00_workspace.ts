// TypeScript/workspace/workspace.ts
import { initUserRegisterPanel } from "./03_user-register";
import { initView } from "./02_view";
import { initDashboardPanel } from "./01_dashboard";
import { LoadingUtil } from "./utils/loading";
import { initOrderRegisterPanel } from "./04_order-register";
import { initWorkAssignPanel } from "./06_work-assign";
import { initWorkProgressPanel } from "./07_work-progress";
import { initProgressPanel } from "./05_progress-panel";
import { setMaxIdleHTTPParsers } from "http";

import { ModalUtil } from "./utils/ModalUtil";

// ==============================================================
// 🔵 API 기본주소
// ==============================================================
const dummy = "1";
const API_BASE =
  location.hostname === "tgyeo.github.io"
    ? "https://port-0-innomax-mghorm7bef413a34.sel3.cloudtype.app"
    : "http://127.0.0.1:5050";

function initLocalTabNavigation() {
  const navButtons = document.querySelectorAll<HTMLButtonElement>(".nav-btn");
  const panels = document.querySelectorAll<HTMLElement>('[id^="panel-"]');
  const titleEl = document.getElementById("wsTitle") as HTMLHeadingElement | null;

  function showPanel(id: string) {
    // 1) 모든 패널 숨기기
    panels.forEach((p) => p.classList.add("hidden"));

    // 2) 해당 패널 표시
    const target = document.getElementById(id);
    if (target) target.classList.remove("hidden");

    // 3) 버튼 스타일 적용
    navButtons.forEach((btn) => {
      const active = btn.dataset.panel === id;
      btn.classList.toggle("bg-[#7ce92f]", active);
      btn.classList.toggle("text-[#000000]", active);
      btn.classList.toggle("font-bold", active);
    });

    // 4) 제목 변경
    const curBtn = document.querySelector<HTMLButtonElement>(
      `.nav-btn[data-panel="${id}"]`
    );
    if (curBtn && titleEl) {
      titleEl.textContent = curBtn.textContent?.trim() ?? "";
    }
  }

  // 초기 Dashboard
  showPanel("panel-dashboard");

  return showPanel;
}

// ==============================================================
// 🔵 메인 초기화
// ==============================================================
document.addEventListener("DOMContentLoaded", async () => {
  console.debug("[INIT] DOMContentLoaded 시작");

  // nav-btn 전환 로직 활성화
  const showPanel = initLocalTabNavigation();

  // 공통 View 초기화
  await initView(API_BASE);

  const sidebarButtons = document.querySelectorAll<HTMLButtonElement>("#sidebar [data-panel]");
  const userName = document.getElementById("userName");

  sidebarButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.panel;
      if (!id) return;

      // ----------------------------------------------
      // 🔐 1) 권한 체크 
      // ----------------------------------------------
      //최상단 사용자 관리탭
      if (id.includes("사용자-관리")) {
        const allowed = ["장혜용", "여태검"];
        const current = (userName?.textContent ?? "").trim();
        if (!allowed.includes(current)) {
          const ok = await ModalUtil.show({
            type: "alert",
            title: "접근 권한",
            message: "접근 권한이 없습니다.",
            showOk: true,
            showCancel: false
          });
          if (ok) {
            return; // ❗ showPanel 실행 전 return → 패널이 안 보임
          } else {
            return; // ❗ showPanel 실행 전 return → 패널이 안 보임
          }
        }
      }

      if (id.includes("수주건등록")) {
        try {
          const url = `${API_BASE}/api/users`;
          const res = await fetch(url);

          if (!res.ok) {
            console.error("❌ 사용자 목록 불러오기 실패");
            return;
          }

          const userList = await res.json();  // 배열 전체를 받아온다고 가정
          console.log("📌 사용자 전체 목록:", userList);

          const allowed: string[] = [];

          for (const user of userList) {
            try {
              // permissions 필드는 문자열 → JSON 파싱
              const perms = JSON.parse(user.permissions);

              // 수주건등록 권한 체크
              if (perms.order_register === "ReadWrite") {
                allowed.push(user.Name);  // 또는 user.ID
              }
            } catch (err) {
              console.error("❌ permission 파싱 실패:", user.permissions, err);
            }
          }

          console.log("✅ 수주건 등록 권한자 목록:", allowed);

          // 여기서 allowed 배열을 실제 권한 체크에 사용
          const currentUser = (userName?.textContent ?? "").trim();
          if (!allowed.includes(currentUser)) {
            const ok = await ModalUtil.show({
              type: "alert",
              title: "접근 권한",
              message: "접근 권한이 없습니다.",
              showOk: true,
              showCancel: false
            });
            if (ok) {
              return; // ❗ showPanel 실행 전 return → 패널이 안 보임
            } else {
              return; // ❗ showPanel 실행 전 return → 패널이 안 보임
            }
          }

        } catch (err) {
          console.error("❌ 사용자 권한 로딩 오류:", err);
        }
      }





      // ----------------------------------------------
      // 🔵 2) 패널 전환(showPanel) 실행
      //     → 패널이 시각적으로 보이는 단계
      // ----------------------------------------------
      showPanel(id);

      // ----------------------------------------------
      // ⏳ 3) 패널 초기화
      // ----------------------------------------------
      LoadingUtil.show();
      try {
        await new Promise((r) => requestAnimationFrame(r));

        if (id.includes("대시보드")) {
          await initDashboardPanel(API_BASE);
        } 
        
        else if (id.includes("사용자-관리")) {
          await initUserRegisterPanel(API_BASE);
        } 

        else if (id.includes("수주건등록")) {
          await initOrderRegisterPanel(API_BASE);
        } 
        
        else if (id.includes("업무할당")) {
          await initWorkAssignPanel(API_BASE);
        } 
        
        else if (id.includes("진행상황보고")) {
          await initWorkProgressPanel(API_BASE);
        } 
        
        else if (id.includes("진행상황-한눈에보기")) {
          await initProgressPanel(API_BASE);
        }
        

        console.debug(`[TAB] ${id} 초기화 완료`);
      } catch (err) {
        console.error(`[TAB ERROR] ${id}:`, err);
        alert(`${id} 초기화 중 오류 발생`);
      } finally {
        LoadingUtil.hide();
      }
    });
  });

  // 초기 Dashboard 데이터 로드
  await initDashboardPanel(API_BASE);

  console.debug("[INIT] workspace 초기화 완료");
});
