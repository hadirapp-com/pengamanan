# Cloudflare Pages Deployment Guide

## Overview

This guide covers deploying the Pengamanan Lebaran 2026 Web Admin Dashboard to Cloudflare Pages.

---

## Prerequisites

1. **Node.js Version**: 22.x (required)
   ```bash
   nvm use 22
   # or
   nvm install 22
   ```

2. **Cloudflare Account**: Free account at https://dash.cloudflare.com/

3. **GitHub Repository**: Code should be pushed to GitHub

---

## Deployment Steps

### Option 1: Connect GitHub Repository (Recommended)

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare Pages deployment"
   git push origin main
   ```

2. **Create Cloudflare Pages Project**
   - Go to https://dash.cloudflare.com/
   - Navigate to **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**

3. **Connect Your GitHub Repository**
   - Select your GitHub account
   - Choose the repository containing this project

4. **Configure Build Settings**
   ```yaml
   Build command: npm run build
   Build output directory: /web/dist
   Root directory: / (or /web if monorepo)
   ```

5. **Environment Variables** (if needed)
   - Add `VITE_API_URL` pointing to your backend API

6. **Deploy**
   - Click **Save and Deploy**
   - Wait for the build to complete

---

### Option 2: Direct Upload

1. **Build Locally**
   ```bash
   cd web
   npm install
   npm run build
   ```

2. **Upload to Cloudflare Pages**
   - Go to https://dash.cloudflare.com/
   - Navigate to **Workers & Pages** → **Create Application** → **Pages** → **Upload Assets**
   - Upload the contents of `web/dist/`
   - Wait for deployment

---

## Build Configuration

The project uses Vite with the following build configuration:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

Build output: `web/dist/`

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.example.com` |

---

## Post-Deployment Checklist

- [ ] Test login functionality
- [ ] Test all CRUD operations (Users, Petugas, Pos, QR Codes, Pengumuman)
- [ ] Test responsive design on mobile
- [ ] Verify API connectivity
- [ ] Check browser console for errors

---

## Custom Domain (Optional)

1. Go to your Cloudflare Pages project
2. Navigate to **Custom Domains**
3. Add your domain
4. Update DNS records as instructed by Cloudflare

---

## Troubleshooting

### Build Fails

- **Issue**: Node version mismatch
  - **Fix**: Ensure Node.js 22+ is installed (check `.nvmrc`)

- **Issue**: TypeScript errors
  - **Fix**: Run `npm run lint` locally to see errors

### Routes Return 404

- **Issue**: SPA routing not working
  - **Fix**: Ensure `public/_redirects` file exists with:
    ```
    /*  /index.html 200
    ```

### API Calls Fail

- **Issue**: CORS errors
  - **Fix**: Add your Cloudflare Pages domain to backend CORS allowlist

- **Issue**: Wrong API URL
  - **Fix**: Check `VITE_API_URL` environment variable

---

## Updating Production

To update the deployed site:

1. Make changes and commit to Git
2. Push to GitHub: `git push origin main`
3. Cloudflare Pages will auto-deploy on new commits

---

## Support

For issues with:
- **Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **Project**: Check docs/SPRINT.md and docs/PRD.md
