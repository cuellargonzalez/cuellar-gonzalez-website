# FNA landing

- `/fna` serves `fna.html` through a 200 rewrite in `_redirects`; `/fna/` redirects to `/fna`. Existing root and vivienda rules are unchanged. Query strings are not replaced.
- `fna.html` reuses the existing dialog markup verbatim and loads `script.js` once. Keep the dialog markup synchronized if the shared form is edited later. No fetch-based form injection or separate submission implementation is introduced.
- `style.css` and `index.html` are unchanged. `fna.css` supplies only FNA composition. Existing fonts, icons, images, contact details, privacy PDF, GA4 ID and Apps Script endpoint are reused.
- `Assets/Images/FNA asesoria.jpg` is the original advisory image extracted from the supplied Figma archive. PNG references define the layout; the binary canvas was not decoded. Minor text wrapping and image cropping may differ. The existing production portrait and legal/contact details take precedence. Mobile uses its reference CTA label and omits the journey subtitle, as shown in the reference.

## Backend follow-up

The existing JSON POST now includes optional `landing_source`, derived from the pathname: `fna` on `/fna`, `/fna/` or direct `/fna.html`; otherwise `vivienda`. Existing fields, UTMs, content type, endpoint and success validation are unchanged. There is no source-specific success requirement or automatic retry that could duplicate a lead.

The Apps Script source is not in this repository. Acceptance/storage of an extra JSON property cannot be confirmed without reviewing it. A conventional handler that reads named properties will ignore the extra property until updated; check for strict payload validation before publishing.

To store the field, add a **Landing** column at the end of the existing Sheet (preserving current column positions). In the Apps Script `doPost(e)` handler, immediately after parsing `e.postData.contents`, read `data.landing_source` (use the handler's actual parsed-object variable). In the existing `appendRow(...)` array or `setValues(...)` row, append that value in the position corresponding to Landing. If the handler builds rows by header name, map Landing to `data.landing_source`. Accept only `fna` or `vivienda`, and allow a blank fallback for older clients. If strict payload validation exists, allow this optional property. Preserve all other fields and the existing `{success: true}` response. Publish an updated version of the existing Apps Script deployment, retaining its current URL.

## Validation and release checks

Static checks verify identical dialog markup, unique IDs, existing asset paths, and an unchanged vivienda HTML/shared stylesheet. Headless Chrome checks use a local server that emulates the redirect rules, blocks analytics requests and mocks submissions; they do not validate Cloudflare itself or the production endpoint.

Before committing, review both pages visually at desktop and mobile widths, keyboard navigation and privacy-PDF opening. On a Cloudflare preview, verify `/`, `/vivienda`, `/vivienda/`, `/fna`, `/fna/` and FNA URLs with UTMs. Review the Apps Script handler before publishing; then, when appropriate, make one authorized end-to-end submission and confirm the Sheet row and GA4 event. No production leads were sent during implementation. No commit, push or deployment was performed.
