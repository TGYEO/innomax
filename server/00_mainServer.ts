import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import path from "path";

// ✅ 라우터 import 
import loginRouter from "./01_login-server";
import userRegisterRouter from "./02_user-register-server";
import innomaxProjectsRouter from "./03_innomax-projects-server";
import innomaxWorksRouter from "./04_innomax-works-server";
import innomaxProgressRouter from "./05_innomax-progress-server";

// ✅ .env 로딩
dotenv.config();

const app = express();
app.set('strict routing', false); // 이 줄을 추가하세요.
const PORT = Number(process.env.PORT) || 5050;

// ✅ CORS 설정
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5501",
  "http://127.0.0.1:5502",
  "http://localhost:5500",
  "http://localhost:5501",
  "http://localhost:5050",
  "https://tgyeo.github.io",
];

// ✅ 모든 CORS 허용 설정 (가장 단순한 방법)
app.use(cors({
  origin: true, // 혹은 "*" (단, credentials 사용 시 true 권장)
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "X-Requested-With"],
}));

app.use(express.json());

// ✅ PostgreSQL 연결 설정
const pool: Pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false, // 배포 환경 대응
});

// ✅ DB 연결 테스트
pool.query("SELECT 1")
  .then(() => console.log("✅ PostgreSQL 연결 성공"))
  .catch((err: Error) => {
    console.error("❌ PostgreSQL 연결 실패:", err.message);
  });

// ---------------------------------------------------------
// ✅ [핵심 수정] API 라우터를 정적 파일 설정보다 먼저 등록
// ---------------------------------------------------------

// API 확인용 핑/헬스체크
app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", message: "서버 연결 정상" });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ ok: true, server: "ok", db: "ok", now: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ ok: false, db: "error", message: (err as Error).message });
  }
});

// 기능별 API 라우터 주입
app.use("/api/login", loginRouter(pool));
app.use("/api/users", userRegisterRouter(pool));
app.use("/api/innomax-projects", innomaxProjectsRouter(pool));
app.use("/api/innomax-works", innomaxWorksRouter(pool));
app.use("/api/innomax-progress", innomaxProgressRouter(pool));

// ---------------------------------------------------------
// ✅ 정적 파일 및 루트 경로는 API 라우터 다음에 배치
// ---------------------------------------------------------

// 정적 파일 서빙
app.use("/", express.static(path.join(__dirname, "../../docs")));

// 루트 경로 (정적 파일에 index.html이 없을 경우를 대비한 Fallback)
app.get("/", (req: Request, res: Response) => {
  res.send("✅ 서버 정상 작동 중입니다! (루트 경로)");
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 즐즐즐ㄴServer running on http://localhost:${PORT}`);
});