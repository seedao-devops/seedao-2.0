/**
 * Single source of truth for every enum used across features.
 * Add a new tag here and it shows up in every form, filter, and badge.
 */

export const INTEREST_TAGS = [
  "数字游民",
  "可持续生活",
  "在地共创",
  "手作工艺",
  "摄影影像",
  "写作出版",
  "户外探险",
  "教育共学",
  "身心疗愈",
  "文创设计",
  "技术开发",
  "音乐艺术",
] as const;
export type InterestTag = (typeof INTEREST_TAGS)[number];

export const BASE_TAGS = ["乡村", "店铺", "山林", "海岛", "古镇", "城市"] as const;
export type BaseTag = (typeof BASE_TAGS)[number];

export const SKILL_TAGS = [
  "摄影",
  "写作",
  "插画",
  "陶艺",
  "木工",
  "编程",
  "设计",
  "瑜伽",
  "冥想",
  "中医",
  "英语",
  "日语",
  "园艺",
  "烹饪",
  "音乐",
  "视频",
] as const;
export type SkillTag = (typeof SKILL_TAGS)[number];

export const WISH_CATEGORIES = [
  "手工",
  "数字",
  "身心",
  "语言",
  "生活技能",
  "文创",
  "CUSTOM",
] as const;
export type WishCategory = (typeof WISH_CATEGORIES)[number];

export const WORK_TYPES = ["PHOTO", "ARTICLE", "PRODUCT"] as const;
export type WorkType = (typeof WORK_TYPES)[number];
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  PHOTO: "摄影",
  ARTICLE: "文章",
  PRODUCT: "产品",
};

export const LEVEL_TAGS = ["EXPERIENCE", "SERIES", "MENTORSHIP"] as const;
export type LevelTag = (typeof LEVEL_TAGS)[number];
export const LEVEL_TAG_LABELS: Record<LevelTag, string> = {
  EXPERIENCE: "体验课",
  SERIES: "系列课",
  MENTORSHIP: "师徒制",
};

export const PROJECT_STATUS = ["RECRUITING", "IN_PROGRESS", "FINISHED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  RECRUITING: "招募中",
  IN_PROGRESS: "进行中",
  FINISHED: "已结束",
};

export const PAYMENT_STATUS = [
  "UNPAID",
  "PAID",
  "REFUND_PENDING",
  "REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "未付款",
  PAID: "已付款",
  REFUND_PENDING: "退款中",
  REFUNDED: "已退款",
};

export const REVIEW_STATUS = [
  "PENDING",
  "APPROVED",
  "REJECTED_AWAITING_REFUND",
  "REJECTED_REFUNDED",
] as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[number];
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED_AWAITING_REFUND: "已拒绝（等待退款）",
  REJECTED_REFUNDED: "已拒绝（完成退款）",
};

export const DID_STATUS = ["PENDING_ASSIGN", "ASSIGNED"] as const;
export type DidStatus = (typeof DID_STATUS)[number];
export const DID_STATUS_LABELS: Record<DidStatus, string> = {
  PENDING_ASSIGN: "等待分配",
  ASSIGNED: "分配完成",
};

export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

// Abbreviated CN province list — extend as needed.
export const CN_PROVINCES = [
  "北京",
  "上海",
  "广东",
  "云南",
  "四川",
  "浙江",
  "福建",
  "海南",
  "贵州",
  "山东",
  "湖南",
  "湖北",
  "江苏",
  "陕西",
  "辽宁",
  "甘肃",
  "西藏",
  "新疆",
  "广西",
  "安徽",
  "河南",
  "河北",
  "山西",
  "内蒙古",
  "宁夏",
  "青海",
  "吉林",
  "黑龙江",
  "天津",
  "重庆",
  "江西",
  "台湾",
  "香港",
  "澳门",
] as const;
export type CnProvince = (typeof CN_PROVINCES)[number];
