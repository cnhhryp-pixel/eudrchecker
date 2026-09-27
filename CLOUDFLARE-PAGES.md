# EUDRChecker.com — Cloudflare Pages deployment

## Repository
- GitHub: cnhhryp-pixel/eudrchecker
- Production branch: main
- Framework preset: None
- Root directory: repository root
- Build command: exit 0
- Build output directory: repository root

## Custom domain
Primary domain: eudrchecker.com

In Cloudflare Pages:
1. Workers & Pages → the EUDRChecker project → Custom domains.
2. Add eudrchecker.com.
3. Make sure the domain is an active Cloudflare zone and nameservers point to Cloudflare.
4. Add www.eudrchecker.com only if it will be used for redirect handling.

## Redirects in Cloudflare dashboard
Create 301 redirects:
- www.eudrchecker.com/* → https://eudrchecker.com/:splat
- <project>.pages.dev/* → https://eudrchecker.com/:splat

Preserve query strings and path suffixes.

## Search readiness
After the custom domain is live:
- Verify https://eudrchecker.com/
- Verify https://eudrchecker.com/robots.txt
- Verify https://eudrchecker.com/sitemap.xml
- Add the domain property to Google Search Console.
- Submit https://eudrchecker.com/sitemap.xml.
- Request indexing for homepage, Product Checker, CN Code Index, Guides, Country Risk and Report.

## Notes
- _headers prevents pages.dev URLs from being indexed.
- _redirects normalizes /index.html and retires the old payment-verification path.
- SEO Audit runs automatically in GitHub Actions on pushes and pull requests.
