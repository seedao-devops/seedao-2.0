# 用户旅程与 MVP v0.1 发布追踪

> 语言版本：**中文**

按照角色逐一拆解每条用户旅程,列出每一步背后的 UI 组件与 API 接口,并用四列勾选框追踪 **MVP v0.1** 发布前还剩什么没做。本文档同时面向工程师(需要精确的文件路径)和非技术成员(希望从头到尾通读一遍故事)。

更深入的资料请参考 [`docs/ui.md`](./ui.md)(逐页组件清单)、[`docs/api.md`](./api.md)(API接口)以及 [`docs/testing.md`](./testing.md)(测试)。

---

## 图例说明

每一步会从四个维度评估:

| 列名 | 含义 |
|---|---|
| **UI** | 页面 / 组件功能上已经可用,视觉上完整。 |
| **API** | 接口功能正常，返回与文档一致的数据结构。 |
| **Wired** | UI 已经端到端调用真实 API(没有 mock fetch、没有 `console.log` 占位)。 |
| **Test** | [`docs/testing.md`](./testing.md) 中对应的场景目前能跑通。 |

表格中的标记:`[x]` = 已完成 · `[ ]` = 待办 · `—` = 该步骤不适用。

只有当一条旅程表内**所有行**在四列上都是 `[x]`(或 `—`)时,它才算 **v0.1 ready**。

---

## 角色一 — 访客(未登录)

任何未登录就进入网站的用户。应该能够零摩擦地探索社区,并查看公开分享的个人旅程。

### G1. 探索社区

**作为访客,我希望** 浏览 SeeDAO 的基地与共学活动,以决定是否申请加入。

| # | 步骤                                     | 页面 / UI 组件                                                                | API 接口                       | UI  | API | Wired | Test |
|---|------------------------------------------|-------------------------------------------------------------------------------|--------------------------------|-----|-----|-------|------|
| 1 | 进入首页,看到 Hero 与 CTA              | [`app/(public)/page.tsx`](../app/(public)/page.tsx)                           | —                              | [ ] | —   | —     | [ ]  |
| 2 | 打开基地浏览器,搜索与筛选               | `BasesExplorer`、`BasesMap`([`components/features/bases/`](../components/features/bases/)) | `GET /api/bases`               | [ ] | [ ] | [ ]   | [ ]  |
| 3 | 打开某个基地的详情页                     | [`app/(public)/bases/[id]/page.tsx`](../app/(public)/bases/[id]/page.tsx)     | `GET /api/bases/[id]`          | [ ] | [ ] | [ ]   | [ ]  |
| 4 | 浏览共学活动                             | `CoLearningExplorer`([`components/features/co-learning/`](../components/features/co-learning/)) | `GET /api/co-learning`         | [ ] | [ ] | [ ]   | [ ]  |
| 5 | 点击需登录的 Tab → 跳转 `/login` 并保留 `?redirect=` | [`proxy.ts`](../proxy.ts) + 底部导航                              | —                              | [ ] | —   | [ ]   | [ ]  |

### G2. 查看分享的个人旅程

**作为访客,我希望** 通过二维码 / 分享链接打开成员的旅程页,只看到对方设置为公开的字段。

| # | 步骤                                       | 页面 / UI 组件                                                                | API 接口                            | UI  | API | Wired | Test |
|---|--------------------------------------------|-------------------------------------------------------------------------------|-------------------------------------|-----|-----|-------|------|
| 1 | 通过二维码 / 链接打开 `/share/[id]`        | [`app/(public)/share/[id]/page.tsx`](../app/(public)/share/[id]/page.tsx)、`JourneyView`(只读) | `GET /api/journey/share/[id]`       | [ ] | [ ] | [ ]   | [ ]  |
| 2 | 确认服务端已剥离不可见字段                 | `JourneyView` 遵守 `fieldVisibility` 设置                                     | 路由处理器中完成服务端过滤          | [ ] | [ ] | [ ]   | [ ]  |

---

## 角色二 — 成员(已登录用户)

拥有 SeeDAO 账号的用户。先完成入驻流程,然后维护并分享自己的旅程。

### M1. 完成入驻并通过审核

**作为潜在成员,我希望** 注册账号、提交申请、标记付款,并能持续看到审核状态,直到通过审核。

| # | 步骤                                         | 页面 / UI 组件                                                                  | API 接口                                  | UI  | API | Wired | Test |
|---|----------------------------------------------|---------------------------------------------------------------------------------|-------------------------------------------|-----|-----|-------|------|
| 1 | 走完 4 步注册向导                            | `RegisterWizard`([`components/features/applications/register-wizard.tsx`](../components/features/applications/register-wizard.tsx)) | `POST /api/auth/register`                 | [ ] | [ ] | [ ]   | [ ]  |
| 2 | 提交后看到申请状态页                         | `ApplicationStatus`([`components/features/applications/application-status.tsx`](../components/features/applications/application-status.tsx)) | `GET /api/applications/me`                | [ ] | [ ] | [ ]   | [ ]  |
| 3 | 点击「标记已付款」                           | `ApplicationStatus`                                                             | `POST /api/applications/me/mark-paid`     | [ ] | [ ] | [ ]   | [ ]  |
| 4 | 关注审核时间线(待审核 → 通过 / 拒绝)       | `ApplicationStatus`                                                             | `GET /api/applications/me`(轮询/刷新)   | [ ] | [ ] | [ ]   | [ ]  |
| 5 | 被拒绝时能看到退款时间线                     | `ApplicationStatus`(退款分支)                                                  | `GET /api/applications/me`                | [ ] | [ ] | [ ]   | [ ]  |
| 6 | **真实支付网关 Webhook** 替换自助式「标记已付款」 | `ApplicationStatus`                                                       | 新增 `POST /api/payments/webhook`         | [ ] | [ ] | [ ]   | [ ]  |

### M2. 维护我的旅程

**作为已通过审核的成员,我希望** 浏览与编辑我的个人资料,控制每个段落的公开范围,并能通过二维码分享。

| # | 步骤                                     | 页面 / UI 组件                                                                | API 接口                | UI  | API | Wired | Test |
|---|------------------------------------------|-------------------------------------------------------------------------------|-------------------------|-----|-----|-------|------|
| 1 | 查看我的旅程                             | [`app/(user)/journey/page.tsx`](../app/(user)/journey/page.tsx)、`JourneyView`(完整) | `GET /api/journey/me`   | [ ] | [ ] | [ ]   | [ ]  |
| 2 | 编辑资料、停留、学习、教学、作品、想学的技能 | `ProfileEditor`([`components/features/journey/profile-editor.tsx`](../components/features/journey/profile-editor.tsx)) | `PUT /api/journey/me`   | [ ] | [ ] | [ ]   | [ ]  |
| 3 | 按段落切换公开 / 隐藏开关                | `SharePanel`([`components/features/journey/share-panel.tsx`](../components/features/journey/share-panel.tsx)) | `PUT /api/journey/me`   | [ ] | [ ] | [ ]   | [ ]  |
| 4 | 复制分享链接 + 渲染二维码                | `SharePanel`(`qrcode.react`)                                                | —                       | [ ] | —   | [ ]   | [ ]  |
| 5 | 在隐身窗口验证隐藏字段确实未泄露         | (与 G2 互相印证)                                                            | `GET /api/journey/share/[id]` | [ ] | [ ] | [ ]   | [ ]  |

### M3. 账号日常维护

**作为任意成员,我希望** 能够稳定地登录、修改密码并退出登录。

| # | 步骤                                 | 页面 / UI 组件                                                                  | API 接口                       | UI  | API | Wired | Test |
|---|--------------------------------------|---------------------------------------------------------------------------------|--------------------------------|-----|-----|-------|------|
| 1 | 通过手机号 / 邮箱 Tab 登录          | [`app/(auth)/login/page.tsx`](../app/(auth)/login/page.tsx)                     | `POST /api/auth/login`         | [ ] | [ ] | [ ]   | [ ]  |
| 2 | 顶栏展示身份信息 + 下拉菜单         | `UserHeaderMenu`([`components/layout/user-header-menu.tsx`](../components/layout/user-header-menu.tsx)) | `GET /api/auth/me`             | [ ] | [ ] | [ ]   | [ ]  |
| 3 | 用验证码修改密码                     | `SecurityPanel`([`components/features/journey/security-panel.tsx`](../components/features/journey/security-panel.tsx)) | `POST /api/auth/change-password` | [ ] | [ ] | [ ]   | [ ]  |
| 4 | 退出登录                             | `UserHeaderMenu`                                                                | `POST /api/auth/logout`        | [ ] | [ ] | [ ]   | [ ]  |
| 5 | **真实短信 / 邮件通道** 替换 `MOCK_CODE = "000000"` | `SecurityPanel`                                              | `POST /api/auth/change-password` | [ ] | [ ] | [ ]   | [ ]  |

---

## 角色三 — 管理员

通过桌面端 `/admin` 工作台运营 SeeDAO 的管理员。

### A1. 端到端处理申请

**作为管理员,我希望** 审核已提交的申请、通过或拒绝、为「已付款被拒」用户结清退款,并为通过的用户分配 DID。

| # | 步骤                                | 页面 / UI 组件                                                                  | API 接口                                            | UI  | API | Wired | Test |
|---|-------------------------------------|---------------------------------------------------------------------------------|-----------------------------------------------------|-----|-----|-------|------|
| 1 | 在工作台看到各队列的统计卡片        | [`app/admin/(authed)/page.tsx`](../app/admin/(authed)/page.tsx)(stat cards)    | `GET /api/admin/applications`(以及派生计数)        | [ ] | [ ] | [ ]   | [ ]  |
| 2 | 打开申请列表与详情抽屉              | `ApplicationsTable`([`components/features/admin/applications-table.tsx`](../components/features/admin/applications-table.tsx)) | `GET /api/admin/applications`                       | [ ] | [ ] | [ ]   | [ ]  |
| 3 | 通过某个申请                        | `ApplicationsTable` 操作                                                        | `POST /api/admin/applications/[id]/approve`         | [ ] | [ ] | [ ]   | [ ]  |
| 4 | 带原因(校验过)拒绝某个申请        | `ApplicationsTable` 操作                                                        | `POST /api/admin/applications/[id]/reject`          | [ ] | [ ] | [ ]   | [ ]  |
| 5 | 标记退款已完成                      | `RefundsTable`([`components/features/admin/refunds-table.tsx`](../components/features/admin/refunds-table.tsx)) | `POST /api/admin/refunds/[id]/complete`             | [ ] | [ ] | [ ]   | [ ]  |
| 6 | 分配 / 更新 DID 信息                | `DidsTable`([`components/features/admin/dids-table.tsx`](../components/features/admin/dids-table.tsx)) | `POST /api/admin/dids/[id]/assign`                  | [ ] | [ ] | [ ]   | [ ]  |

### A2. 维护基地数据

**作为管理员,我希望** 能创建、编辑、删除基地及其所有嵌套段落,让公开浏览页持续更新。

| # | 步骤                                 | 页面 / UI 组件                                                                  | API 接口                                  | UI  | API | Wired | Test |
|---|--------------------------------------|---------------------------------------------------------------------------------|-------------------------------------------|-----|-----|-------|------|
| 1 | 浏览基地列表(管理员视角)          | [`app/admin/(authed)/bases/page.tsx`](../app/admin/(authed)/bases/page.tsx)、`BasesAdminTable` | `GET /api/admin/bases`                    | [ ] | [ ] | [ ]   | [ ]  |
| 2 | 通过长表单创建基地                   | [`app/admin/(authed)/bases/new/page.tsx`](../app/admin/(authed)/bases/new/page.tsx)、`BaseForm` | `POST /api/admin/bases`                   | [ ] | [ ] | [ ]   | [ ]  |
| 3 | 编辑已有基地                         | [`app/admin/(authed)/bases/[id]/page.tsx`](../app/admin/(authed)/bases/[id]/page.tsx)、`BaseForm` | `GET /api/admin/bases/[id]` + `PUT /api/admin/bases/[id]` | [ ] | [ ] | [ ]   | [ ]  |
| 4 | 删除基地                             | `BaseForm`(底部固定操作栏)/ `BasesAdminTable`                                | `DELETE /api/admin/bases/[id]`            | [ ] | [ ] | [ ]   | [ ]  |

### A3. 维护共学活动

**作为管理员,我希望** 维护公开页面上展示的共学活动。

| # | 步骤                                 | 页面 / UI 组件                                                                  | API 接口                                      | UI  | API | Wired | Test |
|---|--------------------------------------|---------------------------------------------------------------------------------|-----------------------------------------------|-----|-----|-------|------|
| 1 | 浏览活动列表                         | [`app/admin/(authed)/co-learning/page.tsx`](../app/admin/(authed)/co-learning/page.tsx)、`CoLearningAdminTable` | `GET /api/admin/co-learning`                  | [ ] | [ ] | [ ]   | [ ]  |
| 2 | 通过弹窗创建活动                     | `CoLearningAdminTable`                                                          | `POST /api/admin/co-learning`                 | [ ] | [ ] | [ ]   | [ ]  |
| 3 | 编辑活动                             | `CoLearningAdminTable`                                                          | `PUT /api/admin/co-learning/[id]`             | [ ] | [ ] | [ ]   | [ ]  |
| 4 | 删除活动                             | `CoLearningAdminTable`                                                          | `DELETE /api/admin/co-learning/[id]`          | [ ] | [ ] | [ ]   | [ ]  |

---

## 发布就绪矩阵

按用户旅程做的汇总，由产品负责人进行最终确认。某一列只有当**该旅程下所有步骤**在该列都为 `[x]`(或 `—`)时才能勾选。最右侧列只有整行都打勾时才能勾选。

| 旅程                                     | UI  | API | Wired | Test | v0.1 ready? |
|------------------------------------------|-----|-----|-------|------|-------------|
| G1 探索社区                              | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| G2 查看分享的个人旅程                    | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| M1 完成入驻并通过审核                    | [ ] | [ ] | [ ]   | [ ]  | [ ](待接入真实支付 Webhook)|
| M2 维护我的旅程                          | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| M3 账号日常维护                          | [ ] | [ ] | [ ]   | [ ]  | [ ](待接入真实短信 / 邮件通道)|
| A1 端到端处理申请                        | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| A2 维护基地数据                          | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| A3 维护共学活动                          | [ ] | [ ] | [ ]   | [ ]  | [ ]         |

### MVP v0.2 — 下一版本阻塞项

上表中带备注的两行展开如下:

- [ ] **M1.7** — 用真实的支付网关 Webhook 替换自助式 `POST /api/applications/me/mark-paid` 按钮(参见 [`docs/testing.md` → Production safety check](./testing.md#production-safety-check))。
- [ ] **M3.5** — 用真实的短信 / 邮件验证通道替换 `app/api/auth/change-password/route.ts` 中的 `MOCK_CODE = "000000"`。

任何一次发布都需要的横切准备(单独追踪,不计入单条旅程):

- [ ] 用真实数据库替换 [`lib/features/_shared/fake-db.ts`](../lib/features/_shared/fake-db.ts) 中的原型存储(本地为文件、Vercel demo 为 Upstash Redis)。参考 [`docs/schema.md`](./schema.md)。
- [ ] 确认生产构建下 `/api/dev/seed` 与 `/api/dev/login-as` 由 `DEMO_RESET_TOKEN` 校验把守(无 token 返回 403)。
- [ ] 确认生产构建下 `/login` 与 `/admin/login` 不再渲染黄色的「开发环境一键登录」面板。
- [ ] 设置 `AUTH_SECRET`(Vercel demo 故意未设,见 [`docs/deploy.md`](./deploy.md))。

---

## 后续版本idea

下列内容**不**计入 v0.1 的发布信号, 仅作为记录v0.2可能要部署的功能:

- 上面已列出之外的更多生产强化(限流、审计日志、可观测性)。
- 设计打磨与响应式走查(小屏手机、大屏桌面、暗色模式)。
- i18n(目前 zh-CN 文案是硬编码)。
- 用真正的地图库替换 `BasesMap` 占位组件。

---

## 如何更新本文档

当你**新增一步**时:
1. 找到它所属的角色段落(访客 / 成员 / 管理员)。
2. 在对应旅程的表里追加一行,写上页面 / 组件路径与 API 接口。
3. 完成后逐项勾选 `UI` / `API` / `Wired` / `Test`。
4. 如果整步完全在 v0.1 之外,也要加入,但四列都保持 `[ ]`,并在 **MVP v0.1 — 当前阻塞项** 中追加说明。

当你**新增一整条旅程**时:
1. 加一个新的 `### G/M/A<n>. 标题` 小节,并写上一句「作为……我希望……」的叙述。
2. 加上步骤表。
3. 在**发布就绪矩阵**附录中追加一行。

当你**新增页面或接口**时,[`docs/api.md`](./api.md) 与 [`docs/ui.md`](./ui.md) 中的维护提示会指回本文档 — 三份文档请保持同步。
