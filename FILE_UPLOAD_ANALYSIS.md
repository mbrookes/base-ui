# FileUpload Component: Competitive Analysis & Enhancement Plan

## Executive Summary

Base UI's FileUpload component is a **headless, unstyled implementation** focused on being a minimal building block rather than a full-featured upload solution. Compared to market leaders (React Dropzone, Uppy, FilePond), it currently covers the **core foundation** but is missing several important features. This document outlines gaps and a phased plan to address them.

---

## Current Implementation Status

### ✅ What We Have
1. **Core file handling**
   - Drag-and-drop support
   - Click-to-select via hidden input
   - File validation (type, size range)
   - Multi-file support
   - Accessibility-first dropzone

2. **State management**
   - File list management with unique IDs
   - Preview URL generation (via `URL.createObjectURL`)
   - File status tracking (idle, uploading, success, error)
   - Progress tracking (0-100)
   - Context-based state sharing

3. **API**
   - Hooks: `useFileUploadContext`, `useFileUploadPreviewItem`
   - Headless components: Root, Dropzone, Input, Trigger, PreviewList, PreviewItem
   - Callbacks: `onFilesChange`, `onFileReject`

4. **Component composition**
   - Flexible, composable architecture
   - Data attributes for styling
   - Full TypeScript support
   - Test coverage for core workflows

### ❌ Missing Features

#### High Priority (Breaking gaps for common use cases)
1. **Paste support** - Users can't paste from clipboard
2. **Folder upload** - Can't select directories recursively
3. **Keyboard accessibility** - Limited keyboard navigation (e.g., Space/Enter to open dialog)
4. **File listing options** - No way to customize which files are shown (e.g., show upload progress)
5. **Error recovery** - No retry mechanism for failed uploads
6. **onCancel callback** - No way to react to user canceling file selection

#### Medium Priority (Nice-to-have, improves UX)
1. **Duplicate detection** - Warning when adding same file twice
2. **Abort signal support** - Cancel in-progress uploads
3. **Multiple input modes** - Ability to create custom triggers beyond button/dropzone
4. **File sorting/reordering** - Drag-to-reorder in preview list
5. **i18n support** - Localized error messages and announcements
6. **Image-specific features** - Thumbnail generation, EXIF stripping

#### Lower Priority (Advanced/specialized)
1. **Chunked uploads** - Split large files for parallel upload
2. **Resumable uploads** - Continue interrupted uploads (requires backend support)
3. **Remote sources** - Load files from Google Drive, Dropbox, URLs
4. **Native upload hooks** - `useFilesFromClick`, `useFilesFromPaste`, etc.
5. **Compression** - Client-side image/file compression
6. **Validation plugins** - Custom validation rule system

---

## Competitive Feature Matrix

| Feature | Base UI | React Dropzone | Uppy | FilePond |
|---------|---------|---|------|----------|
| **Core File Handling** |
| Drag-drop | ✅ | ✅ | ✅ | ✅ |
| Click-select | ✅ | ✅ | ✅ | ✅ |
| Paste support | ❌ | ✅ | ✅ | ✅ |
| Folder upload | ❌ | ✅ | ✅ | ❌ |
| Keyboard control | ⚠️ | ✅ | ✅ | ✅ |
| **Validation** |
| File type | ✅ | ✅ | ✅ | ✅ |
| File size | ✅ | ✅ | ✅ | ✅ |
| File count | ✅ | ✅ | ✅ | ✅ |
| Custom validation | ❌ | ✅ | ✅ | ✅ |
| Duplicate detection | ❌ | ❌ | ✅ | ❌ |
| **Upload Handling** |
| Progress tracking | ✅ | ❌ | ✅ | ✅ |
| Status management | ✅ | ❌ | ✅ | ✅ |
| Error handling | ⚠️ | ❌ | ✅ | ✅ |
| Retry logic | ❌ | ❌ | ✅ | ⚠️ |
| Chunked uploads | ❌ | ❌ | ✅ | ❌ |
| Resumable uploads | ❌ | ❌ | ✅ | ❌ |
| Abort signal support | ❌ | ❌ | ✅ | ❌ |
| **Accessibility** |
| ARIA labels | ✅ | ✅ | ✅ | ✅ |
| Screen reader support | ✅ | ✅ | ✅ | ✅ |
| Keyboard navigation | ⚠️ | ✅ | ✅ | ✅ |
| Live regions | ❌ | ❌ | ✅ | ⚠️ |
| **I18n & UX** |
| Localization | ❌ | ❌ | ✅ (30+ langs) | ⚠️ |
| Error messages | ✅ (English only) | ✅ (English only) | ✅ | ✅ |
| Customizable text | ⚠️ | ⚠️ | ✅ | ✅ |

---

## Detailed Gap Analysis

### 1. **Paste Support** (HIGH PRIORITY)
**Impact**: Users expect to paste images from clipboard
**Complexity**: Medium
**Competitors**: React Dropzone, Uppy, FilePond all support this

**Implementation approach**:
- Add `onPaste` handler to root container
- Check `event.clipboardData.files` and `event.clipboardData.items`
- Filter for file-like items and convert DataTransferItem to File
- Call existing `addFiles()` logic

**Files to modify**: `FileUploadRoot.tsx`, `useFileUploadRoot.ts`

### 2. **Folder Upload** (HIGH PRIORITY)
**Impact**: Users want to select entire directories
**Complexity**: Medium-High
**Competitors**: React Dropzone, Uppy support this

**Implementation approach**:
- Add `webkitdirectory` attribute to hidden input (Chrome/Edge/Safari)
- Add `allowdirs` support where available
- Track folder hierarchy in extended file metadata
- Update validation to handle folder structure

**Files to modify**: `FileUploadInput.tsx`, `FileUploadRoot.tsx`, `useFileUploadRoot.ts`

### 3. **Keyboard Accessibility Gaps** (HIGH PRIORITY)
**Impact**: Keyboard-only users can't access upload UI
**Complexity**: Low
**Competitors**: All support full keyboard navigation

**Implementation approach**:
- FileUploadTrigger: Already a button (inherently keyboard accessible)
- FileUploadDropzone: Add `tabindex` when not disabled, handle Space/Enter
- Add keyboard event handlers to open dialog

**Files to modify**: `FileUploadDropzone.tsx`, `useFileUploadRoot.ts`

### 4. **Retry Mechanism for Failed Uploads** (MEDIUM PRIORITY)
**Impact**: Users can recover from transient failures
**Complexity**: Medium
**Competitors**: Uppy has built-in retry

**Implementation approach**:
- Add `retryCount` and `maxRetries` to ExtendedFile
- Add `retryFile(id: string)` method to context
- Emit `onFileRetry` callback for app to handle
- Reset error state when retry initiated

**Files to modify**: `FileUploadContext.ts`, `FileUploadRoot.tsx`, `useFileUploadRoot.ts`

### 5. **onCancel Callback** (MEDIUM PRIORITY)
**Impact**: Apps need to know when user cancels file selection
**Complexity**: Low
**Competitors**: Uppy, FilePond support this

**Implementation approach**:
- Add `onCancel` prop to FileUploadRoot
- Detect when input's `value` is reset without new files
- Call `onCancel` callback

**Files to modify**: `FileUploadRoot.tsx`, `useFileUploadRoot.ts`

### 6. **Duplicate File Detection** (MEDIUM PRIORITY)
**Impact**: Prevent accidental duplicate uploads
**Complexity**: Low
**Competitors**: Uppy supports this

**Implementation approach**:
- Add `onDuplicateFile` callback to FileUploadRoot
- Compare new files against existing by name + size + lastModified
- Emit callback before adding

**Files to modify**: `useFileUploadRoot.ts`

### 7. **i18n Support** (MEDIUM PRIORITY)
**Impact**: Error messages not localized
**Complexity**: Medium
**Competitors**: Uppy has 30+ languages built-in

**Implementation approach**:
- Create `FileUploadIntl` context or accept `messages` prop
- Support custom message overrides
- Provide default English messages
- Document message API for translations

**Files to modify**: `FileUploadRoot.tsx`, `useFileUploadRoot.ts`, new file: `FileUploadIntl.ts`

### 8. **Live Region Announcements** (LOW-MEDIUM PRIORITY)
**Impact**: Screen reader users don't hear file updates
**Complexity**: Low
**Competitors**: Uppy has this

**Implementation approach**:
- Already have `announcement` state in hook
- Improve announcements: "3 files added", "File failed: file.txt"
- Use `aria-live="polite"` region in Root

**Files to modify**: `useFileUploadRoot.ts`, `FileUploadRoot.tsx`

### 9. **Abort Signal Support** (LOW PRIORITY)
**Impact**: Allow canceling in-progress uploads
**Complexity**: Medium
**Competitors**: Uppy, modern APIs

**Implementation approach**:
- Add `AbortController` to context
- Expose `abortController` in context value
- Document how to use with fetch: `fetch(url, { signal: context.abortController.signal })`

**Files to modify**: `FileUploadContext.ts`, `useFileUploadRoot.ts`

### 10. **Custom Validation** (LOW PRIORITY)
**Impact**: Apps need to validate beyond type/size/count
**Complexity**: Medium
**Competitors**: React Dropzone, Uppy support this

**Implementation approach**:
- Add `validate?: (file: File) => string | null | Promise<string | null>` prop
- Call in `validateFile` function
- Await if Promise returned

**Files to modify**: `useFileUploadRoot.ts`, `FileUploadRoot.tsx`

---

## Phased Enhancement Plan

### Phase 1: Accessibility & Core UX (Weeks 1-2)
**Goal**: Close critical gaps for everyday users

1. **Keyboard navigation**
   - [ ] Make FileUploadDropzone keyboard-accessible
   - [ ] Handle Space/Enter to trigger file dialog
   - [ ] Add `tabindex` and `role` as needed
   - [ ] Test with keyboard-only and screen readers
   - **Commit**: `[file-upload] Add keyboard navigation support`

2. **Paste support**
   - [ ] Implement clipboard paste handling in root
   - [ ] Add test coverage
   - [ ] Handle data transfer edge cases
   - **Commit**: `[file-upload] Add paste support`

3. **Better accessibility announcements**
   - [ ] Improve live region messages
   - [ ] Add aria-live region to root
   - [ ] Test with screen readers
   - **Commit**: `[file-upload] Improve accessibility announcements`

**Test command**: `pnpm test:chromium FileUpload --no-watch`

### Phase 2: User Experience Improvements (Weeks 2-3)
**Goal**: Improve day-to-day usability

1. **Folder upload support**
   - [ ] Add `webkitdirectory` support to input
   - [ ] Track folder structure in file metadata
   - [ ] Add test cases
   - **Commit**: `[file-upload] Add folder upload support`

2. **onCancel callback**
   - [ ] Add prop to FileUploadRoot
   - [ ] Detect cancellation in input change handler
   - [ ] Add tests
   - **Commit**: `[file-upload] Add onCancel callback`

3. **Duplicate file detection**
   - [ ] Implement detection logic
   - [ ] Add `onDuplicateFile` callback
   - [ ] Add tests
   - **Commit**: `[file-upload] Add duplicate file detection`

**Test command**: `pnpm test:jsdom FileUpload --no-watch`

### Phase 3: Developer Experience (Weeks 3-4)
**Goal**: Make it easier to build complex upload UIs

1. **i18n support**
   - [ ] Create message system
   - [ ] Accept `messages` prop on FileUploadRoot
   - [ ] Provide default English messages
   - [ ] Document translation API
   - [ ] Add tests
   - **Commit**: `[file-upload] Add internationalization support`

2. **Abort signal support**
   - [ ] Add `AbortController` to context
   - [ ] Expose in context value
   - [ ] Document usage pattern
   - [ ] Add tests
   - **Commit**: `[file-upload] Add abort signal support for upload cancellation`

3. **Retry mechanism**
   - [ ] Add `retryFile` method to context
   - [ ] Add `onFileRetry` callback
   - [ ] Track retry count in ExtendedFile
   - [ ] Add tests
   - **Commit**: `[file-upload] Add file retry mechanism`

### Phase 4: Advanced Features (Weeks 4-5)
**Goal**: Support power users and complex scenarios

1. **Custom validation**
   - [ ] Add `validate` prop callback
   - [ ] Support async validation
   - [ ] Integrate with existing validation
   - [ ] Add tests
   - **Commit**: `[file-upload] Add custom validation support`

2. **File reordering** (optional)
   - [ ] Add drag-to-reorder in PreviewList
   - [ ] Update file order in state
   - [ ] Add tests
   - **Commit**: `[file-upload] Add file reordering in preview list`

---

## Implementation Notes

### Testing Strategy
- **JSDOM tests** (Phase 2-3): File logic, state management, callbacks
- **Chromium tests** (Phase 1, 4): Keyboard nav, drag-drop, visual interactions
- **Accessibility tests** (Phase 1): Screen reader compatibility, keyboard
- **Integration tests**: Full workflows with multiple features

### Backwards Compatibility
- All changes are additive (new props, optional features)
- Existing API remains unchanged
- No breaking changes to context or components

### Performance Considerations
- Clipboard paste: Check `event.clipboardData` eagerly to avoid holding clipboard
- Duplicate detection: Compare by `name + size + lastModified` (O(n) per file)
- i18n: Messages object passed as prop (no dynamic imports)

### Documentation Updates
- Update component demo to show new features
- Add code examples for each new feature
- Update API docs via `pnpm docs:api`

---

## Priority Ranking

**Must Have** (Blocks common use cases):
1. Paste support
2. Folder upload
3. Keyboard navigation
4. Better accessibility announcements

**Should Have** (Improves UX):
5. onCancel callback
6. Duplicate detection
7. i18n support

**Nice to Have** (Power users):
8. Abort signal support
9. Retry mechanism
10. Custom validation
11. File reordering

---

## Next Steps

1. Review this analysis with the team
2. Prioritize based on user feedback
3. Start Phase 1 implementation
4. Test in browser environment (`pnpm test:chromium`)
5. Update documentation and generate API docs

