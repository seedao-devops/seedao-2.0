/**
 * Idempotent demo seed for the file-based fake DB.
 *
 * Used by:
 *   - GET /api/_dev/seed?reset=1   (manual reset)
 *   - GET /api/_dev/login-as       (auto-seeds if users table is empty)
 *
 * Three demo accounts:
 *   admin@seedao.local / admin123      (admin)
 *   alice@seedao.local / hello123      (approved user with full journey)
 *   +8613800000002    / hello123       (pending application)
 */

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getTable, saveTable, type Schema } from "./fake-db";

export const DEMO_ACCOUNTS = {
  admin: {
    id: "admin_seed",
    label: "Admin",
    email: "admin@seedao.local",
    password: "admin123",
    role: "admin" as const,
  },
  alice: {
    id: "user_alice",
    label: "Alice (已通过)",
    email: "alice@seedao.local",
    password: "hello123",
    role: "user" as const,
  },
  bob: {
    id: "user_bob",
    label: "Bob (审核中)",
    phone: "+8613800000002",
    password: "hello123",
    role: "user" as const,
  },
} as const;

export type DemoAccountKey = keyof typeof DEMO_ACCOUNTS;

export async function isSeeded(): Promise<boolean> {
  const users = await getTable("users");
  return users.some((u) => u.id === DEMO_ACCOUNTS.admin.id);
}

export async function seedAll(): Promise<void> {
  const [adminHash, aliceHash, bobHash] = await Promise.all([
    bcrypt.hash(DEMO_ACCOUNTS.admin.password, 10),
    bcrypt.hash(DEMO_ACCOUNTS.alice.password, 10),
    bcrypt.hash(DEMO_ACCOUNTS.bob.password, 10),
  ]);
  const now = new Date().toISOString();

  const users: Schema["users"] = [
    {
      id: DEMO_ACCOUNTS.admin.id,
      email: DEMO_ACCOUNTS.admin.email,
      passwordHash: adminHash,
      role: "admin",
      createdAt: now,
    },
    {
      id: DEMO_ACCOUNTS.alice.id,
      phone: "+8613800000001",
      email: DEMO_ACCOUNTS.alice.email,
      passwordHash: aliceHash,
      role: "user",
      createdAt: now,
    },
    {
      id: DEMO_ACCOUNTS.bob.id,
      phone: DEMO_ACCOUNTS.bob.phone,
      passwordHash: bobHash,
      role: "user",
      createdAt: now,
    },
  ];

  const bases: Schema["bases"] = [
    {
      id: "base_dali",
      emoji: "🏔️",
      name: "大理沙溪共创社",
      province: "云南",
      city: "大理 · 沙溪古镇",
      description:
        "茶马古道上的千年古镇，吸引了一批数字游民与手作艺人在此长居共创，专注在地非遗与可持续设计。",
      tags: ["古镇", "山林"],
      localLife: {
        accommodations: [
          { name: "古镇客栈", price: "¥180/晚" },
          { name: "白族民宿", price: "¥260/晚" },
        ],
        coworking: [{ name: "沙溪 Coffice" }],
        tourism: [
          { name: "石宝山", customTags: ["徒步", "石窟"] },
          { name: "寺登街", customTags: ["古集市", "古戏台"] },
        ],
      },
      applyUrl: "https://example.com/apply/dali",
      skillsOffered: ["插画", "陶艺", "摄影", "瑜伽"],
      skillsNeeded: ["编程", "视频", "设计"],
      localProjects: [
        {
          id: "proj_dali_1",
          name: "白族扎染数字档案",
          status: "RECRUITING",
          description: "记录、整理、并以网络形式传播白族扎染工艺。",
          requiredSkills: ["摄影", "写作", "设计"],
          period: { start: "2026-05-01", end: "2026-08-31" },
        },
      ],
      timeline: [
        { id: "tl_dali_1", emoji: "🌱", date: "2024-03-15", title: "基地成立", description: "三位创始人在沙溪租下一座白族院落。" },
        { id: "tl_dali_2", emoji: "🎨", date: "2025-07-01", title: "首期扎染共学", description: "邀请本地匠人与 12 位游民共学。" },
      ],
      lat: 26.55,
      lng: 99.85,
      createdAt: now,
    },
    {
      id: "base_xiamen",
      emoji: "🌊",
      name: "厦门曾厝垵创客村",
      province: "福建",
      city: "厦门 · 曾厝垵",
      description: "海岛城市的创客聚落，注重独立出版、影像与海洋议题。",
      tags: ["城市", "海岛"],
      localLife: {
        accommodations: [{ name: "海边公寓", price: "¥220/晚" }],
        coworking: [{ name: "曾厝垵 Hub" }, { name: "环岛书店" }],
        tourism: [{ name: "鼓浪屿", customTags: ["历史", "建筑"] }],
      },
      applyUrl: "https://example.com/apply/xiamen",
      skillsOffered: ["写作", "视频", "音乐"],
      skillsNeeded: ["插画", "设计"],
      localProjects: [],
      timeline: [
        { id: "tl_xm_1", emoji: "🐚", date: "2025-01-10", title: "海洋影像季", description: "以海洋为主题的纪录片创作。" },
      ],
      lat: 24.45,
      lng: 118.1,
      createdAt: now,
    },
    {
      id: "base_anji",
      emoji: "🎋",
      name: "安吉竹林书院",
      province: "浙江",
      city: "安吉 · 鄣吴镇",
      description: "竹海深处的写作驻留与禅修空间。",
      tags: ["乡村", "山林"],
      localLife: {
        accommodations: [{ name: "竹林小屋", price: "¥150/晚" }],
        coworking: [{ name: "竹林工坊" }],
        tourism: [{ name: "藏龙百瀑", customTags: ["徒步", "瀑布"] }],
      },
      applyUrl: "https://example.com/apply/anji",
      skillsOffered: ["写作", "冥想", "中医"],
      skillsNeeded: ["编程", "设计"],
      localProjects: [],
      timeline: [],
      lat: 30.62,
      lng: 119.68,
      createdAt: now,
    },
  ];

  const events: Schema["coLearningEvents"] = [
    {
      id: nanoid(10),
      name: "扎染入门体验",
      instructorName: "段师傅",
      baseId: "base_dali",
      skillTags: ["插画"],
      level: "EXPERIENCE",
      period: { start: "2026-05-10", end: "2026-05-12" },
    },
    {
      id: nanoid(10),
      name: "海岛纪录片 8 周共学",
      instructorName: "Liu",
      baseId: "base_xiamen",
      skillTags: ["视频", "写作"],
      level: "SERIES",
      period: { start: "2026-06-01", end: "2026-07-26" },
    },
    {
      id: nanoid(10),
      name: "中医师徒制",
      instructorName: "陈大夫",
      baseId: "base_anji",
      skillTags: ["中医"],
      level: "MENTORSHIP",
      period: { start: "2026-04-01", end: "2026-12-31" },
    },
  ];

  const applications: Schema["applications"] = [
    {
      id: nanoid(10),
      userId: DEMO_ACCOUNTS.alice.id,
      nickname: "Alice",
      selfIntro: "在阿那亚做过 3 年共创社，希望加入 SeeDAO。",
      interestTags: ["在地共创", "教育共学", "写作出版"],
      portfolio: "https://example.com/alice",
      paymentStatus: "PAID",
      reviewStatus: "APPROVED",
      submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      reviewerId: DEMO_ACCOUNTS.admin.id,
      didStatus: "ASSIGNED",
      didInfo: "did:seedao:alice#1",
    },
    {
      id: nanoid(10),
      userId: DEMO_ACCOUNTS.bob.id,
      nickname: "Bob",
      selfIntro: "独立开发者，做过几个独立产品，现在想找个山里的基地长居。",
      interestTags: ["数字游民", "技术开发", "户外探险"],
      paymentStatus: "PAID",
      reviewStatus: "PENDING",
      submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const journeys: Schema["journeys"] = [
    {
      userId: DEMO_ACCOUNTS.alice.id,
      avatarUrl:
        "https://api.dicebear.com/9.x/lorelei/svg?seed=alice&backgroundColor=ffd5dc",
      displayName: "Alice",
      bio: "扎根大理 · 做在地教育与小型出版。",
      stays: [
        {
          baseId: "base_dali",
          location: "云南 · 大理 · 沙溪",
          period: { start: "2025-03-01", end: "2025-12-31" },
        },
      ],
      learningRecords: [{ eventId: events[0].id }],
      teachingRecords: [],
      works: [
        {
          id: nanoid(8),
          title: "白族扎染田野笔记",
          type: "ARTICLE",
          baseId: "base_dali",
          period: { start: "2025-05-01", end: "2025-08-01" },
          description: "记录沙溪扎染匠人三个月的田野调查。",
          collaborators: "段师傅、村长",
        },
      ],
      wishToLearn: [{ skillName: "中医", category: "身心" }],
      fieldVisibility: {
        avatar: true,
        bio: true,
        stays: true,
        learning: true,
        teaching: true,
        works: true,
        wishToLearn: true,
      },
      updatedAt: now,
    },
  ];

  await Promise.all([
    saveTable("users", users),
    saveTable("applications", applications),
    saveTable("bases", bases),
    saveTable("coLearningEvents", events),
    saveTable("journeys", journeys),
  ]);
}

export async function seedIfEmpty(): Promise<boolean> {
  if (await isSeeded()) return false;
  await seedAll();
  return true;
}
