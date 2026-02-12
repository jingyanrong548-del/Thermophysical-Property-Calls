# 部署说明：GitHub 与阿里云

本文档给出**从零到上线**的详细步骤，包括：把代码推到 GitHub、配置 GitHub Pages 备用部署、配置阿里云服务器与 GitHub Actions 自动部署。

---

## 一、部署到 GitHub（代码托管 + 可选 GitHub Pages）

### 1.1 将项目推送到 GitHub

**步骤 1：在 GitHub 上创建仓库**

1. 登录 [GitHub](https://github.com)，点击右上角 **+** → **New repository**。
2. **Repository name** 填：`Thermophysical-Property-Calls`（或你自定义的名称；若改名，后文 GitHub Pages 的 base path 需一致）。
3. 选择 **Public**，不勾选 “Add a README”（本地已有代码）。
4. 点击 **Create repository**。

**步骤 2：本地初始化并推送（若尚未有 git）**

在项目根目录执行：

```bash
cd /Users/jingyanrong/Desktop/MyGitHubProjects/Thermophysical-Property-Calls

# 若还没有 git 仓库
git init
git add .
git commit -m "Initial commit: CoolProp 物性查询前端"

# 添加远程仓库（把 YOUR_USERNAME 换成你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/Thermophysical-Property-Calls.git

# 主分支命名为 main 并推送
git branch -M main
git push -u origin main
```

若已有 `origin` 且只是换地址，可执行：

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/Thermophysical-Property-Calls.git
git push -u origin main
```

推送成功后，代码即部署在 GitHub 上（仅托管，网站未上线）。

---

### 1.2 部署到 GitHub Pages（可选，备用访问）

GitHub Pages 会生成地址：`https://YOUR_USERNAME.github.io/Thermophysical-Property-Calls/`。

**步骤 1：开启 GitHub Pages**

1. 打开仓库 → **Settings** → 左侧 **Pages**。
2. **Source** 选 **GitHub Actions**（不要选 Deploy from a branch）。
3. 若提示 “Choose a theme” 可先跳过，后面由 workflow 部署。

**步骤 2：首次运行部署 workflow**

1. 打开仓库 → **Actions**。
2. 左侧选择 **Deploy to GitHub Pages (Backup)**。
3. 点击 **Run workflow** → 选择 `main` 分支 → **Run workflow**。
4. 等待约 1～2 分钟，绿色勾表示成功。

**步骤 3：查看访问地址**

- **Settings** → **Pages** 中会显示：`Your site is live at https://YOUR_USERNAME.github.io/Thermophysical-Property-Calls/`。
- 本项目的 workflow 已配置 `VITE_BASE_PATH: /Thermophysical-Property-Calls/`，与上述路径一致；若仓库名不同，需同步修改 `.github/workflows/deploy-gh-pages.yml` 里的 `VITE_BASE_PATH`。

**说明**：GitHub Pages 为静态站点，前端会请求 `https://coolpropapi.jingyanrong.com` 的 API，无需在 Pages 上部署后端。

---

## 二、部署到阿里云（主站 tpc.jingyanrong.com）

### 2.1 服务器与域名信息（本示例）

| 项目     | 值 |
|----------|----|
| 服务器 IP | `8.138.191.154` |
| 域名     | `tpc.jingyanrong.com` |
| SSH 用户 | `admin` |
| 网站根目录 | `/www/wwwroot/tpc.jingyanrong.com` |

你的实际 IP/域名/用户/目录请按自己的环境修改，并同步改下文中的命令与 GitHub Secrets。

---

### 2.2 服务器环境准备

**步骤 1：登录服务器**

```bash
ssh admin@8.138.191.154
```

**步骤 2：安装 rsync（若未安装）**

- CentOS / Aliyun Linux：`sudo yum install -y rsync`
- Ubuntu / Debian：`sudo apt update && sudo apt install -y rsync`

**步骤 3：创建网站目录并设置权限**

```bash
# 若目录不存在则创建
sudo mkdir -p /www/wwwroot/tpc.jingyanrong.com

# 将所有者改为 GitHub Actions 使用的 SSH 用户（此处为 admin）
sudo chown -R admin:admin /www/wwwroot/tpc.jingyanrong.com
sudo chmod -R 755 /www/wwwroot/tpc.jingyanrong.com
```

**步骤 4：配置 Nginx（宝塔面板示例）**

若使用**宝塔**：

1. 登录宝塔 → **网站** → **添加站点**。
2. 域名填：`tpc.jingyanrong.com`，根目录：`/www/wwwroot/tpc.jingyanrong.com`。
3. 添加成功后，点击该站点 → **设置** → **配置文件**，在 `server { ... }` 内确保有：

```nginx
root /www/wwwroot/tpc.jingyanrong.com;
index index.html;

location / {
    try_files $uri $uri/ /index.html;
}
```

4. 保存后重载 Nginx。若需 HTTPS，在宝塔 **SSL** 中申请 Let's Encrypt 即可。

若**不用宝塔、手动配置 Nginx**，可新建站点配置（如 `/etc/nginx/conf.d/tpc.conf`）：

```nginx
server {
    listen 80;
    server_name tpc.jingyanrong.com;
    root /www/wwwroot/tpc.jingyanrong.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 可选：SSL 由 certbot 等配置
}
```

然后：`sudo nginx -t && sudo systemctl reload nginx`。

**步骤 5：处理 .user.ini（仅宝塔可能遇到）**

若部署时 rsync 报错或无法写入，检查站点目录下是否有 `.user.ini`：

```bash
ls -la /www/wwwroot/tpc.jingyanrong.com/.user.ini
```

若存在且导致权限问题，可临时解锁（按需操作）：

```bash
sudo chattr -i /www/wwwroot/tpc.jingyanrong.com/.user.ini
```

---

### 2.3 配置 SSH 密钥（供 GitHub Actions 登录）

**步骤 1：在本地生成一对 SSH 密钥（若还没有）**

```bash
# 若已有 ~/.ssh/id_rsa 且打算用它，可跳过生成，直接看步骤 2
ssh-keygen -t rsa -b 4096 -C "github-actions-aliyun" -f ~/.ssh/id_rsa_aliyun -N ""
```

**步骤 2：把公钥写入阿里云服务器**

在**本地**执行（把 `admin@8.138.191.154` 换成你的用户@IP）：

```bash
ssh-copy-id -i ~/.ssh/id_rsa_aliyun.pub admin@8.138.191.154
# 若用的是默认 id_rsa：
# ssh-copy-id admin@8.138.191.154
```

按提示输入服务器密码，完成后应能无密码登录：

```bash
ssh -i ~/.ssh/id_rsa_aliyun admin@8.138.191.154
# 或
ssh admin@8.138.191.154
```

**步骤 3：复制私钥内容（用于 GitHub Secret）**

在**本地**执行：

```bash
# 若使用刚生成的密钥
cat ~/.ssh/id_rsa_aliyun

# 若使用默认 id_rsa
cat ~/.ssh/id_rsa
```

**完整复制终端输出的整段内容**，包括：

- 第一行：`-----BEGIN OPENSSH PRIVATE KEY-----`（或 `-----BEGIN RSA PRIVATE KEY-----`）
- 中间所有行
- 最后一行：`-----END OPENSSH PRIVATE KEY-----`（或 `-----END RSA PRIVATE KEY-----`）

不要多复制空格或换行，也不要漏掉头尾。保存到记事本备用，下一步粘贴到 GitHub。

---

### 2.4 在 GitHub 仓库中配置 Secrets

**步骤 1：打开仓库 Secrets 页面**

1. 打开你的仓库：`https://github.com/YOUR_USERNAME/Thermophysical-Property-Calls`
2. 点击 **Settings** → 左侧 **Secrets and variables** → **Actions**。
3. 点击 **New repository secret**。

**步骤 2：依次添加 4 个 Secret**

| Name | Value | 说明 |
|------|--------|------|
| `ALIYUN_HOST` | `8.138.191.154` | 阿里云服务器 IP |
| `ALIYUN_USER` | `admin` | SSH 登录用户名 |
| `ALIYUN_DEPLOY_PATH` | `/www/wwwroot/tpc.jingyanrong.com` | 网站根目录（rsync 目标） |
| `ALIYUN_SSH_KEY` | （粘贴步骤 2.3 复制的整段私钥） | 用于 SSH 登录的私钥内容 |

添加 `ALIYUN_SSH_KEY` 时注意：

- 名称必须为 `ALIYUN_SSH_KEY`。
- Value 中粘贴**整段**私钥，含 `-----BEGIN ... -----` 和 `-----END ... -----`。
- 若从终端复制，不要多出或缺少换行；若从文件复制，确保没有多余空格。

保存后，列表中应看到 4 个 Secret（值会被隐藏）。

---

### 2.5 触发部署并验证

**方式 A：自动部署（推送到 main）**

在本地修改代码后：

```bash
git add .
git commit -m "Update xxx"
git push origin main
```

推送后：

1. 打开仓库 **Actions** 页。
2. 应出现 **Deploy to Aliyun** workflow，状态为 Running → 成功后为绿色勾。
3. 若失败，点进该次运行查看 **Build and deploy** 的日志（如 SSH 连接、rsync 报错等）。

**方式 B：手动触发一次**

1. 仓库 **Actions** → 左侧选 **Deploy to Aliyun**。
2. 右侧 **Run workflow** → 选分支 `main` → **Run workflow**。
3. 等待约 1～2 分钟，查看是否成功。

**验证网站**

- 浏览器访问：`http://tpc.jingyanrong.com`（若已配置 SSL 则用 `https://tpc.jingyanrong.com`）。
- 应能看到物性查询界面；若出现白屏，检查 Nginx 是否配置了 `try_files $uri $uri/ /index.html;`。
- 前端会请求 `https://coolpropapi.jingyanrong.com`，确保该 API 可访问。
- 若湿空气等接口返回 404，见 **`阿里云API部署排查流程.md`** 逐步排查 coolprop-api 的部署。  
- 若怀疑**本前端**在阿里云的配置有问题，见 **`阿里云前端部署检测流程.md`** 排查 tpc.jingyanrong.com。

---

## 三、故障排查速查

### 3.1 rsync 报 Permission denied / exit code 23（必看）

若 Actions 里 **Deploy with Rsync** 出现：

- `rsync: chgrp "*** /." failed: Operation not permitted`
- `cannot delete non-empty directory: .well-known/...`
- `unlink(...) failed: Permission denied (13)`（如 `.user.ini`、`404.html`）
- `mkdir "*** /assets" failed: Permission denied (13)`
- **Process completed with exit code 23**

说明服务器上**部署目录及其中的文件不属于你用来部署的 SSH 用户**（例如宝塔用 root/www 建站，而 GitHub 用的是 `admin`）。按下面在**阿里云服务器上**执行（需 root 或 sudo）。

**重要**：若先执行 `chown` 会报 `.user.ini: Operation not permitted`，是因为宝塔给该文件加了不可变属性，必须先执行步骤 1 再执行步骤 2。

**步骤 1：解除宝塔对 .user.ini 的锁定（必须先做，否则 chown 也会报 Operation not permitted）**

```bash
sudo chattr -i /www/wwwroot/tpc.jingyanrong.com/.user.ini
```

若提示文件不存在可忽略。若本账号执行 `chattr` 仍报错，改用 root 登录或到宝塔面板的终端（默认 root）执行上述命令（去掉 `sudo`）。

**步骤 2：把整站目录属主改为部署用户（与 GitHub Secret 里 `ALIYUN_USER` 一致）**

```bash
sudo chown -R admin:admin /www/wwwroot/tpc.jingyanrong.com
```

**步骤 3：让 Nginx 仍能读（可选，若 Nginx 以 www 运行）**

```bash
# 仅当 Nginx 运行用户是 www 时，可把组改为 www 并给组读权限
sudo chown -R admin:www /www/wwwroot/tpc.jingyanrong.com
sudo chmod -R 755 /www/wwwroot/tpc.jingyanrong.com
```

若你希望部署用户完全拥有目录（推荐），保持步骤 1 的 `admin:admin` 即可，Nginx 一般仍能读 755 的目录。

**步骤 4：重新跑一次部署**

仓库 **Actions** → **Deploy to Aliyun** → **Run workflow**。若仍有报错，再看日志里是哪一个路径 Permission denied，对该路径再执行一次 `sudo chown -R admin:admin 该路径`。

---

### 3.2 其他常见问题

| 现象 | 可能原因 | 处理建议 |
|------|----------|----------|
| **Load key "... invalid format"** | SSH 私钥格式错误或复制不完整 | 重新复制私钥，确保含 BEGIN/END 两行且无多余空格 |
| **Permission denied (publickey)** | 服务器上未加入对应公钥或用户错 | 用 `ssh-copy-id` 把公钥写入 `~/.ssh/authorized_keys`，Secret 中 `ALIYUN_USER` 与登录用户一致 |
| **rsync: command not found** | 服务器未安装 rsync | 在服务器安装：`yum install rsync` 或 `apt install rsync` |
| **白屏 / 刷新 404** | 未做 SPA 回退 | Nginx 中 `location /` 增加 `try_files $uri $uri/ /index.html;` |
| **npm ci 失败** | 缺少 lockfile 或 Node 版本不符 | 本地执行 `npm install` 生成/更新 `package-lock.json` 并提交，workflow 使用 Node 20 |

---

## 四、流程小结

1. **GitHub 代码**：本地 `git push origin main` → 代码在 GitHub 上。
2. **GitHub Pages（可选）**：Settings → Pages → Source 选 GitHub Actions → Actions 里运行 “Deploy to GitHub Pages (Backup)” → 访问 `https://用户名.github.io/Thermophysical-Property-Calls/`。
3. **阿里云**：服务器装 rsync、建目录、配 Nginx、本机配 SSH 公钥 → GitHub 仓库配置 4 个 Actions Secrets → 推 main 或手动运行 “Deploy to Aliyun” → 访问 `https://tpc.jingyanrong.com`。

按上述顺序操作即可完成从 GitHub 到阿里云的完整部署。
