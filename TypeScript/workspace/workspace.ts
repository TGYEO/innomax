// TypeScript/workspace/workspace.ts
import { initUserRegisterPanel } from "./user-register";
import { initView } from "./view";
import { initDashboardPanel } from "./dashboard";
import { LoadingUtil } from "./utils/loading";
import { initOrderRegisterPanel } from "./order-register";
import { initWorkAssignPanel } from "./work-assign";
import { initWorkProgressPanel } from "./work-progress";

import { initProgressPanel } from "./progress-panel";



// ✅ API 기본주소
const API_BASE =
  location.hostname === "tgyeo.github.io"
    ? "https://port-0-innomax-mghorm7bef413a34.sel3.cloudtype.app"
    : "http://127.0.0.1:5050";

document.addEventListener("DOMContentLoaded", async () => {
  console.debug("[INIT] DOMContentLoaded 시작");
  await initView(API_BASE);

  const sidebarButtons = document.querySelectorAll<HTMLButtonElement>("#sidebar [data-panel]");
  console.debug(`[INIT] sidebar 버튼 개수: ${sidebarButtons.length}`);
  if (sidebarButtons.length === 0) {
    console.warn("⚠️ 사이드바 버튼이 없습니다. HTML의 data-panel 속성 확인 필요");
    return;
  }

  sidebarButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetPanelId = btn.dataset.panel;
      if (!targetPanelId) return;

      console.debug(`[TAB] 클릭됨 → ${targetPanelId}`);
      document.querySelectorAll("[id^='panel-']").forEach((el) => el.classList.add("hidden"));

      const panel = document.getElementById(targetPanelId);
      if (!panel) {
        console.error(`[TAB] 패널을 찾을 수 없음: #${targetPanelId}`);
        return;
      }
      panel.classList.remove("hidden");

      // ✅ 로딩 표시
      LoadingUtil.show();

      try {
        // ✅ 한 프레임 지연 — DOM 렌더링 완료 보장
        await new Promise((r) => requestAnimationFrame(r));

        //#region ▶ 대시보드
        if (targetPanelId.includes("대시보드")) {
          console.debug("📊 [Dashboard] 탭 선택됨 — 장비 기준 대시보드 초기화");
          await LoadingUtil.wrap(Promise.resolve(initDashboardPanel(API_BASE)));
        }
        //#endregion

        //#region ▶ 사용자 관리
        else if (targetPanelId.includes("사용자-관리")) {
          await LoadingUtil.wrap(Promise.resolve(initUserRegisterPanel(API_BASE)));
        }
        //#endregion

        //#region ▶ 수주건 등록
        else if (targetPanelId.includes("수주건등록")) {
          console.debug("📦 [OrderRegister] 탭 선택됨 — 수주건 등록 패널 초기화");
          await LoadingUtil.wrap(Promise.resolve(initOrderRegisterPanel(API_BASE)));
        }
        //#endregion

        //#region ▶ 업무할당
        else if (targetPanelId.includes("업무할당")) {
          await LoadingUtil.wrap(Promise.resolve(initWorkAssignPanel(API_BASE)));
        }
        //#endregion

        //#region ▶ 진행상황보고
        else if (targetPanelId.includes("진행상황보고")) {
          await LoadingUtil.wrap(Promise.resolve(initWorkProgressPanel(API_BASE)));
        }
        //#endregion

        //#region ▶ 진행상황 한눈에 보기
        else if (targetPanelId.includes("진행상황-한눈에보기")) {
          await LoadingUtil.wrap(Promise.resolve(initProgressPanel(API_BASE)));
        }
        //#endregion



        else {
          console.log("⚙️ 특별한 초기화 함수 없음:", targetPanelId);
        }

        console.debug(`[TAB] ${targetPanelId} 초기화 완료`);
      } catch (err) {
        console.error(`[TAB] ${targetPanelId} 로드 실패:`, err);
        alert(`${targetPanelId} 탭 로드 중 오류 발생`);
      } finally {
        LoadingUtil.hide();
      }
    });
  });

  // ✅ 초기 탭 자동 표시
  const defaultPanel = document.getElementById("panel-dashboard");
  if (defaultPanel) {
    defaultPanel.classList.remove("hidden");
    await initDashboardPanel(API_BASE);
  }

  console.debug("[INIT] workspace 초기화 완료");
});
