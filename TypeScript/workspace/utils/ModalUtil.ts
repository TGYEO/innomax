// TypeScript/utils/ModalUtil.ts
export type ModalKind = "info" | "success" | "error" | "increase" | "decrease" | "warning";

export const ModalUtil = {
  // ⬇️ ModalUtil.ts 맨 아래에 메서드 하나 추가 (show/confirm 아래에)
  /**
   * 숫자 입력 모달 (확인/취소)
   * - 사용 예: const n = await ModalUtil.promptNumber({ title:"추가", message:"변경 수량을 입력하세요." });
   * - 취소 시 null 반환
   */
  async promptNumber({
    title = "입력",
    message = "값을 입력하세요.",
    defaultValue = 1,
    min = 1,
    max,
    type = "info",
    placeholder = "수량"
  }: {
    title?: string;
    message?: string;
    defaultValue?: number;
    min?: number;
    max?: number;
    type?: ModalKind;
    placeholder?: string;
  }): Promise<number | null> {
    const el = this.ensureElement();
    const titleEl = el.querySelector("#modalTitle") as HTMLElement;
    const msgEl = el.querySelector("#modalMessage") as HTMLElement;
    const okBtn = el.querySelector("#modalCloseBtn") as HTMLButtonElement;
    const cancelBtn = el.querySelector("#modalCancelBtn") as HTMLButtonElement;

    this.setStyleByType(type);

    titleEl.textContent = title;

    // 입력박스 포함해서 메시지 구성
    msgEl.innerHTML = `
      <div class="space-y-3">
        <div class="text-sm text-gray-600">${message}</div>
        <input id="modalPromptInput" type="number"
               class="w-full border rounded-lg px-3 py-2 text-center"
               value="${defaultValue}"
               ${min !== undefined ? `min="${min}"` : ""}
               ${max !== undefined ? `max="${max}"` : ""}
               placeholder="${placeholder}" />
      </div>
    `;

    cancelBtn.classList.remove("hidden");
    okBtn.textContent = "확인";
    cancelBtn.textContent = "취소";
    el.classList.remove("hidden");

    const input = () => (el.querySelector("#modalPromptInput") as HTMLInputElement);

    return await new Promise<number | null>((resolve) => {
      const onOk = () => {
        const v = Number((input().value || "").trim());
        if (!Number.isFinite(v) || (min !== undefined && v < min) || (max !== undefined && v > max)) {
          // 간단한 피드백
          input().classList.add("ring-2", "ring-rose-500");
          setTimeout(() => input().classList.remove("ring-2", "ring-rose-500"), 600);
          input().focus();
          return;
        }
        cleanup();
        this.hide();
        resolve(v);
      };
      const onCancel = () => {
        cleanup();
        this.hide();
        resolve(null);
      };
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") onCancel();
        if (ev.key === "Enter") onOk();
      };

      const cleanup = () => {
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        window.removeEventListener("keydown", onKey);
      };

      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      window.addEventListener("keydown", onKey);

      // 자동 포커스
      setTimeout(() => input()?.focus(), 50);
    });
  },

  el: null as HTMLDivElement | null,

  ensureElement() {
    if (this.el) return this.el;

    const div = document.createElement("div");
    div.id = "globalModalPopup";
    div.className =
      "hidden fixed inset-0 z-[9999] flex items-center justify-center bg-black/50";

    // 기본 구조: 아이콘, 큰 타이틀, 메시지, 버튼들
    div.innerHTML = `
      <div id="modalBox" class="bg-white rounded-2xl shadow-2xl w-[380px] p-6 text-center transition-all">
        <div id="modalIcon" class="text-6xl mb-4 select-none">ℹ️</div>
        <h2 id="modalTitle" class="text-2xl font-extrabold mb-3 text-gray-900 tracking-tight">알림</h2>
        <p id="modalMessage" class="text-sm text-gray-600 mb-6 leading-6"></p>
        <div id="modalBtns" class="flex items-center justify-center gap-2">
          <button id="modalCancelBtn"
            class="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">취소</button>
          <button id="modalCloseBtn"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">확인</button>
        </div>
      </div>
    `;

    document.body.appendChild(div);
    this.el = div;

    return div;
  },

  // 내부 공통 스타일링
  setStyleByType(type: ModalKind) {
    const el = this.ensureElement();
    const iconEl = el.querySelector("#modalIcon") as HTMLElement;
    const titleEl = el.querySelector("#modalTitle") as HTMLElement;

    // 기본값
    let icon = "ℹ️";
    let iconClass = "text-6xl text-blue-500 mb-4";
    let titleClass = "text-2xl font-extrabold mb-3 text-gray-900 tracking-tight";

    switch (type) {
      case "success":
        icon = "✅";
        iconClass = "text-6xl text-green-500 mb-4";
        break;
      case "error":
        icon = "❌";
        iconClass = "text-6xl text-red-500 mb-4";
        break;
      case "warning":
        icon = "⚠️";
        iconClass = "text-6xl text-yellow-500 mb-4";
        break;
      case "increase":
        icon = "➕";
        iconClass = "text-6xl text-emerald-600 mb-4";
        titleClass = "text-3xl font-black mb-3 text-emerald-700 tracking-tight";
        break;
      case "decrease":
        icon = "➖";
        iconClass = "text-6xl text-rose-600 mb-4";
        titleClass = "text-3xl font-black mb-3 text-rose-700 tracking-tight";
        break;
      default:
        break;
    }

    iconEl.textContent = icon;
    iconEl.className = iconClass;
    titleEl.className = titleClass;
  },

  /**
   * (단순) 알림 모달
   * @param message 본문 메시지
   * @param title 제목
   * @param type "info" | "success" | "error" | "increase" | "decrease" | "warning"
   */
  show(message: string, title = "알림", type: ModalKind = "info") {
    const el = this.ensureElement();
    const titleEl = el.querySelector("#modalTitle") as HTMLElement;
    const msgEl = el.querySelector("#modalMessage") as HTMLElement;
    const okBtn = el.querySelector("#modalCloseBtn") as HTMLButtonElement;
    const cancelBtn = el.querySelector("#modalCancelBtn") as HTMLButtonElement;
    const btnWrap = el.querySelector("#modalBtns") as HTMLDivElement;

    this.setStyleByType(type);

    titleEl.textContent = title;
    msgEl.textContent = message;

    // 단순 알림 → 취소 버튼 숨김, 확인만
    cancelBtn.classList.add("hidden");
    okBtn.textContent = "닫기";
    el.classList.remove("hidden");

    const close = () => {
      this.hide();
      okBtn.removeEventListener("click", close);
    };
    okBtn.addEventListener("click", close);
  },

  /**
   * 확인/취소 모달 (Promise 반환)
   * - "추가" / "감소" 등의 굵은 타이틀을 크게 표시 가능
   */
  confirm({
    title = "확인",
    message = "",
    confirmText = "확인",
    cancelText = "취소",
    type = "warning",
  }: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: ModalKind;
  }): Promise<boolean> {
    const el = this.ensureElement();
    const titleEl = el.querySelector("#modalTitle") as HTMLElement;
    const msgEl = el.querySelector("#modalMessage") as HTMLElement;
    const okBtn = el.querySelector("#modalCloseBtn") as HTMLButtonElement;
    const cancelBtn = el.querySelector("#modalCancelBtn") as HTMLButtonElement;

    this.setStyleByType(type);

    titleEl.textContent = title; // ← "추가" 또는 "감소" 크게 표시
    msgEl.textContent = message;

    cancelBtn.textContent = cancelText;
    okBtn.textContent = confirmText;

    cancelBtn.classList.remove("hidden");
    el.classList.remove("hidden");

    return new Promise<boolean>((resolve) => {
      const onOk = () => {
        cleanup();
        this.hide();
        resolve(true);
      };
      const onCancel = () => {
        cleanup();
        this.hide();
        resolve(false);
      };
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") onCancel();
        if (ev.key === "Enter") onOk();
      };

      const cleanup = () => {
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        window.removeEventListener("keydown", onKey);
      };

      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      window.addEventListener("keydown", onKey);
    });
  },

  hide() {
    const el = this.ensureElement();
    el.classList.add("hidden");
  },
};
