# Security and Performance Headers for Production

This document outlines recommended HTTP headers for the Life with a Twist of Lemon podcast website. These headers should be configured at the hosting/CDN level (GitHub Pages, Netlify, Cloudflare, etc.).

## Security Headers

### Content Security Policy (CSP)
Prevents XSS attacks and unauthorized resource loading.

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https://media.twistoflemonpod.com; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

**Explanation:**
- `default-src 'self'` - Only allow resources from same origin
- `script-src 'self' 'unsafe-inline'` - Allow inline scripts (needed for Plyr player)
- `media-src https://media.twistoflemonpod.com` - Allow audio from S3 bucket
- `frame-ancestors 'none'` - Prevent clickjacking

### X-Content-Type-Options
Prevents MIME type sniffing.

```
X-Content-Type-Options: nosniff
```

### X-Frame-Options
Prevents clickjacking attacks.

```
X-Frame-Options: DENY
```

### X-XSS-Protection
Enables browser XSS protection.

```
X-XSS-Protection: 1; mode=block
```

### Referrer-Policy
Controls referrer information sent with requests.

```
Referrer-Policy: strict-origin-when-cross-origin
```

### Permissions-Policy
Controls browser features and APIs.

```
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
```

## Performance Headers

### Cache-Control
Optimize caching for static assets.

**For HTML files:**
```
Cache-Control: public, max-age=0, must-revalidate
```

**For CSS/JS files:**
```
Cache-Control: public, max-age=31536000, immutable
```

**For images:**
```
Cache-Control: public, max-age=31536000, immutable
```

**For audio files (on S3):**
```
Cache-Control: public, max-age=31536000
```

### Compression
Enable compression for text-based resources.

```
Content-Encoding: gzip
```
or
```
Content-Encoding: br
```

## Implementation by Platform

### GitHub Pages

GitHub Pages automatically sets some security headers but doesn't allow custom configuration. Consider using Cloudflare in front of GitHub Pages for full header control.

### Netlify

Create a `_headers` file in your build output (`_site/_headers`):

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https://media.twistoflemonpod.com; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.ico
  Cache-Control: public, max-age=31536000, immutable
```

To enable this, add to `.eleventy.js`:

```javascript
eleventyConfig.addPassthroughCopy({
  "static/_headers": "_headers"
});
```

And create `static/_headers` with the content above.

### Cloudflare

Configure Page Rules or use Cloudflare Workers to set custom headers:

1. Go to Cloudflare Dashboard
2. Select your domain
3. Navigate to Rules > Transform Rules > Modify Response Header
4. Add rules for each header listed above

### Vercel

Create a `vercel.json` file:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=(), payment=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https://media.twistoflemonpod.com; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        }
      ]
    }
  ]
}
```

## Testing Headers

Use these tools to verify headers are properly configured:

1. **Security Headers**: https://securityheaders.com/
2. **Mozilla Observatory**: https://observatory.mozilla.org/
3. **Browser DevTools**: Network tab shows response headers
4. **curl**: `curl -I https://twistoflemonpod.com`

## Expected Scores

With all headers properly configured:

- **Security Headers**: A+ rating
- **Mozilla Observatory**: A+ or A rating
- **Lighthouse Performance**: 90+ score

## Notes

- The `'unsafe-inline'` directive in CSP is needed for the Plyr audio player
- Consider using a CSP nonce or hash for inline scripts in production
- Update `media-src` if audio hosting location changes
- Review and update CSP directives if adding new third-party services
- Test thoroughly after implementing to ensure nothing breaks

## Related Files

- `robots.txt` - Search engine crawling rules
- `sitemap.xml` - Site structure for search engines
- `feed.xml` - RSS feed for podcast aggregators
- `src/_includes/partials/seo.liquid` - Meta tags for SEO

## References

- [MDN Web Docs - HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Content Security Policy Reference](https://content-security-policy.com/)
