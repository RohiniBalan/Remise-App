# Remise-App ↔ Web Parity Checklist

Living tracking doc for the mobile app's feature-parity build. Updated as work lands — do not delete completed items, mark them `[x]` so progress across sessions stays visible. Web source paths are relative to `Remise/Remise/client/`. See `C:\Users\ROHINI B\.claude\plans\logical-dreaming-lamport.md` for the original architecture plan (backend-mapping, theme tokens, storage keys, navigation shape).

Legend: `[x]` done and wired into navigation · `[~]` partially done / needs revisit · `[ ]` still a PlaceholderScreen.

## Infrastructure (done)
- [x] Theme tokens (`src/styles/theme.ts`) — Customer/Store Owner red-teal-mint palette, Gold palette (product/category/about/testimonials pages), Admin Crisp-Indigo palette
- [x] AsyncStorage wrapper mirroring localStorage keys (`token`, `user`, `cart`, `theme`, legacy `accessToken` cleanup)
- [x] API layer mirroring the web app's 3-backend split (`GATEWAY_URL`, `LEGACY_MONOLITH_URL`, `LEGACY_PRODUCT_URL`) — `src/api/endpoints.ts`, `src/api/client.ts`
- [x] AuthContext / CartContext ports (no DOM-event plumbing — see plan)
- [x] Navigation shell: role-gated Auth/Customer/StoreOwner/Admin stacks (`src/navigation/*`)
- [x] Admin nav rebuilt as a custom Animated slide-in menu (`src/screens/admin/AdminHeader.tsx`) instead of `@react-navigation/drawer`, because `react-native-reanimated` (a drawer dependency) failed to link natively on this Windows/NDK toolchain. Avoid reintroducing reanimated-dependent libraries.

## Auth (5 screens)
- [x] LoginRegisterScreen — `app/login/page.tsx`
- [x] GoogleAuthWebViewScreen — `app/auth/google-success/page.tsx` (WebView-interception variant)
- [x] VerifyEmailScreen — `app/verify-email/page.tsx`
- [x] VerifyEmailTokenScreen — `app/verify-email/[token]/page.tsx` (manual-code-entry variant, no browser URL bar on mobile)
- [ ] ChangePasswordScreen — `app/settings/page.tsx` SecurityTab (folded into Settings screen, not yet built)

## Customer (~14 screens)
- [x] HomeScreen — `app/(root)/page.tsx` (mobile-first redesign: quick-action grid to Categories/Bulk Purchase/Nearby/Orders + a real product preview from the same catalog endpoint, replacing the desktop's many marketing carousel sections — see file header comment)
- [x] CategoryScreen — `app/category/[categoryId]/page.tsx` (filters: category/brand/availability chips, price presets instead of a native slider, 3 sort modes; local wishlist, matches web)
- [x] ProductDetailScreen — `app/product/[productId]/page.tsx` (gallery, 4 tabs, qty stepper, add-to-cart/buy-now)
- [x] CartScreen — `components-main/CartDrawer.tsx` (qty +/-, remove, ₹499 free-delivery nudge, checkout)
- [x] Checkout — `app/checkout/page.tsx` (LEGACY_MONOLITH_URL). PhonePe's browser redirect becomes an in-app WebView (`PhonePeWebViewScreen`) that intercepts navigation to a sentinel return URL — same zero-backend-change pattern as GoogleAuthWebViewScreen. COD skips the WebView entirely (backend never actually redirects for COD, it returns the order id directly).
- [x] PaymentStatus — `app/payment-status/page.tsx` (LEGACY_MONOLITH_URL) — same 4 states, same behavior (cart is NOT cleared on success, matching web's commented-out line)
- [x] Orders (my-orders) — `app/orders/page.tsx` (LEGACY_MONOLITH_URL) — same flatten-per-item display, same +5-day estimated delivery, same status→UI mapping, same search + status filters (web's "Order Time" filter checkboxes are dead/unwired on web too, so intentionally not reproduced)
- [x] Settings (4 tabs: Account/Preferences/Security/Notifications) — `app/settings/page.tsx` — same real-vs-stub split as web (Account save + Security are real; Preferences/Notifications toggles are local-only, matching web's own no-op "Save" buttons). Reachable via Cart/Settings icons added to HomeScreen's header (web's persistent navbar equivalent).
- [x] BulkPurchase — `app/(root)/bulk-purchase/page.tsx`. Manual add/edit/check/delete/clear-all fully implemented. Scan Paper List button present but shows an explanatory alert (Next.js-only `/api/smart-bulk-scan` + `/api/tanglish-translate` routes have no known mobile-reachable base URL). Web's separate Copy + Print buttons became one "Share List" button (RN's built-in `Share` API) — same "get the list out of the app" outcome, zero new native deps.
- [x] CompareStoresFlow — `app/(root)/bulk-purchase/CompareModal.tsx`. Full step machine ported (radius→searching→results→confirming→delivery→payment→placing→success), same nearby-store/match-cart calls, same delivery (pickup/delivery) + payment (QR/cash) options, QR fetched via `storeApi.getById(chosen.storeId)` (never any other store's), optional screenshot upload via `react-native-image-picker`. Geolocation via `@react-native-community/geolocation` (added `ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION` to AndroidManifest.xml). Neither `cod` nor `qr` ever needs a WebView here (backend never actually redirects for either), unlike the main Checkout's `phonepe` path.
- [x] NearbyOffersScreen + OrderModal — `app/nearby/page.tsx` — same geolocation-driven search, radius presets, offer cards (discount/distance/hours-left), and OrderModal fields. "Enable Alerts" banner kept for parity of intent but explains push isn't available yet (see notifications note below) instead of silently vanishing or fake-subscribing.
- [x] In-app Notifications (bell + list) — `components-main/NotificationBell.tsx` — full screen instead of a navbar dropdown (`NotificationsScreen.tsx`), same list/mark-read/mark-all-read calls, `useUnreadNotifications` polls every 60s like web's `useNotifications.ts`. Bell icon + unread badge added to HomeScreen's header. Real OS push (VAPID/service worker on web) has no mobile equivalent without an FCM integration — not implemented, called out rather than silently faked.
- [x] AboutScreen — `app/about/page.tsx` (`ToyBlogLifestyle.tsx`) — same GET `/blog-lifestyle` content (featuredArticle/articles/timeline), reproduced as a vertical feed instead of the desktop parallax hero.
- [x] ServicesScreen + ContactModal — `app/services/page.tsx` + `ContactPage.tsx` — same Retail/Wholesale toggle + GET `/services` shape + default offer fallbacks; ContactModal is shared (also usable from other screens) and does the real GET `/contact` + POST `/contact/messages` calls.
- [x] TestimonialsScreen — `app/testimonials/page.tsx` — same GET `/enhanced-testimonials` shape (hero/spotlight/reviews).
- [x] StoreRegisterScreen — `app/store/register/page.tsx` — same fields, same lat/lng validity guard, same register-then-upgrade-role-via-fresh-token flow (feeds the new token into `AuthContext.login()`, which flips `AppNavigator`'s RoleGate to `StoreOwnerNavigator` automatically). Reachable from HomeScreen's "More" links row (web reaches these via NavbarHome's persistent nav links, which mobile doesn't have).

**Customer role: 100% of screens built.** Every Customer-role screen in the inventory above is now real (no PlaceholderScreen remaining under `CustomerNavigator`).

## Store Owner (9 screens) — 100% built
- [x] StoreRegisterScreen (built under Customer, see above — entry point before role flips to store_owner)
- [x] Overview tab (`StoreOverviewScreen.tsx`) — same 6 stat tiles, Recent Orders (top 5), Product Stock (top 4), verification-pending notice
- [x] Products tab + ProductForm (`StoreProductsScreen.tsx` + `StoreProductFormScreen.tsx`) — same search/category filter, same grid fields, same field set for add/edit (title/description/price/discountedPrice/category/brand/totalStock/availability/tags/image, extracted into shared `ProductFieldsForm` component + `buildProductFormData` helper in `src/utils/productForm.ts`). Both "Scan Paper" (single-product) and the new "Scan Grocery List" (bulk) buttons call Gemini directly from the app via `geminiScanApi.ts` (`GOOGLE_AI_API_KEY`, no mobile-reachable Next.js route exists for either) — single-scan prefills `ProductForm` as before; bulk-scan (`scanBulkProducts` + `buildGeneratedImageUrl`) opens the new `StoreBulkProductScanScreen.tsx`, a FlatList of editable cards (one `ProductFieldsForm` each) with per-card remove and an "Add All Products" loop over `storeProductApi.create()` that continues past individual failures and ends on a summary screen (X added / Y failed)
- [x] Categories tab (`StoreCategoriesScreen.tsx`) — same add form + list + the 3 distinct error messages (unreachable/403/generic)
- [x] Orders tab (`StoreOrdersScreen.tsx`) — same OfferOrder + smart-order merge, search/filter, delivery/payment chips, status-update restricted to OfferOrder-sourced orders only (matches web)
- [x] Offers tab (`StoreOffersScreen.tsx`) — same grid (discount badge, expired overlay, view/order counts), delete, "New Offer" entry point
- [x] Settings tab (`StoreSettingsScreen.tsx`) — same fields incl. the UPI-ID-generates-QR flow (web recently switched from QR-image-upload to this, see `services/store-service`)
- [x] NewOfferScreen (`NewOfferScreen.tsx`) — same fields, same offer/original price validation, same store-location/GPS/manual location-source tracking for notification targeting. OfferScanModal (`/api/smart-offer-scan`) same AI-scan caveat as above.

Shared infra added for this module: `StoreDashboardContext` (mirrors web's single `loadData()`/`refresh()` shared across all 6 dashboard tabs, since each tab is a separate navigator screen on mobile rather than a conditionally-rendered panel in one page component), `storeProductApi.ts` (the Store Owner's product/category CRUD — distinct from the read-only Customer-facing `productApi.ts`).

## Admin (19 screens) — 100% built
- [x] Dashboard (`AdminDashboardScreen.tsx`) — same mock data (recentOrders/topProducts/revenueData), ported as-is (not "fixed" into real data, matching web's actual no-API-calls behavior). Custom animated SVG chart replaced with a simple bar chart (same values, no charting library dependency).
- [x] Hero (`AdminHeroScreen.tsx`) — same fields (badgeText/title/titleGradient/description/primaryButtonText/secondaryButtonText), same carImages[] (max 10) + brands[] (name+src) add/remove, GET/PUT/`/reset` `/hero` (bare object). Live animated car-carousel preview omitted (no RN equivalent).
- [x] Characters (`AdminCharactersScreen.tsx`) — same fields (id/name*/color/src*), PUT wraps as `{ characters }`.
- [x] Best Sellers (`AdminBestSellersScreen.tsx`) — same fields (id/name*/img*/color), PUT wraps as `{ items }`.
- [x] Shop By Age (`AdminShopByAgeScreen.tsx`) — same fields (label*/sub*/img*/gradient/icon) + same 8/8 presets, PUT wraps as `{ items }`.
- [x] Shop By Category (`AdminShopByCategoryScreen.tsx`) — same fields (id-slug*/title*/description*/badge*/count*/icon/color-gradient/accent/img*) + same 8/6/6 presets + same id-slugification, PUT wraps as `{ items }`.
- [x] Bento Grid (`AdminBentoGridScreen.tsx`) — same fields (title*/subtitle*/className-size/icon/iconColor/color-hex/img*/isVideo) + same 9/9/4 presets, PUT wraps as `{ items }`.
- [x] Contact (`AdminContactScreen.tsx`) — same fields + a read-only Messages tab (GET `/contact/messages`, no delete/reply on web either), GET/PUT/`/reset` `/contact` (bare object).
- [x] Reviews (`AdminReviewsScreen.tsx`) — same shape (`{reviews:[{id,name,rating,text,date,avatar}], photos:[{id,url}]}`), same 2 sub-tabs (Testimonials/Gallery).
- [x] Services (`AdminServicesScreen.tsx`) — same nested tabs (Retail/Wholesale → Products/Offer Card), same per-mode product fields (retail: name/category/icon/price/rating/originalPrice/discount/stock/sales; wholesale swaps in moq/margin/delivery/orders), same offer-card fields (badgeText/discountPercentage/title/description/perk1-3/buttonText/terms).
- [x] Blog & Lifestyle (`AdminBlogLifestyleScreen.tsx`) — same 4 sub-tabs (Featured/Articles/Timeline/Testimonials), same featuredArticle.stats sub-object, same 4 icon presets for articles.
- [x] Testimonials (`AdminTestimonialsScreen.tsx`) — same 2 sub-tabs (Marquee Reviews/Page Settings), same hero/spotlight/cta field groups.
- [x] Hot Drops (`AdminHotDropsScreen.tsx`) — real per-video CRUD (`POST`/`PUT`/`DELETE /trending[/:id]`) + separate config object (`PUT /trending/config/update`, `POST /trending/config/reset`) + index-swap reorder (`POST /trending/reorder` with the two swapped `{id,order}` pairs, matching web's `handleReorder` exactly — not a generic resave-everything approach). Same 8 category presets.
- [x] Studio (`AdminStudioScreen.tsx`) — same shape as Hot Drops (video CRUD + config + reorder) against `/studio/*` instead of `/trending/*`, with Studio's own distinct fields (videoId auto-incremented as max+1 exactly like web, description, color hex, rating, 5 category presets) and config's extra `autoCycleDuration`/`theme`/`highlightText`.
- [x] Ralleyz (`AdminRalleyzScreen.tsx`) — same fields (title*/subtitle*/location*/description*/bg), same client-side up/down reorder saved as part of the whole-array PUT (no separate reorder endpoint here, unlike Hot Drops/Studio), and the **only** admin content page with a real image upload on web — reproduced with `react-native-image-picker` → `POST /ralleyz/upload` (multipart field `image`) → response `imageUrl` written into that item's `bg`.

**All 19 Admin screens are now real** (no `PlaceholderScreen` remaining under `AdminNavigator`). Live-preview panes (web renders the actual production section component inline next to the edit form) have no direct RN equivalent and were omitted everywhere per the plan — this is the one consistent, deliberate visual simplification across all 14 content-editor pages, not a missed feature.

New shared infra for this batch: `src/api/adminContentApi.ts` (GET is always bare array/object at `res.data.data` across all 14 sections — verified per-page; PUT differs: object-shaped sections send bare, array-shaped sections wrap under a page-specific key — `{characters}`, `{items}`, etc. — reproduced exactly per section, not assumed uniform; Hot Drops/Studio get their own real-CRUD API blocks instead of the generic `section()` helper), `src/hooks/useAdminContent.ts` (shared fetch/save/reset state machine — every one of the 14 pages independently duplicates this exact logic on web; consolidated once here), `src/components/admin/{AdminContentLayout,AdminField,AdminArrayCard}.tsx` (shared chrome: status banner + Save/Reset footer, a labeled TextInput, and an up/down/delete card wrapper for the array-based pages — reproduces web's own reorder-by-index-swap, no drag-drop there either).
- [x] Product (`AdminProductScreen.tsx`) — full CRUD, every field (title/brand/price/originalPrice/badge/type/category/images/description/aboutFeatures/aboutDescription/specifications/idealFor/totalStock/deliveryTime), 3 repeatable array fields represented as line-separated text areas instead of web's dynamic add/remove rows. AI Smart Scan (`/api/smart-product-upload`) has no mobile-reachable route — same caveat as all other AI-scan features.
- [x] Order History (`AdminOrderHistoryScreen.tsx`) — search + per-order status chips + detail modal, GET `/admin/orders` + PUT `/admin/orders/:id/status`.
- [x] Users (`AdminUsersScreen.tsx`) — read-only directory, search, role badge (admin=purple+shield).
- [x] Dynamic Content (`AdminDynamicContentScreen.tsx`) — categories manager, GET/POST/DELETE `/admin/categories`.

New shared infra: `src/api/adminApi.ts` (adminOrderApi/adminUserApi/adminCategoryApi/adminProductApi, all `LEGACY_PRODUCT_URL`).

### All 45 screens across all 3 roles are now built and wired into navigation. `npx tsc --noEmit` passes clean (exit 0).

### Manual testing still required (not yet run against live backends this session)
- Every admin content page's Save/Reset round-trip against the real `wow-lifebackend.onrender.com` backend (typechecking confirms the code compiles, not that each endpoint/response shape assumption is 100% correct at runtime — several were verified by reading web source directly, but end-to-end network testing hasn't been performed).
- Hot Drops/Studio reorder (verify the swapped `{id,order}` pairs actually persist in the right order after a real API round-trip).
- Ralleyz image upload end-to-end (picker → multipart POST → `imageUrl` written back → visible after Save).
- The 3 admin auth-guard styles noted in the original web audit (read-only-banner-not-redirect vs. explicit-redirect-on-401 vs. no-guard-at-all for Dashboard) were not re-implemented as distinct behaviors on mobile — every Admin screen here assumes the user already has a valid admin token (enforced once at `AppNavigator`'s RoleGate), which is simpler than web's inconsistent per-page handling but should be confirmed as acceptable.
- Full Android emulator run-through of a few representative flows per role (Customer checkout, Store Owner product CRUD, Admin content save) — everything so far has only been verified via `tsc`, not an actual running app.

### Known platform-specific differences (unavoidable, not bugs)
- Live-preview panes on all 14 Admin content pages (web renders the real production section component inline) — omitted; no RN equivalent without duplicating the entire customer-facing rendering stack for marketing content.
- AI paper/product/offer-scan features (Bulk-Purchase, Store Products, Store New Offer, Admin Product) — Next.js-only server routes with no mobile-reachable base URL; manual paths fully implemented, buttons show an explanatory alert instead.
- Real OS push notifications — web's VAPID/service-worker push has no native equivalent without an FCM integration; in-app notification list/bell (poll-based) implemented instead.
- PhonePe/Google OAuth browser redirects — reimplemented as in-app WebView navigation-interception instead of a real `window.location` redirect (zero backend changes either way).
- Web's Copy+Print (Bulk-Purchase) — became one native Share-sheet button.
- Several array-editor pages use a plain hex-text field instead of web's color-picker-plus-swatch-presets widget (same stored value).

## Known backend/behavioral notes carried over from web (not bugs — intentional parity)
- Web itself calls 3 different backends inconsistently depending on the page; mobile mirrors this exactly (see `src/api/endpoints.ts`).
- Web's Category/Product pages fetch the *entire* product catalog and filter/find client-side — no dedicated `/products/:id` or filtered-list endpoint is actually used by those two pages, so mobile does the same rather than "fixing" it.
- Wishlist is local component state only on web (never persisted) — mobile matches, not a bug.
- Settings' Preferences/Notifications tabs and the Account tab's profile edit are client-only stubs on web (no backend call) — mobile must not invent a backend contract that doesn't exist.
- Push notifications: web uses browser VAPID Web Push, which has no native-app equivalent without a backend change (out of scope) — mobile implements the in-app notification list/bell only (poll-based), not real OS background push.
- Bulk-Purchase and Store-Owner "Scan Paper" AI features hit Next.js-only server routes (`/api/smart-bulk-scan`, `/api/smart-offer-scan`, `/api/smart-product-upload`, `/api/tanglish-translate`) that have no mobile-reachable equivalent — the manual (non-scan) paths are fully implemented, the scan buttons are visibly present but disabled with a short explanatory note rather than silently omitted.
