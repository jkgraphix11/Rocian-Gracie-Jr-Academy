# Membership plan finder — review draft

Pricing configuration: `window.RGJ_PRICING` at the beginning of `dist/script.js`.
Quote rules: `window.RGJQuote` immediately after the catalog.
The bilingual homepage and memberships routes share `src/memberships.py`.

## Assumptions awaiting owner approval
- Jiu-Jitsu and Judo share an attendance allowance; selected discipline records interest.
- Families choose one shared program, 2–4 members, 4+ classes each weekly.
- Family totals: 2,000 / 2,700 / 3,200 MXN monthly.
- Kickboxing, Boxing and Self-defense provisionally use the martial-arts individual and family prices.
- Yoga allows two weekly classes, 888 MXN per person. Family Yoga is priced per person without a discount.
- Drop-in eligibility needs confirmation.

Quote-specific notes disclose these assumptions; the top proposal banner was removed at user request.
The paid-plan CTA prepares a WhatsApp inquiry, without sending it. Family enrollment, billing and bookings are not implemented.
The free-trial CTA opens existing demo enrollment.
Shared URLs contain only membership choices, not personal information, and recalculate using current catalog prices (not locked quotes).

## Verification
- Automated pricing tests cover known prices, family totals, fixed family frequency, Yoga pricing, provisional disciplines and invalid URL values.
- Existing eight-route, link and enrollment checks pass.
- Browser: three-person family Jiu-Jitsu totals 2,700 / 900 per person; copied link restores selections.
- 390px iframe: no horizontal overflow; family Yoga displays 1,776 total for two members.
- Spanish Boxing shows 1,000 at three classes and the provisional-rate notice.


## Shared martial arts membership update
Planner categories are Martial Arts and Yoga. All old discipline quote URLs normalize to Martial Arts. Individual weekly sessions cost 800 / 1000 / 1200 MXN for 2 / 3 / 4+. Family totals remain 2000 / 2700 / 3200 for 2 / 3 / 4 members, with explicitly provisional 4+ sessions per person. Cross-training across Jiu-Jitsu, Judo, Kickboxing, Boxing and Self-defense remains pending academy confirmation. Yoga is 888 MXN per person; attendance is fixed at two sessions per week, confirmed by the owner; its frequency selector is hidden. Family Yoga assumes no discount pending confirmation. Onboarding now collects one or more class interests independently from pricing; selections stay in memory and appear in review.
