# Verification — October 30, 2026

- `npm run check` passes: eight routes, internal links, language alternates, unique IDs, disabled integration flags, JS syntax, age boundaries including exact eighteenth birthday and leap dates, malformed/future dates, normalized signature name matching and no enrollment browser storage/network submission.
- Cloud-browser desktop: completed minor/free-intro flow with synthetic data; guardian section appeared; child-name signature rejected; guardian signature accepted; review and honest non-submitted confirmation verified.
- 390px-wide iframe viewport: inspected mobile design; completed adult/monthly path through Spanish review; guardian section absent; Stripe checkout disabled. Switched EN → ES → EN; data retained and signature/acknowledgements reset. This is responsive viewport QA, not physical-device testing.
- Portable single HTML: clicked homepage trial CTA into enrollment successfully; no external font/image/style dependencies.
- Schema is design only, not migrated or tested against PostgreSQL. Backend/Stripe/archive acceptance tests are listed in ENROLLMENT-ARCHITECTURE.md and are not claimed to pass.
- No production deployment performed.

![Enrollment preview](enrollment-preview.jpg)

## Latest guardian/waiver revision

Browser checks: DOB reveals required guardian inputs on student page; adult DOB removes them; missing guardian data blocks Continue. Yoga survives to review. Spanish/English switch retains details. Minor participant and guardian demo signatures reach review with academy signature pending. All student/guardian inputs expose required=true. Extracted active waiver matches every source word and signature label after whitespace normalization.

## Dark input refinement — 2026-10-31
Adapted label, hint, focus and invalid-state patterns from https://www.untitledui.com/react/components/inputs to Archivo and academy lime. Native required semantics retained with bilingual inline validation, error descriptions and focus on the first invalid field. Browser verified blank submission (six errors), correction clears errors, invalid email, automatic guardian insertion, and guardian minimum age. Existing route, age, signature and demo-only checks passed.

## Dropdown refinement — 2026-10-31
Adapted Untitled UI dropdown/select styling to a select-only combobox backed by the existing native form value. Dark scrollable popover, selected checkmark, hover/active states, required/error descriptions, typeahead, arrows, Home/End, Enter/Space, Escape, Tab and outside-pointer dismissal. Browser checks passed: required error clears on Yoga selection; Escape preserves selection; click selects trial; 16 options fit 390px mobile viewport; Yoga survives Spanish switch. References: https://www.untitledui.com/react/components/dropdowns and /react/components/select.

## Contact hover contrast — 2026-10-31
Removed white hover foreground/border on lime contact section. Phone text, SVG and underline remain black (#000 on #C7FF2E: 17.77:1 calculated contrast). Hover thickens underline and offsets arrow; reduced motion suppresses offset. All links in lime section receive black keyboard outlines. Browser confirmed black text/SVG and 3px focus outline. Updated source CSS, compiled CSS and standalone export; existing checks passed.

## Language switch states — October 30, 2026 (Tijuana)
Lime hover/focus text and globe, plus 2px label underline as a non-color cue. Keyboard focus adds a 2px lime outline. Existing descriptive language labels and 44×44px target retained. Browser verified underline, focus outline and target dimensions; route checks passed.

## Navigation underline — October 30, 2026 (Tijuana)
Added 2px lime underline with 8px offset to all desktop navigation links on hover and keyboard focus. No layout shift; existing focus outline preserved. Browser verified computed underline color, thickness and offset. Existing checks passed.

## Header CTA motion — October 30, 2026 (Tijuana)
Header trial button now shares the existing .button hover rule: white background and translateY(-2px), using the same 0.2s transform transition. Both suppress hover translation when reduced motion is requested. Source and compiled CSS updated; standalone rebuilt; checks passed.

## Contact navigation — October 30, 2026 (Tijuana)
Removed top borders from contact section header and bottom text row. Added Contact/Contacto to shared desktop/mobile navigation on all eight routes, linking to the matching language homepage #visitanos. Enrollment language switch translates new link. Anchor has sticky-header clearance. Browser click reached #visitanos; both borders compute to 0px; mobile link present. Existing checks passed.

## Navigation underline motion — October 30, 2026 (Tijuana)
Replaced instant text underline with a 2px pseudo-element scaled from its left edge over 250ms, with ease-out timing. Hover and keyboard focus reveal the line without layout movement. Reduced-motion preference disables the transition. Existing checks passed.

## Waiver navigation hierarchy — October 30, 2026 (Tijuana)
Removed Waiver/Responsiva from primary links. Added outlined Fill out waiver/Llenar responsiva between locale and trial CTA; mobile menu exposes outlined utility action. /waiver/ now enters a dedicated four-step preview: student, contacts, waiver, done. Retains guardian rules and acknowledgements; skips membership choice and checkout. Browser completed adult sample flow to PREVIEW COMPLETE; mobile utility reaches student step; Spanish switch retains waiver-specific heading. No live submission or records enabled.

## Training schedule revision — 2026-10-31

- Added Coach / Instructor as the fourth column in both languages; retained all 16 classes, days, times, and previously named instructors.
- Assigned Marco to both Kickboxing / Boxing entries and Grecia Uref to Yoga. Unassigned entries show an em dash. Instructor names opt out of automatic browser translation.
- Combined class type and audience/level using `Jiu-Jitsu / Kids: Intermediate` and `Jiu-Jitsu / Kids: Beginners`, with Spanish equivalents.
- Matched schedule body cells to the prior class-type size: Archivo 25px desktop and 14px mobile. At widths up to 960px, rows stack into labeled cards.
- Passed the existing build and complete check command, plus bilingual schedule structure/content assertions and `git diff --check`.
- Browser QA: equal computed cell sizes; no horizontal overflow at 320px, 390px, and 1024px. Filter counts: all 16, kids 6, teens/adults 7, yoga 1, open mat 2.
- Visual evidence: `schedule-desktop-preview.png` and `schedule-mobile-preview.png`.
- Rebuilt the standalone HTML preview. No source push or deployment performed; deployment requires user approval.
