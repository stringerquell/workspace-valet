# Workspace Valet — Landing Page

One-page validation site for Workspace Valet (premium workstation detailing, Baltimore).
Static site: `index.html` + `styles.css` + `script.js` + `assets/`. No build step.

**Spec:** `QS Studio/Strategy/Workspace Valet/workspace-valet-one-page-design-spec-v2.md`
**Copy:** `QS Studio/Strategy/Workspace Valet/Luxury Laptop Detail Landing Page.md` (Revised v4)

## Preview locally
```
cd ~/workspace-valet && python3 -m http.server 8931
# open http://localhost:8931
```

## Deploy
Static — deploys straight to Vercel: `vercel --prod` from this folder (same flow as marble-cut).

## Before going live — open items
1. **Stripe deposit link — LIVE and wired in** (7/16/26): https://book.stripe.com/14A28r5QF44695HgMf5J60R
   - $100 deposit, LIVE mode, on the Green Book Digital Stripe account (brand mismatch accepted for validation)
   - Collects at checkout: email, name, phone, company name, workstation count
   - Auto-deactivates after 4 completed payments (founding-slot limit built in)
   - Statement suffix: WKSPC VALET
   - Post-payment: hosted confirmation promising a booking link "within the hour" —
     Q sends the Calendly link manually until we switch after_completion to a redirect.
     When Q provides the Calendly event URL, update the payment link (plink_1Ttz0RFK4WD5JMRU8a6w6cNm)
     to after_completion.type=redirect.
   - Balance over 20 workstations: send a Stripe invoice after the visit (count captured at checkout).
2. **Email** — `hello@workspacevalet.com` is a placeholder in `script.js` (`BOOKING_EMAIL`) and the footer.
   Requires registering workspacevalet.com (confirmed available 7/16/26) and setting up mail forwarding.
3. **Trust claims** — "background-checked / NDA-bound" language was kept OFF the page per spec §7
   until operationally true. The trust section lists only protocol commitments that are true on day one.
4. **About Q photo** — using `q_blk+suit_edit.png`. Swap when launch photography exists.

## Design system (v3 — strict achromatic, 7/16/26)
- Fonts: Hanken Grotesk (Google Fonts) — free stand-in for Humanscale's PP Neue Montreal
- Interface palette: neutral only. #0A0A0A dark sections/primary buttons, #1C1C1C body,
  #666666 eyebrows on white, #9A9A9A labels on black, #D4D4D4 borders, #F1F1F1 soft gray,
  #F8F8F6 off-white, #FFFFFF base. No blue, green, or beige undertones anywhere in UI.
- ALL color comes from the photography (original ungraded assets restored — warm oak,
  greenery, persimmon notebook are intentional and provide the page's only color).
- Three dark sections: Ownership Gap, Founding Offer, Final CTA (dramatic black close).
- Buttons: black on light sections (hover #303030); white reversal inside black sections
  (hover #E8E8E8); submit inside the white offer card is absolute #000000.
- Pricing calculator: $375 ≤ 20 workstations, +$25/each after, in the offer panel

## Verified 7/16/26
- Desktop 1440px: full page renders per spec, headless Chrome screenshots
- 500px width: single column, correct wrapping (Chrome headless can't render <500px layout; CSS uses standard responsive grid + min-width:0 guards)
- Reduced-motion + Save-Data: video autoplay disabled, reveals/marquee static
