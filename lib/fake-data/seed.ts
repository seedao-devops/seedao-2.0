import { store } from "./store";
import type {
  User,
  AuditItem,
  UserProfile,
  Skill,
  GrowthLog,
  WishlistItem,
  CoLearningActivity,
  Participant,
  Relationship,
  Handbook,
  HandbookVersion,
} from "@/lib/types";

let seeded = false;

function seedHash(password: string): string {
  return `$argon2id$v=19$m=65536,t=3,p=4$${btoa(password)}`;
}

export function seedStore() {
  if (seeded) return;
  seeded = true;

  const day = (n: number) =>
    new Date(Date.now() - n * 86400000).toISOString();
  const future = (n: number) =>
    new Date(Date.now() + n * 86400000).toISOString();

  // Password for all seed accounts: Admin1234
  const defaultPassword = "Admin1234";

  const adminUser: User = {
    id: "user-admin-001",
    email: "admin@seedao.xyz",
    phone: "+8613800000001",
    password_hash: seedHash(defaultPassword),
    email_verified: true,
    phone_verified: true,
    status: "ACTIVE",
    scope: "audit:write",
    created_at: day(90),
    updated_at: day(90),
  };

  const users: User[] = [
    adminUser,
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `user-${String(i + 1).padStart(3, "0")}`,
      email: `user${i + 1}@example.com`,
      phone: `+861380000${String(i + 10).padStart(4, "0")}`,
      password_hash: seedHash(defaultPassword),
      email_verified: true,
      phone_verified: true,
      status: i < 5 ? ("ACTIVE" as const) : ("PENDING_AUDIT" as const),
      scope: "user:read",
      created_at: day(80 - i * 3),
      updated_at: day(80 - i * 3),
    })),
  ];

  const profiles: UserProfile[] = users
    .filter((u) => u.status === "ACTIVE")
    .map((u, i) => ({
      id: `profile-${String(i + 1).padStart(3, "0")}`,
      user_id: u.id,
      nickname: ["管理员", "小明", "阿杰", "思远", "晓琳", "子豪"][i] || `用户${i}`,
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.id}`,
      banner_url: undefined,
      created_at: u.created_at,
      updated_at: u.created_at,
    }));

  const auditItems: AuditItem[] = users
    .filter((u) => u.status !== "ACTIVE" || u.id === adminUser.id)
    .map((u, i) => {
      const statuses = ["PENDING", "APPROVED", "REJECTED", "PENDING", "PENDING", "PENDING"] as const;
      return {
        id: `audit-${String(i + 1).padStart(3, "0")}`,
        user_id: u.id,
        email: u.email,
        phone: u.phone,
        nickname: `申请人${i + 1}`,
        status: statuses[i % statuses.length],
        internal_tier: statuses[i % statuses.length] === "APPROVED" ? ("TIER_1" as const) : undefined,
        remarks: statuses[i % statuses.length] === "APPROVED" ? "符合要求" : undefined,
        rejection_reason: statuses[i % statuses.length] === "REJECTED" ? "提交的信息不完整，请补充您的技能描述和工作经历后重新申请。" : undefined,
        created_at: day(30 - i * 2),
        updated_at: day(30 - i * 2),
      };
    });

  const skills: Skill[] = [
    { id: "skill-001", user_id: "user-001", name: "前端开发", description: "React、Vue、Next.js 等前端框架", level: "ADVANCED", total_hours: 120, created_at: day(60), updated_at: day(5) },
    { id: "skill-002", user_id: "user-001", name: "UI 设计", description: "Figma 界面设计和原型制作", level: "INTERMEDIATE", total_hours: 45, created_at: day(50), updated_at: day(10) },
    { id: "skill-003", user_id: "user-002", name: "Python 编程", description: "数据分析与自动化脚本", level: "BEGINNER", total_hours: 20, created_at: day(40), updated_at: day(15) },
    { id: "skill-004", user_id: "user-002", name: "摄影", description: "风光摄影和后期处理", level: "EXPERT", total_hours: 500, created_at: day(100), updated_at: day(3) },
    { id: "skill-005", user_id: "user-003", name: "写作", description: "内容创作和文案写作", level: "ADVANCED", total_hours: 200, created_at: day(80), updated_at: day(7) },
  ];

  const growthLogs: GrowthLog[] = Array.from({ length: 20 }, (_, i) => ({
    id: `growth-${String(i + 1).padStart(3, "0")}`,
    skill_id: skills[i % skills.length].id,
    user_id: skills[i % skills.length].user_id,
    date: day(i),
    hours_spent: Math.floor(Math.random() * 4) + 1,
    place: ["咖啡馆", "图书馆", "共享办公空间", "家里", "龙潭基地"][i % 5],
    notes: i % 3 === 0 ? "今天学到了很多新内容" : undefined,
    evidence_url: undefined,
    created_at: day(i),
  }));

  const wishlistItems: WishlistItem[] = [
    { id: "wish-001", user_id: "user-001", skill_name: "Rust 编程", target_level: "INTERMEDIATE", priority: "HIGH", public: true, created_at: day(20), updated_at: day(20) },
    { id: "wish-002", user_id: "user-001", skill_name: "日语", target_level: "BEGINNER", priority: "MEDIUM", public: false, created_at: day(15), updated_at: day(15) },
    { id: "wish-003", user_id: "user-002", skill_name: "视频剪辑", target_level: "ADVANCED", priority: "HIGH", public: true, created_at: day(25), updated_at: day(25) },
  ];

  const activities: CoLearningActivity[] = [
    { id: "act-001", title: "React 进阶工作坊", description: "深入学习 React Hooks、Server Components 和性能优化技巧，适合有一定基础的前端开发者。", skill_category: "前端开发", facilitator_name: "小明", max_participants: 15, scheduled_start: future(7), duration_minutes: 120, status: "PUBLISHED", created_by: "user-admin-001", created_at: day(10), updated_at: day(5) },
    { id: "act-002", title: "摄影基础课", description: "从零开始学习摄影的基本原理、构图技巧和后期处理流程。", skill_category: "摄影", facilitator_name: "阿杰", max_participants: 20, scheduled_start: future(14), duration_minutes: 90, status: "PUBLISHED", created_by: "user-admin-001", created_at: day(8), updated_at: day(3) },
    { id: "act-003", title: "写作交流会", description: "分享写作心得，互相点评作品，提升文字表达能力。", skill_category: "写作", facilitator_name: "思远", max_participants: 10, scheduled_start: future(21), duration_minutes: 60, status: "DRAFT", created_by: "user-admin-001", created_at: day(3), updated_at: day(3) },
    { id: "act-004", title: "Python 数据分析入门", description: "学习使用 Python 进行数据清洗、分析和可视化。", skill_category: "编程", facilitator_name: "晓琳", max_participants: 12, scheduled_start: day(5), duration_minutes: 150, status: "ARCHIVED", created_by: "user-admin-001", created_at: day(30), updated_at: day(5) },
  ];

  const participants: Participant[] = [
    { id: "part-001", activity_id: "act-001", user_id: "user-001", registered_at: day(5) },
    { id: "part-002", activity_id: "act-001", user_id: "user-002", registered_at: day(4) },
    { id: "part-003", activity_id: "act-002", user_id: "user-003", registered_at: day(3) },
  ];

  const relationships: Relationship[] = [
    { id: "rel-001", user_a_id: "user-001", user_b_id: "user-002", type: "LEARNING_PEER", skill_id: "skill-001", last_interaction: day(5), created_at: day(30) },
    { id: "rel-002", user_a_id: "user-003", user_b_id: "user-001", type: "TEACHER_STUDENT", skill_id: "skill-005", last_interaction: day(10), created_at: day(40) },
  ];

  const handbooks: Handbook[] = [
    {
      id: "hb-001",
      title: "龙潭数字游民生活指南",
      slug: "longtan-nomad-guide",
      excerpt: "一份完整的龙潭数字游民生活、工作和社交指南。",
      content: "# 龙潭数字游民生活指南\n\n## 住宿\n\n龙潭提供多种住宿选择，从青旅到精品民宿应有尽有。\n\n## 工作空间\n\n推荐以下几个共享办公空间：\n- SeeDAO 共创空间\n- 龙潭咖啡图书馆\n\n## 美食\n\n当地特色美食包括...\n\n## 交通\n\n从昆明到龙潭可以...",
      cover_image_url: undefined,
      cover_thumbnail_url: undefined,
      status: "PUBLISHED",
      published_at: day(20),
      created_by: "user-admin-001",
      created_at: day(25),
      updated_at: day(20),
    },
    {
      id: "hb-002",
      title: "远程工作效率提升手册",
      slug: "remote-work-productivity",
      excerpt: "如何在远程工作中保持高效和健康的工作节奏。",
      content: "# 远程工作效率提升手册\n\n## 时间管理\n\n使用番茄工作法来管理你的工作时间...\n\n## 环境搭建\n\n一个好的工作环境对效率至关重要...\n\n## 团队协作\n\n远程团队需要建立清晰的沟通规范...",
      cover_image_url: undefined,
      cover_thumbnail_url: undefined,
      status: "PUBLISHED",
      published_at: day(15),
      created_by: "user-admin-001",
      created_at: day(20),
      updated_at: day(15),
    },
    {
      id: "hb-003",
      title: "社区活动策划模板",
      slug: "community-event-template",
      excerpt: "一套实用的社区活动策划流程和模板。",
      content: "# 社区活动策划模板\n\n## 活动前准备\n\n1. 确定活动主题和目标\n2. 制定预算\n3. 选择场地\n\n## 活动执行\n\n...",
      cover_image_url: undefined,
      cover_thumbnail_url: undefined,
      status: "DRAFT",
      created_by: "user-admin-001",
      created_at: day(5),
      updated_at: day(5),
    },
  ];

  const handbookVersions: HandbookVersion[] = handbooks.map((hb, i) => ({
    id: `hbv-${String(i + 1).padStart(3, "0")}`,
    handbook_id: hb.id,
    title: hb.title,
    slug: hb.slug,
    excerpt: hb.excerpt,
    content: hb.content,
    cover_image_url: hb.cover_image_url,
    is_current: true,
    version_number: 1,
    created_at: hb.created_at,
  }));

  store.users = users;
  store.audit_items = auditItems;
  store.profiles = profiles;
  store.skills = skills;
  store.growth_logs = growthLogs;
  store.wishlist_items = wishlistItems;
  store.activities = activities;
  store.participants = participants;
  store.relationships = relationships;
  store.handbooks = handbooks;
  store.handbook_versions = handbookVersions;
}
