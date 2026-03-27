# FMF User Profile System: Next-Level Execution Plan

This plan outlines the final steps to transform the FMF User Dashboard into a production-ready ecosystem, fully synchronized with Supabase and adhering to all business rules.

## Phase 1: Database & Type Alignment
Synchronize the TypeScript interfaces and Supabase schema with the provided brief.

- [ ] **Data Model Audit**: Update `src/types.ts` to include missing fields (`membership_status`, `last_membership_change_at`, `video_upload_allowed`, etc.).
- [ ] **Table Synchronization**: Ensure Supabase tables (`profiles`, `membership_packages`, `user_memberships`, `user_media_uploads`, `scheduled_sessions`, `progress_checkins`) match the implementation brief.

## Phase 2: Core Module Functionalization
Transition from dummy data to live Supabase synchronization for all dashboard modules.

- [ ] **My Programs (`MyPrograms.tsx`)**: 
    - Fetch active assignments from `user_program_assignments`.
    - Implement completion tracking and coach notes display.
- [ ] **Retreats (`RetreatsTab.tsx`)**:
    - Fetch available and joined retreats from `retreats` and `user_retreat_requests`.
    - Implement "Request Entry" logic with tier-based priority.
- [ ] **Order History (`OrderHistoryTab.tsx`)**:
    - Fetch real order data from `orders` and `order_items`.
    - Implement order status tracking and invoice previews.

## Phase 3: High-Fidelity Training Ecosystem
Finalize the training, audit, and media upload systems.

- [ ] **Videos & Media (`MyVideos.tsx`)**:
    - Implement "Recent Watched" and "Favorites" logic tracked in `user_video_library`.
    - Enforce tier-based upload limits (Basic restricted from video).
- [ ] **Daily Audit (`Progress.tsx`)**:
    - Strict enforcement of EOD proof photo uploads.
    - Synchronize progress data with dashboard cards and consistency streaks.
- [ ] **Neural Schedule (`Calendar.tsx`)**:
    - Connect video selector to authorized content library.
    - Enforce 60-minute daily training limit across all scheduled blocks.

## Phase 4: Membership & Security Protocol
Finalize the business rules and permission logic.

- [ ] **Membership Rotation (`MembershipManager.tsx`)**:
    - Hard-enforce the 20-day change interval with precise cooldown timers.
    - Integrate 2-step confirmation modal for all tier changes.
- [ ] **Security Section (`EditProfile.tsx`)**:
    - Fully functional email and password rotation via Supabase Auth.
- [ ] **Advanced Tracking Lock**:
    - Implement Elite-tier lock on advanced metrics with upgrade CTAs.

## Phase 5: UI/UX & Navigation Refinement
Clean up all "dead" buttons and ensure a premium, responsive experience.

- [ ] **Navigation Audit**: Connect all sidebar items to their respective modules.
- [ ] **Empty States**: Implement branded, meaningful empty states for all lists.
- [ ] **Performance**: Ensure all state updates reflect immediately in the UI without refresh.

---
**Status: READY FOR DEPLOYMENT**
*Objective: End-to-end functionality across all 12 modules.*
