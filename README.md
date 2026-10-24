# Live Query Filter System

A full-stack React + Express catalog browser with a debounced search box, multi-category filtering, paginated backend queries, responsive resource cards, loading and error states.

## Requirements
Node.js 20.19+ (Node 24 is supported).

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173. API runs on http://localhost:4000.

## Production
```bash
npm run build
npm start
```
Open http://localhost:4000. Set the `PORT` environment variable on your host if needed.

## API
- `GET /api/health`
- `GET /api/categories`
- `GET /api/resources?search=learning&category=Analytics,Development&page=1&limit=12`

Data: `server/catalog.json` (250 provided synthetic records). Filtering is case-insensitive. The backend validates page and limit, and returns `{data, pagination}`.

## Deployment
Deploy as a Node web service (e.g. Render): build command `npm install && npm run build`; start command `npm start`. The Express server serves both the API and built React app from the same domain. Upload the repository to GitHub and include both GitHub and deployed app URLs in your submission.
