# Rangabazar.com

Static storefront landing page for Rangabazar.com (HTML5, CSS3, vanilla JavaScript). No build step, no dependencies.

## Structure

- `index.html` is the homepage; `privacy.html`, `terms.html`, `returns.html` and `404.html` are the other pages.
- `assets/css/style.css` holds all styling and design tokens (see `:root`).
- `assets/js/main.js` handles the wishlist, search, category filter and newsletter form.
- `assets/logo.png` is your logo with a transparent background (not redrawn). `assets/hero-clean.jpg`, `banner.jpg` and `story.jpg` are cropped from your cover image.
- `assets/products/rangamati/` contains the supplied custom wooden shelving and storage photos.
- `CNAME` (rangabazar.com), `.nojekyll`, `robots.txt`, `sitemap.xml` are ready for GitHub Pages.

## Publish on GitHub Pages

1. Upload everything in this folder to the root of your repository (replace the old files).
2. Settings, Pages: deploy from branch `main`, folder `/ (root)`.
3. Keep the custom domain set to `rangabazar.com` and enable "Enforce HTTPS".

## Before you go live

1. **Products:** edit names, descriptions and photos in the product cards in `index.html`. Products are custom-made and prices are provided on request through the Facebook page.
2. **Ratings:** only show star ratings that come from real customer reviews. Delete the `<span class="rate">` element in a card to hide it.
3. **Orders:** product links open `https://www.facebook.com/rangabazarofficial` so customers can ask about prices and place custom orders. There is no cart or payment processing.
4. **Newsletter:** set `NEWSLETTER_ENDPOINT` in `assets/js/main.js` to a form service URL (Formspree, Getform, Brevo and similar). Until then the form says signup is not switched on.
5. **Social links:** the Facebook and Instagram links assume `facebook.com/rangabazarofficial` and `instagram.com/rangabazarofficial`. Check they open the right pages.
6. **Contact details:** no phone number or email is on the site because none was supplied. Add them in the footer in `index.html`.
7. **Policies:** the privacy, terms and returns pages are drafts. Review them against your real practices.
8. **Fonts:** Anek Bangla and Hind Siliguri load from Google Fonts. The page falls back to system Bengali fonts if they cannot load.
