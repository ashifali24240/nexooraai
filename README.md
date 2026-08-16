# Nexora AI — Final

Production URL: https://nexooraai.ashifali.workers.dev/

## Included
- Premium responsive Nexora AI UI
- Worker API: `/api/health` and `/api/chat`
- Workers AI binding: `AI`
- Model: `@cf/zai-org/glm-4.7-flash`
- Privacy, Terms, Cookies, Disclaimer, About and Contact pages
- `robots.txt` and valid sitemap
- Google Search Console verification file
- Security headers

## Important Cloudflare deployment note
This is a full Cloudflare Worker + Static Assets project. The `worker.js` file must be deployed as Worker code and the `public/` directory as the Worker static assets. A static-only upload screen will not execute `worker.js` or create the `AI` binding. Use Cloudflare's Worker deployment flow/Wrangler, or deploy the Worker code in the dashboard and configure the Workers AI binding named `AI`.
