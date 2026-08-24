# FlowMotion — Studio & Shoot Management Suite

A streamlined, high-performance web platform built for independent photographers and videographers to manage photoshoot schedules, deliverables, client billing, and studio wages.

---

## ⚡ Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions, Server Components)
- **Database**: PostgreSQL (Neon Serverless) with Prisma 7 ORM
- **Styling**: Tailwind CSS (Refined dark theme with high-contrast typography)
- **Authentication**: JWT Cookie Session with Passphrase Protection

---

## 🚀 Getting Started Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Ensure `.env` contains:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_FYV9UraQ4eEp@ep-gentle-sun-axlotinh.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
   SESSION_SECRET="studioledger-secret-key-32-chars-long-dev"
   ```

3. **Synchronize & Seed Database**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (Default passphrase: `studio123`).

5. **Run Tests**:
   ```bash
   npm test
   ```

---

## 🌐 Deploy to Vercel (100% Free)

1. Push this repository to your GitHub account.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the following **Environment Variables** in Vercel settings:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_FYV9UraQ4eEp@ep-gentle-sun-axlotinh.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - `SESSION_SECRET`: `studioledger-secret-key-32-chars-long-dev` (or any 32-char secret)
   - `AUTH_PASSPHRASE`: `studio123`
4. Click **Deploy**.