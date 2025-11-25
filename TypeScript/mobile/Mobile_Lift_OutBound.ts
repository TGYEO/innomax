// ======================================================
// 🚚 정호개발 - 리프트 출고 (모바일)
// 작성자: 여태검
// 목적: QR 스캔 → 장비조회 → S.ALIM 연결
// ======================================================

import { Html5Qrcode } from "html5-qrcode";

export function initMobile_Lift_OutBound(API_BASE: string) {
  console.log("🚀 [Mobile_Lift_OutBound] 패널 초기화 진입");

  if ((window as any).__MobileLiftOutPanelInitialized) {
    console.log("♻️ 기존 패널 — 이벤트 유지, 데이터 새로고침");
    resetAll();
    return;
  }
  (window as any).__MobileLiftOutPanelInitialized = true;

  let scannedLiftList: any[] = [];
  let html5QrCode: Html5Qrcode | null = null;
  let currentLiftIndex: number | null = null; // 현재 S.ALIM을 연결 중인 리프트 인덱스

  const btnScanLiftQR = document.getElementById("mobile_outbound_btnScanLiftQR") as HTMLButtonElement;
  const btnReset = document.getElementById("mobile_outbound_btnReset") as HTMLButtonElement;
  const qrReaderDiv = document.getElementById("mobile_outbound_qrReader") as HTMLElement;

  //#region 🔸 타입 정의 ---------------------------------------------------------
  type LiftRow = {
    no: number;
    division: string;
    category: string;
    name: string;
    code: string;
    spec_load: string | null;
    spec_type: string | null;
    spec_speed: string | null;
    spec_cage_size: string | null;
    serial_no: string | null;
    manufacture_year: string | null;
    total_quantity: number | null;
    inverter_installed: string | null;
    s_alim_installed: string | null;
    location: string | null; // ✅ 추가됨
  };

  type ProjectLog = {
    project_no: string;
    project_name: string; // 현장명
    client_name: string;  // 건설사
    detail_log: any;
  };


  type RepairLog = {
    repair_no: string;
    repair_name: string;
    site_name: string;
    detail_log: any;
  };

  type InspectionMap = Record<string, string[]>; // lift_code별 점검일자 목록
  //#endregion

  // ✅ 초기화
  function resetAll() {
    scannedLiftList = [];
    renderLiftList();
    qrReaderDiv.classList.add("hidden");
    if (html5QrCode) try { html5QrCode.stop(); } catch { }
    console.log("🧹 초기화 완료");
  }

  // ✅ 리프트 조회
  async function fetchLift(code: string, serial_no?: string) {
    const query = serial_no
      ? `?code=${encodeURIComponent(code)}&serial_no=${encodeURIComponent(serial_no)}`
      : `?code=${encodeURIComponent(code)}`;
    const res = await fetch(`${API_BASE}/api/parts/qr${query}`);
    if (!res.ok) throw new Error("리프트 조회 실패");
    return res.json();
  }

  // ✅ S.ALIM 조회
  async function fetchSalim(code: string) {
    const res = await fetch(`${API_BASE}/api/salim/qr?code=${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error("S.ALIM 조회 실패");
    return res.json();
  }

  // ======================================================
  // 🎨 리프트 카드 렌더링
  // ======================================================
  function renderLiftList() {
    const container = document.getElementById("mobile_outbound_liftList") as HTMLElement;
    container.innerHTML = "";

    if (scannedLiftList.length === 0) {
      container.innerHTML = `
      <div class="text-gray-400 text-sm text-center py-6 border rounded-lg bg-gray-50">
        스캔된 리프트가 없습니다.
      </div>`;
      return;
    }

    scannedLiftList.forEach((lift, idx) => {
      const card = document.createElement("div");
      card.className = "border rounded-lg bg-white shadow p-4 space-y-1";

      // ✅ S.ALIM 정보 존재 여부
      const hasSalim = !!lift.salim_info;

      const salimHTML = hasSalim
        ? `
      <div class="text-sm text-gray-600"><b>S.ALIM 코드:</b> ${lift.salim_info.code}</div>
      <div class="text-sm text-gray-600"><b>S.ALIM 이름:</b> ${lift.salim_info.name}</div>
      <div class="text-sm text-gray-600"><b>S.ALIM 시리얼:</b> ${lift.salim_info.serial_no}</div>
    `
        : `
      <div class="text-sm text-gray-600 flex items-center gap-2">
          <b>S.ALIM:</b> 
          <span class="text-gray-400 italic">미연결</span>
          <div class="flex gap-2">
            <button
              class="text-xs text-indigo-600 border border-indigo-500 rounded px-2 py-[1px] hover:bg-indigo-50"
              data-index="${idx}" data-action="connect-salim-qr">
              QR로 연결하기
            </button>
            <button
              class="text-xs text-green-600 border border-green-500 rounded px-2 py-[1px] hover:bg-green-50"
              data-index="${idx}" data-action="connect-salim-list">
              리스트 불러오기
            </button>
          </div>
        </div>


    `;

      card.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="font-bold text-gray-800">${lift.name || "이름없음"}</span>
        <span class="text-sm text-gray-400">#${idx + 1}</span>
      </div>
      <div class="text-sm text-gray-600"><b>코드:</b> ${lift.code}</div>
      <div class="text-sm text-gray-600"><b>시리얼:</b> ${lift.serial_no || "-"}</div>
      <div class="text-sm text-gray-600"><b>적재하중:</b> ${lift.spec_load || "-"}</div>
      <div class="text-sm text-gray-600"><b>TYPE:</b> ${lift.spec_type || "-"}</div>
      <div class="text-sm text-gray-600"><b>속도:</b> ${lift.spec_speed || "-"}</div>
      <div class="text-sm text-gray-600"><b>CAGE 규격:</b> ${lift.spec_cage_size || "-"}</div>
      ${salimHTML}
      <div class="text-sm text-gray-600"><b>상태:</b> <span class="text-emerald-600">대기</span></div>
    `;

      container.appendChild(card);
    });
  }



  // ✅ QR 스캔 시작 (공용)
  async function startQrScan(mode: "lift" | "salim") {
    // ======================================================
    // 🎯 인터록 (중복 스캔 방지)
    // ======================================================
    if (mode === "lift") {
      if (scannedLiftList.length > 0) {
        await mobileConfirm("⚠️ 이미 리프트가 스캔되어 있습니다.\n\n리프트는 1대만 등록 가능합니다.");
        return;
      }
    }

    if (mode === "salim") {
      if (currentLiftIndex === null) {
        await mobileConfirm("⚠️ 연결할 리프트를 먼저 선택하세요.");
        return;
      }

      const currentLift = scannedLiftList[currentLiftIndex];
      if (currentLift.salim_info) {
        await mobileConfirm("⚠️ 이미 S.ALIM이 연결되어 있습니다.\n\nS.ALIM은 1개만 연결 가능합니다.");
        return;
      }
    }

    // ======================================================
    // 🎥 스캐너 UI 시작
    // ======================================================
    qrReaderDiv.classList.remove("hidden");
    qrReaderDiv.innerHTML = `<div id="qr-reader" class="w-full h-64"></div>`;
    html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        console.log("✅ QR 인식됨:", decodedText);
        await html5QrCode?.stop();
        qrReaderDiv.classList.add("hidden");

        try {
          let code = "";
          let serial_no = "";

          if (decodedText.startsWith("{")) {
            const obj = JSON.parse(decodedText);
            code = obj.code;
            serial_no = obj.serial || obj.serial_no || "";
          } else {
            [code, serial_no] = decodedText.split("|");
          }

          if (!code) throw new Error("QR 코드에 code 정보가 없습니다.");

          // ======================================================
          // 🏗️ 모드별 처리
          // ======================================================
          if (mode === "lift") {
            const part = await fetchLift(code, serial_no);

            // ✅ 사용중 여부 확인
            const inUseRes = await fetch(`${API_BASE}/api/projects/in-use-mobile/${code}`);
            const inUseData = await inUseRes.json();

            if (inUseData.in_use) {
              const msg =
                `⚠️ 이미 사용 중인 리프트입니다.\n\n` +
                `프로젝트명: ${inUseData.project_name}\n` +
                `동/호기: ${inUseData.dongho_name}\n` +
                `(${inUseData.parent})`;
              await mobileConfirm(msg);
              return;
            }

            console.log("🎯 리프트 조회 결과:", part);
            scannedLiftList.push(part);
            renderLiftList();

            // ✅ 프로젝트 선택 버튼 활성화
            const btnSelectProject = document.getElementById("mobile_outbound_btnSelectProject") as HTMLButtonElement;
            if (btnSelectProject) {
              btnSelectProject.disabled = false;
              btnSelectProject.classList.remove("bg-gray-400", "cursor-not-allowed");
              btnSelectProject.classList.add("bg-indigo-500", "hover:bg-indigo-600");
            }
          }

          // ======================================================
          // 🔗 S.ALIM 스캔
          // ======================================================
          else if (mode === "salim") {
            if (currentLiftIndex === null) {
              await mobileConfirm("⚠️ 연결할 리프트가 없습니다.");
              return;
            }

            const salim = await fetchSalim(code);
            console.log("🔗 S.ALIM 조회 결과:", salim);

            // ✅ 사용중 여부 확인
            const inUseRes = await fetch(`${API_BASE}/api/projects/in-use-mobile/${code}`);
            const inUseData = await inUseRes.json();

            if (inUseData.in_use) {
              await mobileConfirm(
                `⚠️ 이미 사용 중인 S.ALIM입니다.\n\n` +
                `프로젝트명: ${inUseData.project_name}\n` +
                `동/호기: ${inUseData.dongho_name}\n` +
                `(${inUseData.parent})`
              );
              currentLiftIndex = null;
              return;
            }

            // ✅ 연결 처리
            scannedLiftList[currentLiftIndex].salim_info = {
              code: salim.code,
              name: salim.name,
              serial_no: salim.serial_no || "-",
            };

            await mobileConfirm(`✅ S.ALIM (${salim.name || salim.code}) 연결 완료`);
            renderLiftList();
            currentLiftIndex = null;
          }

        } catch (err: any) {
          await mobileConfirm(err.message || "QR 인식 처리 실패");
        }
      },
      (errorMessage) => {
        console.log("⏳ QR 스캔 중...", errorMessage);
      }
    );
  }


  // ✅ “S.ALIM 연결” 클릭 이벤트 위임
  document.getElementById("mobile_outbound_liftList")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.action === "connect-salim-qr") {
      currentLiftIndex = Number(target.dataset.index);
      console.log(`🧩 ${currentLiftIndex}번 리프트 → S.ALIM 스캔 시작`);
      startQrScan("salim");
    }
  });


  //#region ✅ 프로젝트 선택 및 리프트 배정
  let allProjects: any[] = [];

  function openProjectModal() {
    openModal("mobile_outbound_modalProject", "mobile_outbound_modalProjectPanel");
  }
  function closeProjectModal() {
    closeModal("mobile_outbound_modalProject", "mobile_outbound_modalProjectPanel");
  }

  // ✅ 모달 닫기 이벤트
  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("mobile_outbound_btnCloseModal")?.addEventListener("click", closeProjectModal);
    const overlay = document.getElementById("mobile_outbound_modalProject");
    const panel = document.getElementById("mobile_outbound_modalProjectPanel");
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay) closeProjectModal();
    });
    panel?.addEventListener("click", (e) => e.stopPropagation());
  });

  // ✅ 프로젝트 선택 버튼 클릭
  document.getElementById("mobile_outbound_btnSelectProject")?.addEventListener("click", async () => {
    if (scannedLiftList.length === 0) {
      alert("먼저 리프트를 스캔하세요.");
      return;
    }

    openProjectModal();

    // ✅ 프로젝트 목록 로드
    const res = await fetch(`${API_BASE}/api/projects`);
    const projects = await res.json();
    allProjects = projects;
    renderProjectList(projects);

    function renderProjectList(projects: any[]) {
      const container = document.getElementById("mobile_outbound_projectList")!;
      container.innerHTML = "";

      if (projects.length === 0) {
        container.innerHTML = `<div class="text-gray-400 text-center py-4 border rounded-lg bg-gray-50">조건에 맞는 프로젝트가 없습니다.</div>`;
        return;
      }

      projects.forEach((p: any) => {
        const wrap = document.createElement("div");
        wrap.className = "border rounded-lg bg-white shadow-sm p-3";

        const site = p.site_name || "-";
        const client = p.client_name || "-";
        const status = p.status || "-";

        wrap.innerHTML = `
        <div class="flex justify-between items-center cursor-pointer" data-project="${p.project_no}">
          <div>
            <div class="font-semibold text-gray-800">${p.project_name} <span class="text-xs text-gray-500">(${site})</span></div>
            <div class="text-xs text-gray-500">건설사: ${client} · 상태: ${status}</div>
          </div>
          <svg class="w-4 h-4 text-gray-500 transition-transform" data-icon viewBox="0 0 20 20">
            <path fill="currentColor" d="M5 7l5 5 5-5H5z"/>
          </svg>
        </div>
        <div class="hidden mt-2 border-t pt-2 space-y-1 text-sm" data-dongho-list></div>
      `;

        const header = wrap.querySelector("[data-project]")!;
        const donghoList = wrap.querySelector("[data-dongho-list]")!;
        const icon = wrap.querySelector("[data-icon]")!;

        // ✅ 프로젝트 클릭 → 동/호기 목록 표시
        header.addEventListener("click", async () => {
          const isOpen = !donghoList.classList.contains("hidden");

          if (isOpen) {
            donghoList.classList.add("hidden");
            icon.classList.remove("rotate-180");
          } else {
            const detail = await loadProjectDetail(p.project_no);
            const donghos = detail?.donghos || [];

            if (donghos.length === 0) {
              donghoList.innerHTML = `<div class="text-gray-400 text-center py-2 border rounded-lg bg-gray-50">
    등록된 동/호기가 없습니다.
  </div>`;
            } else {
              donghoList.innerHTML = donghos
                .map((d: any) => {
                  const lift1 = d["lift-1_name"] || "-";
                  const lift2 = d["lift-2_name"] || "-";
                  const salim1 = d["lift-1_S.ALIM_name"] || "-";
                  const salim2 = d["lift-2_S.ALIM_name"] || "-";

                  return `
        <div class="border rounded hover:bg-indigo-50">
          <button class="w-full text-left px-3 py-2 font-medium text-sm" data-dongho="${d.name}">
            ${d.name}
          </button>

          <div class="px-4 pb-2 text-xs text-gray-500 space-y-0.5">
            <div>
              <b>리프트-1:</b> ${lift1}
              <span class="ml-1">(${salim1 !== "-" ? `S.ALIM: ${salim1}` : ``})</span>
            </div>
            <div>
              <b>리프트-2:</b> ${lift2}
              <span class="ml-1">(${salim2 !== "-" ? `S.ALIM: ${salim2}` : ``})</span>
            </div>
          </div>
        </div>
      `;
                })
                .join("");
            }


            // ✅ 동/호기 클릭 시 서버 업데이트
            donghoList.querySelectorAll<HTMLButtonElement>("[data-dongho]").forEach((btn) => {
              btn.addEventListener("click", async () => {
                console.log("🟢 [EVENT] 동/호기 버튼 클릭됨");

                const element = btn as HTMLElement;
                const selectedLift = scannedLiftList[scannedLiftList.length - 1];
                const donghoName = element.dataset.dongho!;
                console.log("📍 donghoName:", donghoName);
                console.log("📍 현재 선택된 lift:", selectedLift);

                const msg = `‘${p.project_name} - ${donghoName}’에\n리프트를 배정하시겠습니까?`;
                const ok = await mobileConfirm(msg);
                if (!ok) {
                  console.log("🛑 사용자가 취소함");
                  return;
                }

                console.log("✅ 사용자 확인 완료, 자동 슬롯 결정 시작");

                // ✅ 현재 dongho 데이터 찾기 (공백 무시 비교로 변경)
                const currentDongho = (detail.donghos || []).find((d: any) => {
                  const target = (d.name || "").replace(/\s+/g, "");
                  const clicked = (donghoName || "").replace(/\s+/g, "");
                  return target === clicked;
                });

                if (!currentDongho) {
                  console.warn("⚠️ 해당 동/호기 데이터를 찾지 못했습니다. detail.donghos:", detail.donghos);
                } else {
                  console.log("🧩 currentDongho:", currentDongho);
                }

                // ✅ 자동 슬롯 결정
                let slotKey = "lift-1";
                if (currentDongho) {
                  const hasLift1 = !!currentDongho["lift-1_code"];
                  const hasLift2 = !!currentDongho["lift-2_code"];
                  console.log("🔍 hasLift1:", hasLift1, "hasLift2:", hasLift2);

                  if (hasLift1 && !hasLift2) {
                    slotKey = "lift-2";
                    console.log("➡️ lift-1 사용중 → lift-2로 자동 배정");
                  } else if (hasLift1 && hasLift2) {
                    console.warn("⚠️ 두 슬롯 모두 사용 중 → 배정 중단");
                    await mobileConfirm("⚠️ 해당 동/호기에는 이미 2대의 리프트가 모두 배정되어 있습니다.");
                    return;
                  } else {
                    console.log("✅ lift-1 슬롯 비어있음 → lift-1로 배정");
                  }
                } else {
                  console.log("⚙️ currentDongho가 없어 기본값 lift-1 사용");
                }

                // ✅ S.ALIM 정보도 슬롯에 맞게 동기화
                const nowTime = new Date().toISOString();
                const liftSlotKey = slotKey; // ex) lift-1 or lift-2
                const salimSlotKey = `${slotKey}_S.ALIM`; // ex) lift-1_S.ALIM or lift-2_S.ALIM

                // ✅ 최종 업데이트 페이로드 구성
                const updatePayload = {
                  project_no: p.project_no,
                  dongho_name: donghoName,
                  slot_key: liftSlotKey,
                  lift_info: {
                    name: selectedLift.name || "",
                    code: selectedLift.code || "",
                    outbound_time: nowTime,
                  },
                  salim_info: selectedLift.salim_info
                    ? {
                      name: selectedLift.salim_info.name,
                      code: selectedLift.salim_info.code,
                      outbound_time: nowTime,
                      slot_key: salimSlotKey, // ✅ 추가: S.ALIM 도 해당 슬롯키로 구분
                    }
                    : null,
                };

                console.log("📤 [update-dongho] 서버로 전송되는 데이터:");
                console.log(JSON.stringify(updatePayload, null, 2));

                // ✅ 1️⃣ 프로젝트 배정 업데이트
                const res = await fetch(`${API_BASE}/api/projects/update-dongho`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updatePayload),
                });

                console.log("📡 서버 응답 상태:", res.status);

                // ✅ 2️⃣ S.ALIM 상태 갱신 (존재할 때만)
                if (selectedLift.salim_info) {
                  const salimPayload = {
                    code: selectedLift.salim_info.code,
                    status: "사용중",
                    installed_lift: `${selectedLift.name} (${selectedLift.code})`,
                  };

                  console.log("📡 [update-salim] 상태 갱신:", salimPayload);

                  try {
                    const salimRes = await fetch(`${API_BASE}/api/salim/update-status`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(salimPayload),
                    });

                    if (salimRes.ok) {
                      console.log("✅ [update-salim] S.ALIM 상태 갱신 성공");
                    } else {
                      console.error("❌ [update-salim] S.ALIM 상태 갱신 실패", salimRes.status);
                    }
                  } catch (err) {
                    console.error("⚠️ [update-salim] 요청 중 오류:", err);
                  }
                }

                // ✅ 3️⃣ 프로젝트 결과 처리
                if (res.ok) {
                  await mobileConfirm(`✅ ${p.project_name} - ${donghoName} 에 ${slotKey.toUpperCase()}로 리프트가 배정되었습니다.`);
                  resetAll();
                  closeProjectModal();
                  renderLiftList();
                } else {
                  const text = await res.text();
                  console.error("❌ 서버 갱신 실패 응답:", text);
                  await mobileConfirm("❌ 프로젝트 갱신에 실패했습니다.");
                }
              });
            });




            donghoList.classList.remove("hidden");
            icon.classList.add("rotate-180");
          }
        });

        container.appendChild(wrap);
      });
    }
  });

  // ✅ 프로젝트 상세 불러오기
  async function loadProjectDetail(project_no: string) {
    const res = await fetch(`${API_BASE}/api/projects/${project_no}`);
    if (!res.ok) {
      alert("프로젝트 상세 정보를 불러오지 못했습니다.");
      return null;
    }
    const data = await res.json();
    return data;
  }
  //#endregion



  //#region ✅ 리프트 불러오기
  // ======================================================
  // 🚀 리프트 불러오기 모달 기능 (QR 스캔 없이 선택용)
  // ======================================================
  const btnCallLift = document.getElementById("mobile_outbound_btnScanLiftCall") as HTMLButtonElement;
  const modal = document.getElementById("modalLiftSelect") as HTMLElement;
  const tbody = document.getElementById("modalLiftTableBody") as HTMLElement;

  // ✅ 버튼 클릭 → 리프트 데이터 불러오기
  btnCallLift?.addEventListener("click", async () => {
    console.log("📦 [LiftCall] 리프트 불러오기 버튼 클릭됨");

    modal.classList.remove("hidden");
    tbody.innerHTML = `<tr><td colspan="15" class="text-gray-500 py-4">로딩 중...</td></tr>`;

    try {
      // ✅ 동일한 구조로 3개 API 병렬 호출
      const [partsRes, projectsRes, inspectionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/parts`, { cache: "no-store" }),
        fetch(`${API_BASE}/api/parts/projects/ongoing`, { cache: "no-store" }),
        fetch(`${API_BASE}/api/parts/lift-inspections/map`, { cache: "no-store" }),
      ]);

      if (!partsRes.ok || !projectsRes.ok || !inspectionsRes.ok)
        throw new Error("HTTP 응답 오류 발생");

      const [parts, projects, inspections]: [
        LiftRow[],
        ProjectLog[],
        InspectionMap
      ] = await Promise.all([
        partsRes.json(),
        projectsRes.json(),
        inspectionsRes.json(),
      ]);

      renderLiftSelectTable(parts, projects, inspections);
    } catch (err) {
      console.error("❌ [LiftCall] 데이터 불러오기 실패:", err);
      tbody.innerHTML = `<tr><td colspan="15" class="text-red-500 py-4">데이터 불러오기 실패</td></tr>`;
    }
  });

  // ======================================================
  // 🔸 리프트 불러오기 모달 테이블 렌더링 (정확한 셀 순서)
  // ======================================================
  function renderLiftSelectTable(parts: LiftRow[], projects: ProjectLog[], inspections: InspectionMap) {
    try {
      tbody.innerHTML = "";

      const safeParts = Array.isArray(parts) ? parts : [];
      const safeProjects = Array.isArray(projects) ? projects : [];
      const safeInspections = inspections && typeof inspections === "object" ? inspections : {};

      if (safeParts.length === 0) {
        tbody.innerHTML = `
        <tr>
          <td colspan="16" class="text-gray-500 py-4 text-center">등록된 리프트가 없습니다.</td>
        </tr>`;
        return;
      }

      // 안전 접근 유틸
      const pick = (obj: any, keys: string[], fallback = "") =>
        keys.reduce((acc, k) => (acc !== undefined && acc !== null ? acc : obj?.[k]), undefined) ?? fallback;

      safeParts.forEach((p) => {
        try {
          // ✅ 주요 필드 추출
          const no = pick(p, ["no"]);
          const division = pick(p, ["division"]);
          const name = pick(p, ["name"]);
          const code = pick(p, ["code"]);
          const spec_load = pick(p, ["spec_load"]);
          const spec_type = pick(p, ["spec_type"]);
          const spec_speed = pick(p, ["spec_speed"]);
          const spec_cage_size = pick(p, ["spec_cage_size"]);
          const manufacture_year = pick(p, ["manufacture_year"]);
          const clientName = pick(p, ["construction_company", "client_name"]);
          const location = pick(p, ["location"]);
          const serial_no = pick(p, ["serial_no", "serialNo", "serial"]);
          const inverter_installed = pick(p, ["inverter_installed"]);
          let salimName = "미장착";

          // ✅ 진행중 프로젝트 찾기
          const activeProject = safeProjects.find((proj) => {
            if (!proj.detail_log) return false;
            try {
              const detail =
                typeof proj.detail_log === "string"
                  ? JSON.parse(proj.detail_log)
                  : proj.detail_log;
              if (!Array.isArray(detail.donghos)) return false;
              return detail.donghos.some(
                (d: any) => d["lift-1_code"] === code || d["lift-2_code"] === code
              );
            } catch {
              return false;
            }
          });

          const projectName = activeProject?.project_name ?? "-";

          // ✅ S.ALIM 확인
          if (activeProject?.detail_log) {
            try {
              const detail =
                typeof activeProject.detail_log === "string"
                  ? JSON.parse(activeProject.detail_log)
                  : activeProject.detail_log;
              const matchDongho = detail.donghos?.find(
                (d: any) => d["lift-1_code"] === code || d["lift-2_code"] === code
              );
              if (matchDongho) {
                if (matchDongho["lift-1_code"] === code)
                  salimName = matchDongho["lift-1_S.ALIM_name"] || "미장착";
                else if (matchDongho["lift-2_code"] === code)
                  salimName = matchDongho["lift-2_S.ALIM_name"] || "미장착";
              }
            } catch (err) {
              console.warn("⚠️ S.ALIM 파싱 오류:", err);
            }
          }

          // ✅ 상태
          const statusLabel = activeProject ? "사용중" : "대기";

          // ✅ 행 HTML (요청하신 순서)
          const tr = document.createElement("tr");
          tr.className = "hover:bg-blue-50 cursor-pointer";
          tr.innerHTML = `
          <td class="border px-2 py-1 text-center">${no}</td>
          <td class="border px-2 py-1 text-center">${division}</td>
          <td class="border px-2 py-1 text-center">${name}</td>
          <td class="border px-2 py-1 text-center">${code}</td>
          <td class="border px-2 py-1 text-center">${spec_load}</td>
          <td class="border px-2 py-1 text-center">${spec_type}</td>
          <td class="border px-2 py-1 text-center">${spec_speed}</td>
          <td class="border px-2 py-1 text-center">${spec_cage_size}</td>
          <td class="border px-2 py-1 text-center">${projectName}</td>
          <td class="border px-2 py-1 text-center">${statusLabel}</td>
          <td class="border px-2 py-1 text-center">${serial_no}</td>
          <td class="border px-2 py-1 text-center">${manufacture_year}</td>
          <td class="border px-2 py-1 text-center">${clientName}</td>
          <td class="border px-2 py-1 text-center">${location ?? "-"}</td>
          <td class="border px-2 py-1 text-center">${inverter_installed ?? "인버터 선택"}</td>
          <td class="border px-2 py-1 text-center">${salimName}</td>
        `;

          // ✅ 클릭 시 선택 처리
          tr.addEventListener("click", async () => {
            if (statusLabel === "사용중") {
              await mobileConfirm("⚠️ 사용중인 리프트는 선택할 수 없습니다.");
              return;
            }

            if (scannedLiftList.length > 0) {
              await mobileConfirm("⚠️ 이미 리프트가 등록되어 있습니다.\n리프트는 1대만 선택 가능합니다.");
              return;
            }

            const selectedLift = {
              code,
              name,
              serial_no,
              spec_load,
              spec_type,
              spec_speed,
              spec_cage_size,
              status: "대기",
              salim_info: null,
            };

            scannedLiftList.push(selectedLift);
            renderLiftList();

            const btnSelectProject = document.getElementById("mobile_outbound_btnSelectProject") as HTMLButtonElement;
            if (btnSelectProject) {
              btnSelectProject.disabled = false;
              btnSelectProject.classList.remove("bg-gray-400", "cursor-not-allowed");
              btnSelectProject.classList.add("bg-indigo-500", "hover:bg-indigo-600");
            }

            modal.classList.add("hidden");
          });

          tbody.appendChild(tr);
        } catch (rowErr) {
          console.error("❌ [LiftSelect] 행 렌더링 오류:", rowErr);
        }
      });
    } catch (err) {
      console.error("❌ [LiftSelect] 렌더링 실패:", err);
      tbody.innerHTML = `<tr><td colspan="16" class="text-center text-red-500 py-4">렌더링 중 오류 발생</td></tr>`;
    }
  }



  // ✅ 닫기 버튼
  document.getElementById("btnCloseLiftModal")?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  //#endregion 리프트 불러오기



  //#region ✅ 리프트 선택 모달 - 필터 + 소팅 기능

  /** ✅ 모달 내 필터 입력값에 따라 테이블 행 필터링 */
  function filterModalLiftRows() {
    const location = (document.getElementById("filterLocation") as HTMLInputElement).value.trim().toLowerCase();
    const status = (document.getElementById("filterStatus") as HTMLInputElement).value.trim().toLowerCase();
    const name = (document.getElementById("filterName") as HTMLInputElement).value.trim().toLowerCase();
    const serial = (document.getElementById("filterSerial") as HTMLInputElement).value.trim().toLowerCase();

    const rows = document.querySelectorAll<HTMLTableRowElement>("#modalLiftTableBody tr");

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 16) return; // 안전 가드

      const tdName = cells[2]?.textContent?.toLowerCase() ?? "";       // 품명
      const tdStatus = cells[9]?.textContent?.toLowerCase() ?? "";     // 상태
      const tdSerial = cells[10]?.textContent?.toLowerCase() ?? "";    // 시리얼번호
      const tdLocation = cells[13]?.textContent?.toLowerCase() ?? "";  // 현재위치

      const clean = (txt: string) => txt.replace(/[-]/g, "").trim();

      const match =
        (!name || clean(tdName).includes(name)) &&
        (!status || clean(tdStatus).includes(status)) &&
        (!serial || clean(tdSerial).includes(serial)) &&
        (!location || clean(tdLocation).includes(location));

      row.style.display = match ? "table-row" : "none";
    });
  }

  /** ✅ 테이블 행 소팅 (ex. 상태, 품명, 위치 등 기준으로 정렬) */
  function sortModalLiftTable(columnIndex: number, ascending: boolean = true) {
    const tbody = document.getElementById("modalLiftTableBody") as HTMLElement;
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      const aText = a.cells[columnIndex]?.textContent?.trim().toLowerCase() || "";
      const bText = b.cells[columnIndex]?.textContent?.trim().toLowerCase() || "";

      // 숫자 형태일 경우 숫자 비교
      const aNum = parseFloat(aText.replace(/[^\d.]/g, ""));
      const bNum = parseFloat(bText.replace(/[^\d.]/g, ""));
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return ascending ? aNum - bNum : bNum - aNum;
      }

      // 문자열 비교
      return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    // 기존 tbody 초기화 후 다시 추가
    tbody.innerHTML = "";
    rows.forEach((r) => tbody.appendChild(r));
  }

  /** ✅ 모든 필터 초기화 */
  function resetModalLiftFilters() {
    document
      .querySelectorAll<HTMLInputElement>("#filterLocation, #filterStatus, #filterName, #filterSerial")
      .forEach((el) => (el.value = ""));
    document.querySelectorAll<HTMLTableRowElement>("#modalLiftTableBody tr").forEach((row) => {
      row.style.display = "table-row";
    });
  }

  // 🔹 실시간 필터링 이벤트 등록
  ["filterLocation", "filterStatus", "filterName", "filterSerial"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", filterModalLiftRows);
  });

  // 🔹 테이블 헤더 클릭 시 소팅 기능 (오름/내림차순 토글)
  (() => {
    const headerCells = document.querySelectorAll<HTMLTableCellElement>(
      "#modalLiftSelect thead th"
    );
    headerCells.forEach((th, index) => {
      let ascending = true;
      th.style.cursor = "pointer";
      th.addEventListener("click", () => {
        sortModalLiftTable(index, ascending);
        ascending = !ascending; // 다음 클릭 시 방향 반전
        headerCells.forEach((cell) => (cell.style.backgroundColor = "")); // 색상 초기화
        th.style.backgroundColor = "#e0e7ff"; // 클릭한 헤더 강조
      });
    });
  })();


  //#endregion



  //#region ✅ 공통유틸 함수

  function openModal(overlayId: string, panelId: string) {
    const overlay = document.getElementById(overlayId)!;
    const panel = document.getElementById(panelId)!;
    overlay.classList.remove("hidden");
    // 다음 프레임에 트랜지션 시작
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      panel.classList.remove("opacity-0", "scale-95");
    });
  }

  function closeModal(overlayId: string, panelId: string) {
    const overlay = document.getElementById(overlayId)!;
    const panel = document.getElementById(panelId)!;
    overlay.classList.add("opacity-0");
    panel.classList.add("opacity-0", "scale-95");
    // 트랜지션 종료 후 hidden
    setTimeout(() => {
      overlay.classList.add("hidden");
    }, 200);
  }

  /** ✅ 모바일 전용 확인 팝업 */
  function mobileConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const overlay = document.getElementById("mobile_confirm_modal")!;
      const panel = document.getElementById("mobile_confirm_panel")!; // ✅ id 기반으로 선택
      const msg = document.getElementById("mobile_confirm_message")!;
      const okBtn = document.getElementById("mobile_confirm_ok")!;
      const cancelBtn = document.getElementById("mobile_confirm_cancel")!;

      // ✅ 메시지 표시
      msg.textContent = message;

      // ✅ 팝업 열기 (트랜지션 적용)
      overlay.classList.remove("hidden");
      requestAnimationFrame(() => {
        overlay.classList.remove("opacity-0");
        panel.classList.remove("opacity-0", "scale-95");
      });

      // ✅ 닫기 및 정리 함수
      const cleanup = () => {
        overlay.classList.add("opacity-0");
        panel.classList.add("opacity-0", "scale-95");
        setTimeout(() => overlay.classList.add("hidden"), 200);

        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        overlay.removeEventListener("click", onBackdrop);
        panel.removeEventListener("click", stop);
      };

      const onOk = () => {
        cleanup();
        resolve(true);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      const onBackdrop = (e: Event) => {
        if (e.target === overlay) onCancel();
      };

      const stop = (e: Event) => e.stopPropagation();

      // ✅ 이벤트 등록
      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      overlay.addEventListener("click", onBackdrop);
      panel.addEventListener("click", stop);
    });
  }




  //#endregion



  //#region S.ALIM 불러오기 
  let salimData: any[] = [];
  let selectedLiftIdx: number | null = null;

  // 🔹 “리스트 불러오기” 버튼 클릭 시 모달 표시
  document.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.action === "connect-salim-list") {
      selectedLiftIdx = parseInt(target.dataset.index!);
      await loadSalim();
      document.getElementById("modalSalimSelect")!.classList.remove("hidden");
    }
  });

  // ✅ S.ALIM 데이터 불러오기
  async function loadSalim() {
    const res = await fetch(`${API_BASE}/api/salim`);
    salimData = await res.json();
    renderSalimTable(salimData);
  }

  // ✅ 테이블 렌더링
  function renderSalimTable(data: any[]) {
    const tbody = document.getElementById("salimTableBody")!;
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="py-4 text-gray-400">데이터가 없습니다.</td></tr>`;
      return;
    }

    data.forEach((d, i) => {
      const tr = document.createElement("tr");
      tr.classList.add("hover:bg-gray-50");
      tr.innerHTML = `
      <td class="border px-2 py-1">${i + 1}</td>
      <td class="border px-2 py-1">${d.division || ""}</td>
      <td class="border px-2 py-1">${d.category || ""}</td>
      <td class="border px-2 py-1">${d.name || ""}</td>
      <td class="border px-2 py-1">${d.code || ""}</td>
      <td class="border px-2 py-1">${d.serial_no || ""}</td>
      <td class="border px-2 py-1">${d.status || ""}</td>
      <td class="border px-2 py-1">${d.installed_lift || ""}</td>
      <td class="border px-2 py-1">
        <button class="text-sm bg-green-500 text-white rounded px-2 py-[1px] hover:bg-green-600"
          data-action="select-salim"
          data-code="${d.code}"
          data-name="${d.name}"
          data-serial="${d.serial_no}">
          선택
        </button>
      </td>
    `;
      tbody.appendChild(tr);
    });
  }

  // ✅ 선택 버튼 클릭 → 리프트와 연결
document.addEventListener("click", async (e) => {
  const target = e.target as HTMLElement;
  if (target.dataset.action === "select-salim" && selectedLiftIdx !== null) {
    const code = target.dataset.code!;
    const name = target.dataset.name!;
    const serial = target.dataset.serial!;
    const lift = scannedLiftList[selectedLiftIdx];

    const ok = await mobileConfirm(`S.ALIM '${name}' 을(를)\n'${lift.name}' 리프트에 연결하시겠습니까?`);
    if (!ok) return;

    // ✅ 단순히 로컬 lift 객체에 연결 정보 추가
    lift.salim_info = {
      code,
      name,
      serial_no: serial || "-",
    };

    // ✅ 리프트 카드 갱신
    renderLiftList();

    // ✅ 모달 닫기
    document.getElementById("modalSalimSelect")!.classList.add("hidden");

    await mobileConfirm(`✅ S.ALIM (${name}) 연결 완료`);
  }
});


  // ✅ 닫기 버튼
  document.getElementById("btnCloseSalimModal")?.addEventListener("click", () => {
    document.getElementById("modalSalimSelect")!.classList.add("hidden");
  });

  //#endregion

  // ✅ 버튼 이벤트
  btnScanLiftQR?.addEventListener("click", () => startQrScan("lift"));
  btnReset?.addEventListener("click", resetAll);

  console.log("✅ [Mobile_Lift_OutBound] 초기화 완료");
}
