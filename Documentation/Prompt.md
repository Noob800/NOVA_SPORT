NOVASPORT — MASTER PRODUCT DESIGN & ARCHITECTURE PROMPT V1.0

Act as a senior product designer, brand identity designer, frontend architect, and full-stack engineer responsible for building NovaSport, a premium, mobile-first football platform that functions as an installable Progressive Web App (PWA) and delivers a native-app-like experience. NovaSport is the digital home of football competitions, teams, players, supporters, and administrators. Its first live competition will be KeMU Super League Season 8 (2026/27), but the platform must be architected from day one to support future Freshers competitions, university leagues, campus tournaments, and other football competitions without redesigning or rebuilding the core system. Do not treat NovaSport as a conventional informational website. Build it as a fast, dependable, engaging football product whose interface, interactions, and technical architecture work together as one coherent experience.

1. BRAND IDENTITY AND DESIGN DIRECTION

Establish a distinctive, premium and energetic visual identity for NovaSport. The core brand personality is modern, competitive, confident, precise, youthful, and professional. The brand concept is “More Than Football.” The experience should combine the intensity of football culture with the clarity and reliability of a high-quality digital product. Avoid generic sports templates, excessive gradients, unnecessary animations, conventional football clip-art, oversized rounded cards, and visually noisy layouts.

Use the following initial brand tokens: Nova Orange #ff5e00ff as the primary brand accent; Pitch Black #101113 as the primary dark background; Stadium White #F5F5F2 for primary text and light surfaces; and Steel Grey #777B80 for supporting elements where contrast remains accessible. Establish additional semantic tokens for elevated surfaces, borders, muted text, focus indicators, success, warning, and error states. Use orange purposefully for primary actions, selected navigation, live-match indicators, important highlights, and brand recognition rather than applying it indiscriminately. Design dark-first, but establish a consistent light theme as an optional extension.

Use Barlow Condensed Bold or ExtraBold for display headlines, major competition titles, and editorial campaign statements. Use Inter for body text, navigation, forms, labels, and everyday interface content. Use consistent tabular numerals for scores, minutes, and standings. Create a coherent type scale, spacing scale, border-radius system, icon system, and responsive layout system. Develop a distinctive NovaSport N-symbol concept for the app icon and compact brand placements, while keeping the logo system replaceable with approved vector assets. Do not invent a finished logo asset and treat it as an approved final brand mark.

The visual language should combine clean editorial layouts, high-contrast typography, controlled angular graphics, and purposeful football photography. The identity must work equally well on a mobile screen, desktop dashboard, match graphic, official announcement, and future competition branding. Prioritize readability and functional clarity over decorative effects.

2. PRODUCT EXPERIENCE AND INFORMATION ARCHITECTURE

Design NovaSport as a cohesive football experience rather than a set of disconnected pages. The public experience should include a personalized football home, competitions, teams, players, fixtures, results, standings, statistics, news and official announcements, rules and regulations, and information about NovaSport and NSFC. Organize these capabilities into a compact mobile navigation system that prioritizes the most frequently used actions. Do not attempt to place every destination in the primary navigation. Use contextual competition navigation, secondary menus, and logical page hierarchies.

The home screen should operate as a live football dashboard. Surface relevant matches, today's fixtures, upcoming games, recent verified results, competition standings, followed teams when that feature is enabled, and official announcements. Adapt content to the competition calendar and match state. When a match is live, make its status and score easy to discover. After full-time, guide users towards the verified result, match events when available, and the match report. Before a competition begins, emphasize upcoming fixtures, competition information, team announcements, and relevant updates.

Every competition should have a reusable hub with overview, fixtures, results, league table, teams, players, statistics, rules, and announcements. Its season and competition identity must be driven by backend data, not hard-coded page content. Use reusable page templates and components so adding a competition or season does not require duplicating the application.

3. NATIVE-APP-LIKE PWA EXPERIENCE

Build a genuine installable Progressive Web App with a valid web app manifest, appropriate application icons, service worker, secure-context requirements, and a reliable application shell. Design mobile-first for Android phones, then adapt elegantly to tablets and desktops. The installed application should provide persistent navigation, fast transitions, responsive interactions, and a coherent app-like experience without pretending to be a native Android binary.

Implement an offline-first reading strategy from day one. Cache the application shell and static assets, and persist useful previously fetched data such as fixtures, results, standings, competition details, and rules in IndexedDB. Use a suitable library such as Workbox for service-worker lifecycle and caching strategies, and a lightweight persistence solution such as Dexie when it improves IndexedDB management. Select compatible libraries only after inspecting the existing project and avoid unnecessary dependencies.

Use network-first or revalidation-based strategies for frequently changing competition information, with carefully chosen fallbacks to the most recently cached data. Use cache-first strategies for versioned static assets. Display a clear offline indicator and last-updated timestamp whenever data may be stale. Never present cached match information as live or imply that an offline action has been confirmed by the server.

Read-only pages should remain useful when connectivity is unavailable. If offline interactions such as following a team or saving a preference are introduced, persist eligible actions locally and reconcile them safely when connectivity returns. Do not queue official result publication, disciplinary decisions, match verification, or other sensitive administrative mutations for automatic replay without an explicit, secure conflict-resolution and authorization design. Authentication tokens and sensitive personal information must not be exposed through caches or local storage.

Optimize the initial application load, route transitions, images, fonts, and JavaScript bundles. Lazy-load nonessential modules, use responsive and compressed imagery, minimize layout shifts, and avoid heavy animation. Establish measurable performance targets and test on realistic mobile devices and constrained network conditions.

4. TECHNICAL ARCHITECTURE

Use React with TypeScript for the frontend. Use a serverless deployment model for the application and backend operations, with Supabase as the backend platform. The application should be deployable to a suitable serverless frontend host while using Supabase for PostgreSQL, authentication, storage, and realtime capabilities where appropriate. Keep the architecture modular so it can scale from the initial competition to multiple competitions and growing traffic.

Separate presentation components, page-level composition, domain logic, data-access modules, validation schemas, and server-side operations. Organize the project by meaningful product domains such as competitions, seasons, teams, players, fixtures, matches, standings, announcements, and administration. Avoid placing business rules directly inside UI components. Create typed interfaces and clear service boundaries so backend implementation details can evolve without requiring a frontend rewrite.

Use Supabase migrations and version-controlled schema definitions. Design relational tables and constraints around competitions, seasons, team registrations, players, fixtures, matches, match events, verified results, rules, announcements, users, roles, and audit records. Teams and players must be reusable across seasons where appropriate, while season-specific participation and statistics must be represented explicitly. Avoid duplicating the same authoritative information across multiple unrelated records.

Use Supabase Row Level Security (RLS) for database access control, server-side authorization for privileged operations, and secure environment-variable handling. Never expose the Supabase service-role key or other privileged secrets in frontend code. Validate all sensitive mutations on trusted server-side boundaries. Public users should only be able to access data intentionally published for public viewing. Administrative actions must be permission-checked and recorded in an audit trail.

Use database constraints, transactions, and appropriate database functions for critical operations such as result verification and publication, where necessary. Do not trust the frontend to calculate authoritative standings or enforce competition permissions. Define one authoritative backend process for calculating standings from verified results and make tie-break rules configurable per competition. Use Supabase Realtime selectively for live scores and important updates, with a fallback to periodic revalidation or controlled polling when realtime is unavailable. Realtime events must never bypass authorization or become the permanent source of truth.

5. CORE DATA AND COMPETITION RULES

Model NovaSport as a platform, NSFC as its governing and administration body, competitions as reusable entities, seasons as editions of competitions, and teams as participants within seasons. Model players independently from their season registrations. Represent fixtures, venues, kickoff times, match status, results, and match events as structured data rather than embedding them only in text fields.

The standings engine should support played, won, drawn, lost, goals for, goals against, goal difference, and points. Tie-break ordering must be configurable per competition and season according to its official rules. Only results that have passed the required verification and publication workflow should affect official standings and statistics.

Design the schema to accommodate goals, cards, substitutions, appearances, clean sheets, top scorers, goalkeeper awards, postponement requests, disciplinary records, official announcements, competition documents, and match reports as these capabilities are introduced. Distinguish planned functionality from implemented functionality; do not create fake live scores, invented match data, or nonfunctional controls merely to make the interface appear complete.

6. NSFC ADMINISTRATION EXPERIENCE

Build the administrative experience as an operational control centre rather than a collection of generic CRUD tables. Authorized users should be able to see upcoming fixtures, results awaiting verification, postponement requests, incomplete records, and recent administrative activity. Provide workflows for creating competitions and seasons, registering teams and players, scheduling fixtures, assigning venues and officials, recording match information, verifying and publishing results, managing announcements, maintaining disciplinary records, and reviewing audit history.

Implement role-based permissions for Super Admin, NSFC or League Admin, Match Official, Media or Content Team, and Team Official. Treat these as permission profiles that can be scoped to particular competitions or seasons where appropriate. A Match Official must not automatically receive platform-wide administration rights, and a Team Official must not be able to alter official results or disciplinary decisions. Enforce every permission on the server as well as in the interface.

Critical changes should record the actor, action, timestamp, affected record, and relevant before-and-after values where appropriate. Require clear confirmation for sensitive operations and make publication status explicit. Separate development, testing, and production environments, and establish backups, recovery procedures, error logging, and monitoring.

7. DESIGN SYSTEM AND COMPONENTS

Build a reusable NovaSport component system before expanding the entire product. Start with the application shell, navigation, typography, buttons, form controls, competition headers, match cards, score displays, fixture lists, league tables, team identity blocks, player cards, announcement items, status indicators, loading states, empty states, error states, offline banners, dialogs, and administrative data tables.

Components should have consistent spacing, interaction states, responsive behavior, keyboard accessibility, and semantic markup. Use Lucide icons consistently and avoid mixing unrelated icon styles. Establish clear rules for cards, dividers, buttons, active states, focus rings, badges, and typography. Do not introduce a new visual treatment for every screen. Reuse the design system while allowing appropriate variation between public pages and administrative tools.

Use realistic but clearly identified development fixtures and sample teams when needed to evaluate layouts. Keep sample data separate from production data and never present fictional records as verified official competition information.

8. ACCESSIBILITY, SECURITY, AND QUALITY

Target WCAG 2.2 AA accessibility practices where applicable. Ensure readable contrast, keyboard navigation, accessible labels, visible focus states, touch-friendly controls, and reduced-motion support. Statuses must be communicated through text and other cues, not color alone.

Validate inputs, handle expired sessions, protect privileged operations, and avoid exposing sensitive information in browser logs, URLs, client-side bundles, or public database queries. Implement clear error messages and reliable recovery behavior. Test the application under slow connections, interrupted requests, offline reloads, stale cached data, concurrent administrative updates, and invalid permissions.

Use automated checks for TypeScript, linting, formatting, component behavior, critical domain logic, access-control rules, and production builds. Add tests for standings calculations, result verification, season scoping, offline fallbacks, and authorization boundaries. Do not declare the product production-ready until the core workflows and security rules have been tested.

9. IMPLEMENTATION STRATEGY

Work progressively. First inspect the existing repository, identify its current framework, dependencies, structure, and constraints, and preserve useful existing code. Do not overwrite a working project or install a new stack blindly. Then establish the brand tokens, typography, app shell, navigation, routing, responsive layouts, and reusable components. Build the public home screen and a representative competition hub before expanding into every screen.

Next establish the Supabase schema, migrations, authentication, authorization, and data-access layer. Connect the public experience to real backend data, then implement administrative workflows and the verified-results-to-standings pipeline. Add PWA installation, offline data persistence, stale-data indicators, and synchronization behavior early enough that offline support is part of the architecture rather than a last-minute addition. Introduce realtime match updates and more advanced player statistics only after the underlying data and permission models are reliable.

Use clear milestones, document architectural decisions, keep changes small and reviewable, and maintain version control. Before implementing large features, identify their purpose, dependencies, acceptance criteria, and security implications. Do not build every possible future feature into V1, but ensure that the underlying architecture does not prevent them from being added later.

10. REQUIRED FIRST DELIVERABLE

Begin by returning a concise repository assessment, proposed architecture, recommended dependency choices, route and screen map, component plan, initial database entity relationships, offline data strategy, security boundaries, and a phased implementation plan. Identify any decisions that genuinely require clarification. Then implement the foundational brand system and responsive PWA shell in the existing project, with working navigation and a high-quality representative public home screen. Keep the code production-oriented, accessible, modular, and consistent with the NovaSport identity.

The final product must feel like a carefully curated football platform, not a generic template. Every design and architectural decision should support one goal: making NovaSport the trusted digital home of football competitions, from KeMU Super League Season 8 to an expanding ecosystem of future competitions.

Non-negotiable principle: build the reusable NovaSport platform first. KeMU Super League Season 8 is its first competition, not its architectural boundary.