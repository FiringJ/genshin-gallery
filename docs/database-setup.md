# 数据库设置文档

本文档详细说明了项目数据库的设置流程和相关技术细节。

## 1. 环境准备

### 1.1 必要依赖

```bash
# 安装项目依赖
pnpm add -D prisma @prisma/client  # Prisma: Node.js 和 TypeScript 的 ORM，用于数据库操作
pnpm add -D tsx typescript @types/node  # TypeScript 相关依赖
```

### 1.2 Docker 配置
创建 `docker-compose.yml` 文件。Docker Compose 用于定义和运行多容器 Docker 应用程序：

```yaml
version: '3.8'  # Docker Compose 文件版本
services:
  db:  # 服务名称
    image: postgres:14  # 使用 PostgreSQL 14 版本镜像
    container_name: genshin-db  # 容器名称
    environment:  # 环境变量配置
      POSTGRES_USER: postgres  # 数据库用户名
      POSTGRES_PASSWORD: postgres  # 数据库密码
      POSTGRES_DB: genshin_db  # 数据库名称
    ports:  # 端口映射，格式为 "主机端口:容器端口"
      - "5432:5432"
    volumes:  # 数据持久化配置
      - postgres_data:/var/lib/postgresql/data  # 将数据存储在命名卷中

volumes:  # 定义命名卷
  postgres_data:  # 用于持久化存储数据库文件
```

## 2. 数据库配置

### 2.1 环境变量
创建 `.env` 文件，用于存储数据库连接信息：

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/genshin_db?schema=public"
```

### 2.2 Prisma Schema
创建 `prisma/schema.prisma` 文件。Prisma Schema 是数据库模型的声明式定义：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Character {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  imageUrl  String   @map("image_url")
  detailUrl String   @map("detail_url")
  element   String?  // 可选字段，用于筛选
  rarity    Int?     // 可选字段，用于筛选
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("characters")
}
```

## 3. 数据库初始化

### 3.1 启动数据库

```bash
# 启动 PostgreSQL 容器
docker-compose up -d

# 验证容器状态
docker-compose ps
```

### 3.2 创建数据库表

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库迁移
npx prisma migrate dev --name init
```

## 4. 数据导入

### 4.1 数据导入脚本
创建 `scripts/import-characters.ts` 文件。这个脚本用于将 JSON 数据导入数据库：

```ts
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  try {
    // 读取 JSON 文件
    const rawData = fs.readFileSync(
      path.join(__dirname, '../assets/characters.json'),
      'utf-8'
    )
    const characters = JSON.parse(rawData)

    // 批量创建角色数据
    await prisma.character.createMany({
      data: characters.map((char: any) => ({
        name: char.name,
        imageUrl: char.image_url,
        detailUrl: char.detail_url
      })),
      skipDuplicates: true // 跳过重复的名称
    })

    console.log('数据导入成功！')
  } catch (error) {
    console.error('数据导入失败：', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
```

### 4.2 执行数据导入
```bash
# 执行数据导入
npx tsx scripts/import-characters.ts
```

## 5. 数据验证

### 5.1 使用 Prisma Studio
```bash
# 启动 Prisma Studio
npx prisma studio
```
访问 http://localhost:5555 查看数据库内容


## 6. 常用操作

### 6.1 Docker 命令
```bash
# 启动容器
docker-compose start

# 停止容器
docker-compose stop

# 查看容器日志
docker-compose logs

# 删除容器（保留数据）
docker-compose down

# 删除容器和数据
docker-compose down -v
```

### 6.2 数据库管理
```bash
# 重新生成 Prisma Client
npx prisma generate

# 创建新的迁移
npx prisma migrate dev --name <migration-name>

# 重置数据库
npx prisma migrate reset
```


## 7. 故障排除

### 7.1 常见问题
1. 数据库连接失败
   - 检查 Docker 容器状态
   - 验证环境变量配置
   - 确认端口是否被占用

2. 数据导入失败
   - 检查 JSON 文件格式
   - 确认文件路径正确
   - 查看详细错误信息

### 7.2 调试工具
- Docker Desktop
- Prisma Studio
- pgAdmin（可选）

## 8. 注意事项

1. 生产环境配置
   - 使用强密码
   - 配置数据库备份
   - 限制数据库访问权限

2. 开发建议
   - 定期备份数据
   - 使用版本控制管理迁移文件
   - 遵循数据库命名规范