// =====================================================================
// 📧 정호개발 - 리프트 확인(모바일) - 메일 + 서명 TypeScript 버전
// =====================================================================

import { Mobile_ModalUtil } from "./mobileUtils/Mobile_ModalUtil";

interface SendMailResponse {
  success: boolean;
  message?: string;
  error?: string;
  detail?: string;
}

export function initMobile_Lift_Check(API_BASE: string) {
  const section = document.getElementById("lift-check") as HTMLElement | null;
  if (!section) {
    console.warn("⚠️ [Mobile_Lift_Check] #lift-check 섹션을 찾지 못함");
    return;
  }

  // 입력 요소들
  const selectTo = section.querySelector("#testMailAddress") as HTMLSelectElement | null;
  const textarea = section.querySelector("#testMailText") as HTMLTextAreaElement | null;
  const btnSend = section.querySelector("#btnSendTestMail") as HTMLButtonElement | null;

  // 사인 요소들
  const canvas = section.querySelector("#signaturePad")! as HTMLCanvasElement;
  const btnClear = section.querySelector("#btnClearSignature") as HTMLButtonElement | null;
  const btnSaveSignature = section.querySelector("#btnSaveSignature") as HTMLButtonElement | null;

  if (!selectTo || !textarea || !btnSend || !canvas || !btnClear || !btnSaveSignature) {
    console.warn("⚠️ 필요한 UI 요소를 찾을 수 없음");
    return;
  }

  // === Signature Pad ===
  const ctx = canvas.getContext("2d")!;

  // 초기 사이즈 설정 (1회만)
  function initCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  initCanvasSize();

  let drawing = false;

  function getPos(e: MouseEvent | TouchEvent) {
    const rect = canvas.getBoundingClientRect();

    if (e instanceof TouchEvent) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function startDraw(e: MouseEvent | TouchEvent) {
    drawing = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: MouseEvent | TouchEvent) {
    if (!drawing) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function endDraw() {
    drawing = false;
    ctx.closePath();
  }

  // 마우스
  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("mouseleave", endDraw);

  // 터치 (스크롤 방지)
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDraw(e);
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    draw(e);
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    endDraw();
  }, { passive: false });

  // 지우기
  btnClear.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });


  // ======================================================
  // 📧 메일 전송
  // ======================================================
  btnSend.addEventListener("click", async () => {
    const to = selectTo.value;
    const text = textarea.value.trim();
    const signatureBase64 = canvas.toDataURL("image/png");

    if (!text) {
      await Mobile_ModalUtil.alert({
        title: "입력 오류",
        message: "메일 내용을 입력하세요.",
      });
      return;
    }

    // 로딩 표시
    btnSend.disabled = true;
    const beforeText = btnSend.textContent;
    btnSend.textContent = "전송 중...";

    try {
      const res = await fetch(`${API_BASE}/api/send-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject: "정호개발 리프트 점검 결과",
          text,
          signatureBase64, // ← 사인 이미지도 같이 보냄
        }),
      });

      const result: SendMailResponse = await res.json();

      if (res.ok && result.success) {
        await Mobile_ModalUtil.alert({
          title: "전송 완료",
          message: `메일이 성공적으로 전송되었습니다.\n받는 사람: ${to}`,
        });

        textarea.value = "";
      } else {
        await Mobile_ModalUtil.alert({
          title: "전송 실패",
          message: result.error || result.detail || "메일 전송 중 오류 발생",
        });
      }
    } catch (err: any) {
      console.error("❌ [메일 오류]:", err);
      await Mobile_ModalUtil.alert({
        title: "네트워크 오류",
        message: err?.message ?? "알 수 없는 오류",
      });
    } finally {
      btnSend.disabled = false;
      btnSend.textContent = beforeText ?? "메일보내기";
    }
  });

  // ✅ 드롭다운 선택 시, 아래에 "누가 언제 점검했는지" 문구 표시
  function initLiftChecklistEvents(section: HTMLElement) {
    // 로그인한 사람 이름 가져오기 (원하시는 방식으로 바꿔 쓰시면 됩니다)
    const inspectorName =
      (window as any).currentUserName ||
      (document.getElementById("liftInspectorName") as HTMLInputElement | null)?.value ||
      "점검자";

    const selects = section.querySelectorAll<HTMLSelectElement>(".lift-check-result");

    selects.forEach((sel) => {
      sel.addEventListener("change", () => {
        const tr = sel.closest("tr");
        if (!tr) return;

        const itemId = tr.getAttribute("data-item-id");
        if (!itemId) return;

        const confirmRow = section.querySelector<HTMLTableRowElement>(
          `tr[data-confirm-row-for="${itemId}"]`
        );
        if (!confirmRow) return;

        const cell = confirmRow.querySelector("td");
        if (!cell) return;

        const value = sel.value;

        // 선택 해제되면 문구 숨김
        if (!value) {
          cell.textContent = "";
          confirmRow.classList.add("hidden");
          return;
        }

        const now = new Date();
        const yyyy = now.getFullYear();
        const MM = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");

        cell.textContent =
          `${inspectorName} 님이 ${yyyy}년 ${MM}월 ${dd}일 ` +
          `${hh}시 ${mm}분에 "${value}"로 점검하였습니다.`;

        confirmRow.classList.remove("hidden");
      });
    });
  }

  initLiftChecklistEvents(section);
  console.log("📧 [Mobile_Lift_Check] TypeScript 초기화 완료");
}
