// server/innomax-projects-server.ts

import express, { Request, Response } from "express";
import { Pool } from "pg";


export default function innomaxProjectsRouter(pool: Pool) {
  const router = express.Router();



  router.post("/", async (req: Request, res: Response) => {
    const { code_no, detail_json, detail_box_json } = req.body;

    if (!code_no) {
      return res.status(400).json({ error: "code_no is required" });
    }

    try {
      // detail_json 최종 저장 구조
      const saveJson = {
        detail_json,
        detail_box_json
      };

      await pool.query(
        `INSERT INTO innomax_projects (code_no, detail_json)
             VALUES ($1, $2)
             ON CONFLICT (code_no) DO UPDATE SET detail_json = EXCLUDED.detail_json`,
        [code_no, saveJson]
      );

      res.json({ success: true, code_no });
    } catch (err) {
      console.error("❌ 프로젝트 저장 실패:", err);
      res.status(500).json({ error: "DB 저장 실패" });
    }
  });



  //수주건 일단 전체 조회함
  router.get("/innomax/projects", async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
            SELECT 
                code_no,
                detail_json->'detail_json'->>'equipment_type_panel-수주건등록-2' AS equipment_type,
                detail_json->'detail_json'->>'customer_name_panel-수주건등록-2' AS customer_name
            FROM innomax_projects
            ORDER BY code_no DESC
        `);

      res.json(result.rows);
    } catch (err) {
      console.error("❌ 프로젝트 리스트 조회 실패:", err);
      res.status(500).json({ error: "DB 조회 실패" });
    }
  });

  //특정코드 수주건만  조회함
  router.get("/innomax/project/:code_no", async (req: Request, res: Response) => {
    const { code_no } = req.params;

    try {
      const result = await pool.query(
        `SELECT detail_json FROM innomax_projects WHERE code_no = $1`,
        [code_no]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "NOT_FOUND", message: "수주건을 찾을 수 없습니다." });
      }

      res.json(result.rows[0]);   // { detail_json: {...} }
    } catch (err) {
      console.error("❌ 수주건 조회 실패:", err);
      res.status(500).json({ error: "DB_ERROR", message: "데이터 조회 실패" });
    }
  });


  return router;
}
