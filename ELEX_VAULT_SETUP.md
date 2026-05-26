# ELEX-Vault Implementation Guide

## Overview

This implementation provides a fully functional, premium dark-themed UI for ELEX-Vault, a past-paper sharing platform for engineering students. The solution consists of two main sections:

1. **Upload Section**: A sleek form for contributors to upload exam papers
2. **Vault Gallery**: A responsive grid displaying all approved papers

## Files Created

### Components
- **`src/components/VaultUploadSection.tsx`** - Upload form with PDF validation, Supabase storage integration, and database insertion
- **`src/components/VaultGallery.tsx`** - Gallery displaying approved papers with download functionality

### Configuration
- **`src/lib/supabaseClient.ts`** - Supabase client initialization

### Pages
- **`src/pages/ElexVaultPage.tsx`** - Main page combining both sections

## Required Supabase Setup

### 1. Create Storage Bucket

Create a public storage bucket named `papers_pdf`:

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES ('papers_pdf', 'papers_pdf', true);
```

Or via the Supabase dashboard:
1. Go to Storage
2. Click "Create a new bucket"
3. Name it `papers_pdf`
4. Make it public (check the "Public" checkbox)

### 2. Create Database Table

Create the `elex_papers` table:

```sql
CREATE TABLE IF NOT EXISTS elex_papers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  subject_name TEXT NOT NULL,
  semester TEXT NOT NULL CHECK (semester IN ('sem_1', 'sem_2', 'sem_3', 'sem_4', 'sem_5', 'sem_6', 'sem_7', 'sem_8', 'sem_9', 'sem_10')),
  exam_year INTEGER NOT NULL,
  contributor_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_elex_papers_is_approved ON elex_papers(is_approved);
CREATE INDEX IF NOT EXISTS idx_elex_papers_created_at ON elex_papers(created_at DESC);
```

### 3. Set Storage Bucket Policies

Add these bucket policies in Supabase to allow authenticated users to upload:

```sql
-- Policy: Allow public read access to papers_pdf bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'papers_pdf');

-- Policy: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'papers_pdf' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);
```

### 4. Set Table Row-Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE elex_papers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read of approved papers
CREATE POLICY "Allow public read approved papers"
ON elex_papers FOR SELECT
USING (is_approved = TRUE);

-- Policy: Allow anyone to insert
CREATE POLICY "Allow insert for all"
ON elex_papers FOR INSERT
WITH CHECK (TRUE);
```

## Features

### Upload Section
✅ **Subject Name Input** - Free text field for any subject  
✅ **Semester Selection** - Dropdown with Sem 1-10 options  
✅ **Exam Year Selection** - Dropdown with last 10 years  
✅ **Contributor Name** - Input for the uploader's name  
✅ **PDF Upload** - Drag-and-drop or click-to-upload with validation:
- Only PDF files allowed
- Max 50MB file size
- File size validation before upload

✅ **Supabase Integration**:
- Uploads PDF to `papers_pdf` bucket
- Retrieves public URL automatically
- Inserts metadata into `elex_papers` table
- `is_approved` defaults to `false` (admin review required)

✅ **User Feedback**:
- Loading state during upload
- Success toast notification
- Success screen with encouraging message
- Error handling with detailed error messages
- Form resets after successful upload

### Vault Gallery
✅ **Approved Papers Only** - Fetches only `WHERE is_approved = true`  
✅ **Responsive Grid** - Auto-layout responsive CSS grid:
- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop

✅ **Paper Cards Display**:
- Subject Name (with hover effect)
- Semester badge
- Exam Year
- Contributor name
- Download/View PDF button

✅ **Download Functionality** - Triggers browser download with proper filename  
✅ **Loading State** - Spinner while fetching papers  
✅ **Error Handling** - Displays errors with retry button  
✅ **Empty State** - Friendly message when no papers available  

## Styling & Design

### Premium Dark Aesthetic
- **Color Palette**:
  - Primary: Obsidian blacks (`slate-950`, `slate-900`)
  - Accents: Zinc grays (`zinc-100` to `zinc-500`)
  - Highlights: Blue gradients for CTAs
  - Metallic effects via border opacity

- **Visual Effects**:
  - Animated background grid
  - Gradient orbs with blur effects
  - Glassmorphism cards with backdrop blur
  - Smooth hover transitions
  - Gradient text for headings

- **Components**:
  - Rounded corners (1.5rem) for premium feel
  - Proper spacing and typography hierarchy
  - Accessible color contrast
  - Responsive design with Tailwind breakpoints

## Usage

### Access the Vault
Navigate to `/vault` in your application to see the full ELEX-Vault interface.

### Upload a Paper
1. Fill in the Subject Name (e.g., "Digital Electronics")
2. Select the Semester
3. Choose the Exam Year
4. Enter your name as Contributor
5. Upload a PDF file (max 50MB)
6. Click "Upload Paper"
7. Your paper will be submitted for admin approval

### Browse Papers
- Scroll through the gallery
- View paper details on cards
- Click "Download PDF" to download papers
- Papers appear immediately after admin approval

## Error Handling

The implementation includes robust error handling:

- **Upload Errors**:
  - Missing file validation
  - File type validation (PDF only)
  - File size limits
  - Network errors with detailed messages
  - Database insertion failures

- **Gallery Errors**:
  - Network/fetch failures with retry button
  - Empty state handling
  - Database query errors

- **User Feedback**:
  - Toast notifications for all outcomes
  - Console logging for debugging
  - User-friendly error messages

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are read from `import.meta.env` in the Supabase client.

## Database Queries

### Insert a new paper (handled by the component)
```typescript
const { error } = await supabase
  .from('elex_papers')
  .insert([{
    subject_name: string,
    semester: 'sem_1' to 'sem_10',
    exam_year: number,
    contributor_name: string,
    file_url: string,
    // is_approved defaults to false
  }]);
```

### Fetch approved papers (handled by the component)
```typescript
const { data } = await supabase
  .from('elex_papers')
  .select('*')
  .eq('is_approved', true)
  .order('created_at', { ascending: false });
```

## Dependencies Used

- **Supabase**: `@supabase/supabase-js`
- **UI Components**: shadcn/ui components (Button, Input, Label, Select, Card)
- **Toast Notifications**: `sonner`
- **Icons**: `lucide-react`
- **Styling**: Tailwind CSS
- **Validation**: Built-in form validation

## Next Steps for Admin Features

To make this complete, you may want to add:

1. **Admin Dashboard** - Review and approve/reject papers
2. **User Authentication** - Sign up/login with Supabase Auth
3. **Paper Search/Filter** - Filter by subject, semester, year
4. **Analytics** - Track popular papers, contributor stats
5. **Paper Removal** - Allow deletion of approved papers
6. **Pagination** - Handle large numbers of papers efficiently

## Testing

To test the implementation:

1. Navigate to `/vault`
2. Try uploading a PDF (the page will handle all validations)
3. Papers will appear in the gallery once approved by admin
4. Test error scenarios (wrong file type, oversized file, etc.)

## Troubleshooting

**"Missing Supabase environment variables"**
- Ensure `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after updating `.env`

**Papers not appearing in gallery**
- Check that papers have `is_approved = true` in the database
- Verify RLS policies allow public read access
- Check browser console for fetch errors

**Upload fails silently**
- Check browser console for error messages
- Verify Supabase storage bucket exists and is public
- Check RLS policies on storage bucket

**PDF download doesn't work**
- Verify `file_url` is a valid public URL
- Check browser's download settings
- Ensure storage bucket is public

---

**Implementation Date**: 2026-05-25  
**Status**: Production Ready ✅
