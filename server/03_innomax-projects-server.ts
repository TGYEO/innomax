// server/innomax-projects-server.ts

import express, { Request, Response } from "express";
import { Pool } from "pg";


export default function innomaxProjectsRouter(pool: Pool) {
  const router = express.Router();


  router.get("/target/:number", async (req: Request, res: Response) => {
    const { number } = req.params;

    try {
      // 특정 code_no에 해당하는 데이터 가져오기
      const result = await pool.query(
        `SELECT code_no, detail_json FROM innomax_projects WHERE code_no = $1`,
        [number]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "해당 수주건 번호를 찾을 수 없습니다." });
      }

      res.json({ 
        success: true, 
        rows: result.rows[0] });
    } catch (err) {
      console.error("❌ 특정 수주건 데이터 가져오기 실패:", err);
      res.status(500).json({ error: "DB 데이터 가져오기 실패" });
    }
  });


  router.get("/target_callspec/:number", async (req: Request, res: Response) => {
    const { number } = req.params;

    try {
      // 특정 code_no에 해당하는 데이터 가져오기
      const result = await pool.query(
        `SELECT code_no, detail_spec_json FROM innomax_projects WHERE code_no = $1`,
        [number]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "해당 수주건 번호를 찾을 수 없습니다." });
      }

      res.json({ 
        success: true, 
        rows: result.rows[0] });
    } catch (err) {
      console.error("❌ 특정 수주건 데이터 가져오기 실패:", err);
      res.status(500).json({ error: "DB 데이터 가져오기 실패" });
    }
  });

  router.get("/", async (req: Request, res: Response) => {
    try {
      // 모든 데이터 가져오기
      const result = await pool.query(
        `SELECT code_no, detail_json FROM innomax_projects`
      );

      res.json({ success: true, 
        rows: result.rows });
    } catch (err) {
      console.error("❌ 데이터 가져오기 실패:", err);
      res.status(500).json({ error: "DB 데이터 가져오기 실패" });
    }
  });


  router.put("/:order_no", async (req: Request, res: Response) => {
    const { order_no } = req.params; // URL에서 order_no 가져오기
    const details = req.body; // 요청 본문 전체를 details로 처리

    // 요청 파라미터와 본문 로깅
    console.log("🔍 Request Params:", req.params);
    console.log("🔍 Request Body:", req.body);

    if (!details || Object.keys(details).length === 0) {
      console.error("❌ 요청 본문에 'details'가 없습니다.");
      return res.status(400).json({ error: "details are required" });
    }

    try {
      // 해당 order_no가 존재하는지 확인
      console.log("🔍 Checking if order_no exists in the database...");
      const existingOrder = await pool.query(
        `SELECT code_no FROM innomax_projects WHERE code_no = $1`,
        [order_no]
      );

      console.log("🔍 Existing Order Query Result:", existingOrder.rows);

      if (existingOrder.rowCount === 0) {
        console.error(`❌ order_no '${order_no}'를 찾을 수 없습니다.`);
        return res.status(404).json({ error: "해당 order_no를 찾을 수 없습니다." });
      }

      // 데이터 업데이트
      console.log("🔍 Updating database with new details...");
      await pool.query(
        `UPDATE innomax_projects SET detail_json = $1 WHERE code_no = $2`,
        [details, order_no]
      );

      console.log("✅ 데이터가 성공적으로 업데이트되었습니다.");
      res.json({ success: true, message: "데이터가 성공적으로 업데이트되었습니다." });
    } catch (err) {
      console.error("❌ 데이터 업데이트 실패:", err);
      res.status(500).json({ error: "DB 업데이트 실패" });
    }
  });

  router.put("/spec_update/:order_no", async (req: Request, res: Response) => {
    const { order_no } = req.params; // URL에서 order_no 가져오기
    const details_spec = req.body; // 요청 본문 전체를 details로 처리

    if (!details_spec || Object.keys(details_spec).length === 0) {
      console.error("❌ 요청 본문에 'details_spec'이 없습니다.");
      return res.status(400).json({ error: "details are required" });
    }

    try {
      // 해당 order_no가 존재하는지 확인
      console.log("🔍 Checking if order_no exists in the database...");
      const existingOrder = await pool.query(
        `SELECT code_no FROM innomax_projects WHERE code_no = $1`,
        [order_no]
      );

      if (existingOrder.rowCount === 0) {
        console.error(`❌ order_no '${order_no}'를 찾을 수 없습니다.`);
        return res.status(404).json({ error: "해당 order_no를 찾을 수 없습니다." });
      }

      await pool.query(
        `UPDATE innomax_projects SET detail_spec_json = $1 WHERE code_no = $2`,
        [details_spec, order_no]
      );

      console.log("✅ Spec 데이터가 성공적으로 업데이트되었습니다.");
      res.json({ success: true, message: "Spec 데이터가 성공적으로 업데이트되었습니다." });
    } catch (err) {
      console.error("❌ Spec 데이터 업데이트 실패:", err);
      res.status(500).json({ error: "DB 업데이트 실패" });
    }
  });



  router.post("/", async (req: Request, res: Response) => {
    const { orderNo, details } = req.body;

    if (!orderNo) {
      return res.status(400).json({ error: "code_no is required" });
    }

    try {
      // 중복 확인
      const existingOrder = await pool.query(
        `SELECT code_no FROM innomax_projects WHERE code_no = $1`,
        [orderNo]
      );

      if ((existingOrder.rowCount ?? 0) > 0) {
        return res.status(409).json({ error: "중복된 code_no가 존재합니다." });
      }

      // 새로운 데이터 삽입
      await pool.query(
        `INSERT INTO innomax_projects (code_no, detail_json)
             VALUES ($1, $2)`,
        [orderNo, details]
      );

      res.json({ success: true, orderNo });
    } catch (err) {
      console.error("❌ 프로젝트 저장 실패:", err);
      res.status(500).json({ error: "DB 저장 실패" });
    }
  });






  return router;
}
