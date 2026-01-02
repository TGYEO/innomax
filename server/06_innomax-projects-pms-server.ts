// server/06_innomax-projects-pms-server.ts

import express, { Request, Response } from "express";
import { Pool } from "pg";


export default function innomaxProjectsPMSRouter(pool: Pool) {
    const router = express.Router();



    router.get("/target/:code_no", async (req: Request, res: Response) => {
        const { code_no } = req.params;
        console.log("Received code_no:", code_no);

        try {
            // 특정 code_no에 해당하는 데이터 가져오기
            const result = await pool.query(
                `SELECT code_no, detail_json FROM innomax_projects_pms WHERE code_no = $1`,
                [code_no]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: "해당 수주건 번호를 찾을 수 없습니다." });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (err) {
            console.error("❌ 특정 수주건 데이터 가져오기 실패:", err);
            res.status(500).json({ error: "DB 데이터 가져오기 실패" });
        }
    });

    //PMS 전체 불러오기
    router.get("/", async (_req: Request, res: Response) => {
        try {
            const result = await pool.query(`SELECT * FROM public.innomax_projects_pms`);
            res.json(result.rows);
        }
        catch (err) {
            console.error("❌ PMS 전체 불러오기 실패:", err);
            res.status(500).json({ error: "PMS 전체 불러오기 실패" });
        }
    });

    // PMS 저장하기
    router.post("/", async (_req: Request, res: Response) => {
        const pmsData = _req.body;

        try {
            const query = `
            INSERT INTO innomax_projects_pms (code_no, detail_json)
            VALUES ($1, $2)
            ON CONFLICT (code_no) 
            DO UPDATE SET detail_json = EXCLUDED.detail_json
        `;
            const values = [pmsData.spec_order_no, pmsData.pms_content];

            await pool.query(query, values);
            res.json({ message: "PMS 저장 성공" });
        } catch (err) {
            console.error("❌ PMS 저장 실패:", err);
            res.status(500).json({ error: "PMS 저장 실패" });
        }
    });




    return router;
}
