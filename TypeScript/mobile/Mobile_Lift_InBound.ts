import { Html5Qrcode } from "html5-qrcode";

// ======================================================
// 📦 정호개발 - 리프트 입고 (모바일)
// ======================================================

export function initMobile_Lift_InBound(API_BASE: string) {
  const section_inbound = document.getElementById("mobile_inbound_lift_in");
  if (!section_inbound) return;

  const btnScan_inbound = document.getElementById("mobile_inbound_btnScanLiftQR") as HTMLButtonElement;
  const btnReset_inbound = document.getElementById("mobile_inbound_btnReset") as HTMLButtonElement;
  const btnComplete_inbound = document.getElementById("mobile_inbound_btnComplete") as HTMLButtonElement;
  const selectLocation_inbound = document.getElementById("mobile_inbound_selectLocation") as HTMLSelectElement;
  const qrReaderDiv_inbound = document.getElementById("mobile_inbound_qrReader") as HTMLElement;
  const listContainer_inbound = document.getElementById("mobile_inbound_liftList") as HTMLElement;

  let scannedLiftList_inbound: any[] = [];
  let html5QrCode_inbound: Html5Qrcode | null = null;

  console.log("📦 [Mobile_Lift_InBound] 초기화 완료");

  // ✅ 리프트 조회 (code + optional serial_no)
  async function fetchLift_inbound(code: string, serial_no?: string) {
    const query_inbound = serial_no
      ? `?code=${encodeURIComponent(code)}&serial_no=${encodeURIComponent(serial_no)}`
      : `?code=${encodeURIComponent(code)}`;
    const res_inbound = await fetch(`${API_BASE}/api/parts/qr${query_inbound}`);
    if (!res_inbound.ok) throw new Error("리프트 조회 실패");
    return res_inbound.json();
  }

  // ======================================================
  // 🎥 스캐너 UI 시작
  // ======================================================
  btnScan_inbound.addEventListener("click", async () => {
    qrReaderDiv_inbound.classList.remove("hidden");
    qrReaderDiv_inbound.innerHTML = `<div id="qr-reader-inbound" class="w-full h-64"></div>`;

    html5QrCode_inbound = new Html5Qrcode("qr-reader-inbound");

    html5QrCode_inbound.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText_inbound) => {
        console.log("✅ [입고] QR 인식됨:", decodedText_inbound);
        await html5QrCode_inbound?.stop();
        await new Promise((r) => setTimeout(r, 100));
        qrReaderDiv_inbound.classList.add("hidden");

        try {
          let code_inbound = "";
          let serial_no_inbound = "";

          // ✅ QR 파싱
          if (decodedText_inbound.startsWith("{")) {
            const obj_inbound = JSON.parse(decodedText_inbound);
            code_inbound = obj_inbound.code;
            serial_no_inbound = obj_inbound.serial || obj_inbound.serial_no || "";
          } else {
            [code_inbound, serial_no_inbound] = decodedText_inbound.split("|");
          }

          if (!code_inbound) throw new Error("QR 코드에 code 정보가 없습니다.");

          // ✅ 리프트 정보 조회
          const liftData_inbound = await fetchLift_inbound(code_inbound, serial_no_inbound);

          // ✅ 사용중 여부 확인
          const inUseRes_inbound = await fetch(`${API_BASE}/api/projects/in-use-mobile/${code_inbound}`);
          console.log("📡 [입고] in-use-mobile 요청 URL:", `${API_BASE}/api/projects/in-use-mobile/${code_inbound}`);
          console.log("📡 [입고] HTTP 상태코드:", inUseRes_inbound.status);

          const text_inbound = await inUseRes_inbound.text();
          console.log("📥 [입고] 응답 원본(raw text):", text_inbound);

          let inUseData_inbound: any = {};
          try {
            inUseData_inbound = JSON.parse(text_inbound);
            console.log("✅ [입고] 응답 JSON 파싱 성공:", inUseData_inbound);
          } catch (err) {
            console.error("❌ [입고] JSON 파싱 실패:", err);
          }

          if (!inUseData_inbound || Object.keys(inUseData_inbound).length === 0) {
            console.warn("⚠️ [입고] 응답이 비어 있음");
          } else {
            // ✅ S.ALIM 정보 추출
            // ✅ S.ALIM 정보 추출 이후, 입고 상태 확인 추가
            try {
              const parentKey_inbound = inUseData_inbound.parent;
              const dongho_inbound = inUseData_inbound.dongho_data;

              if (dongho_inbound && parentKey_inbound) {
                const inboundKey_inbound = `${parentKey_inbound}_inbound_time`;
                const salimInboundKey_inbound = `${parentKey_inbound}_S.ALIM_inbound_time`;

                const inboundTime = dongho_inbound[inboundKey_inbound];
                const salimInboundTime = dongho_inbound[salimInboundKey_inbound];

                // ✅ 이미 리프트가 입고된 상태인지 검사
                if (inboundTime && inboundTime.trim() !== "") {
                  await mobileConfirm_inbound(`⚠️ 해당 리프트는 이미 입고 처리된 상태입니다.\n(입고일시: ${inboundTime})`);
                  return;
                }

                // ✅ S.ALIM 이 이미 입고된 경우도 검사
                if (salimInboundTime && salimInboundTime.trim() !== "") {
                  await mobileConfirm_inbound(`⚠️ 연결된 S.ALIM 또한 이미 입고 처리된 상태입니다.\n(입고일시: ${salimInboundTime})`);
                  return;
                }

                // ✅ S.ALIM 정보 파싱
                const salimCodeKey_inbound = `${parentKey_inbound}_S.ALIM_code`;
                const salimNameKey_inbound = `${parentKey_inbound}_S.ALIM_name`;
                const salimSerialKey_inbound = `${parentKey_inbound}_S.ALIM_serial_no`;
                const salimOutTimeKey_inbound = `${parentKey_inbound}_S.ALIM_outbound_time`;

                if (dongho_inbound[salimCodeKey_inbound] || dongho_inbound[salimNameKey_inbound]) {
                  inUseData_inbound.salim_info = {
                    code: dongho_inbound[salimCodeKey_inbound] || "-",
                    name: dongho_inbound[salimNameKey_inbound] || "-",
                    serial_no: dongho_inbound[salimSerialKey_inbound] || "-",
                    outbound_time: dongho_inbound[salimOutTimeKey_inbound] || "-",
                  };
                }
              }
            } catch (err) {
              console.error("❌ [입고] S.ALIM 파싱 실패:", err);
            }

          }

          if (!inUseData_inbound.in_use) {
            await mobileConfirm_inbound("⚠️ 해당 리프트는 현재 어떤 프로젝트에도 등록되어 있지 않습니다.\n\n입고할 수 없습니다.");
            return;
          }

          const liftObj_inbound = {
            ...liftData_inbound,
            in_use: inUseData_inbound.in_use || false,
            project_name: inUseData_inbound.project_name || null,
            dongho_name: inUseData_inbound.dongho_name || null,
            parent: inUseData_inbound.parent || null,
            salim_info: inUseData_inbound.salim_info || null,
          };

          scannedLiftList_inbound.push(liftObj_inbound);
          renderLiftList_inbound();

          if (selectLocation_inbound.value) btnComplete_inbound.disabled = false;
        } catch (err: any) {
          console.error("❌ [입고] QR 인식 처리 실패:", err);
          await mobileConfirm_inbound(err.message || "QR 인식 처리 실패");
        }
      },
      (errorMessage_inbound) => {
        console.log("⏳ QR 스캔 중...", errorMessage_inbound);
      }
    );
  });

  // ======================================================
  // ♻️ 초기화
  // ======================================================
  btnReset_inbound.addEventListener("click", async () => {
    scannedLiftList_inbound = [];
    listContainer_inbound.innerHTML = `
      <div class="text-gray-400 text-sm text-center py-6 border rounded-lg bg-gray-50">
        스캔된 리프트가 없습니다.
      </div>`;
    selectLocation_inbound.value = "";
    qrReaderDiv_inbound.classList.add("hidden");
    if (html5QrCode_inbound) try { await html5QrCode_inbound.stop(); } catch { }
    console.log("🧹 [입고] 초기화 완료");
  });

  // ======================================================
  // 📦 입고 완료 처리
  // ======================================================
  btnComplete_inbound.addEventListener("click", async () => {
    if (scannedLiftList_inbound.length === 0) {
      alert("먼저 리프트를 스캔하세요.");
      return;
    }
    if (!selectLocation_inbound.value) {
      alert("입고할 위치를 선택하세요.");
      return;
    }

    const confirmResult_inbound = await mobileConfirm_inbound(
      `선택한 리프트를 [${selectLocation_inbound.value}]에 입고하시겠습니까?`
    );
    if (!confirmResult_inbound) return;

    try {
      const res_inbound = await fetch(`${API_BASE}/api/projects/inbound`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lifts: scannedLiftList_inbound,
          location: selectLocation_inbound.value,
        }),
      });

      const result_inbound = await res_inbound.json();

      if (result_inbound.success) {
        await mobileConfirm_inbound("✅ 입고가 완료되었습니다.");
        btnReset_inbound.click();
      } else {
        await mobileConfirm_inbound(result_inbound.message || "❌ 입고 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      await mobileConfirm_inbound("서버 오류가 발생했습니다.");
    }
  });


  // ======================================================
  // 🪧 리프트 카드 렌더링
  // ======================================================
  function renderLiftList_inbound() {
    const container_inbound = document.getElementById("mobile_inbound_liftList") as HTMLElement;
    container_inbound.innerHTML = "";

    if (scannedLiftList_inbound.length === 0) {
      container_inbound.innerHTML = `
      <div class="text-gray-400 text-sm text-center py-6 border rounded-lg bg-gray-50">
        스캔된 리프트가 없습니다.
      </div>`;
      return;
    }

    scannedLiftList_inbound.forEach((lift_inbound, idx_inbound) => {
      const card_inbound = document.createElement("div");
      card_inbound.className = "border rounded-lg bg-white shadow p-4 space-y-1";

      const hasSalim_inbound = !!lift_inbound.salim_info;
      const salimHTML_inbound = hasSalim_inbound
        ? `
        <div class="text-sm text-gray-600"><b>S.ALIM 코드:</b> ${lift_inbound.salim_info.code}</div>
        <div class="text-sm text-gray-600"><b>S.ALIM 이름:</b> ${lift_inbound.salim_info.name}</div>`
        : `
        <div class="text-sm text-gray-600 flex items-center gap-2">
          <b>S.ALIM:</b>
          <span class="text-gray-400 italic">미연결</span>
        </div>`;

      const statusText_inbound = lift_inbound.in_use
        ? `<span class="text-red-500 font-semibold">사용중</span>`
        : `<span class="text-emerald-600 font-semibold">대기중</span>`;

      const projectHTML_inbound = lift_inbound.project_name
        ? `
        <div class="text-sm text-gray-600"><b>프로젝트명:</b> ${lift_inbound.project_name}</div>
        <div class="text-sm text-gray-600"><b>동/호기:</b> ${lift_inbound.dongho_name || "-"}</div>
        <div class="text-sm text-gray-600"><b>구분:</b> ${lift_inbound.parent || "-"}</div>`
        : `<div class="text-sm text-gray-400 italic">프로젝트 정보 없음</div>`;

      card_inbound.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="font-bold text-gray-800">${lift_inbound.name || "이름없음"}</span>
        <span class="text-sm text-gray-400">#${idx_inbound + 1}</span>
      </div>

      <div class="text-sm text-gray-600"><b>코드:</b> ${lift_inbound.code}</div>
      <div class="text-sm text-gray-600"><b>시리얼:</b> ${lift_inbound.serial_no || "-"}</div>
      <div class="text-sm text-gray-600"><b>적재하중:</b> ${lift_inbound.spec_load || "-"}</div>
      <div class="text-sm text-gray-600"><b>TYPE:</b> ${lift_inbound.spec_type || "-"}</div>
      <div class="text-sm text-gray-600"><b>속도:</b> ${lift_inbound.spec_speed || "-"}</div>
      <div class="text-sm text-gray-600"><b>CAGE 규격:</b> ${lift_inbound.spec_cage_size || "-"}</div>

      ${projectHTML_inbound}
      ${salimHTML_inbound}
      <div class="text-sm text-gray-600"><b>상태:</b> ${statusText_inbound}</div>
      `;

      container_inbound.appendChild(card_inbound);
    });
  }

  // ======================================================
  // ✅ 모바일 확인 팝업 (공통)
  // ======================================================
  function mobileConfirm_inbound(message_inbound: string): Promise<boolean> {
    return new Promise((resolve_inbound) => {
      const overlay_inbound = document.getElementById("mobile_confirm_modal_inbound")!;
      const panel_inbound = document.getElementById("mobile_confirm_panel_inbound")!;
      const msg_inbound = document.getElementById("mobile_confirm_message_inbound")!;
      const okBtn_inbound = document.getElementById("mobile_confirm_ok_inbound")!;
      const cancelBtn_inbound = document.getElementById("mobile_confirm_cancel_inbound")!;

      msg_inbound.textContent = message_inbound;

      overlay_inbound.classList.remove("hidden");
      requestAnimationFrame(() => {
        overlay_inbound.classList.remove("opacity-0");
        panel_inbound.classList.remove("opacity-0", "scale-95");
      });

      const cleanup_inbound = () => {
        overlay_inbound.classList.add("opacity-0");
        panel_inbound.classList.add("opacity-0", "scale-95");
        setTimeout(() => overlay_inbound.classList.add("hidden"), 200);

        okBtn_inbound.removeEventListener("click", onOk_inbound);
        cancelBtn_inbound.removeEventListener("click", onCancel_inbound);
        overlay_inbound.removeEventListener("click", onBackdrop_inbound);
        panel_inbound.removeEventListener("click", stop_inbound);
      };

      const onOk_inbound = () => {
        cleanup_inbound();
        resolve_inbound(true);
      };

      const onCancel_inbound = () => {
        cleanup_inbound();
        resolve_inbound(false);
      };

      const onBackdrop_inbound = (e: Event) => {
        if (e.target === overlay_inbound) onCancel_inbound();
      };

      const stop_inbound = (e: Event) => e.stopPropagation();

      okBtn_inbound.addEventListener("click", onOk_inbound);
      cancelBtn_inbound.addEventListener("click", onCancel_inbound);
      overlay_inbound.addEventListener("click", onBackdrop_inbound);
      panel_inbound.addEventListener("click", stop_inbound);
    });
  }

}
