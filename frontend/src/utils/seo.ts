/**
 * SEO Utility — Dynamic page title and meta description updater.
 * Updates document.title and meta[name="description"] for each view.
 */

interface PageMeta {
  title: string;
  description: string;
}

const PAGE_META: Record<string, PageMeta> = {
  hero: {
    title: 'FairMatch AI — Job-Specific Resume Analysis & Career Improvement',
    description: 'FairMatch AI analyzes your resume against specific job requirements to identify strengths, missing evidence, and actionable improvements — without ranking or arbitrary scoring.'
  },
  dashboard: {
    title: 'Resume Analysis Dashboard — FairMatch AI',
    description: 'Upload your resume and job description to receive evidence-based job-fit analysis, requirement matching, and transparent improvement recommendations.'
  },
  about: {
    title: 'Platform Details & Architecture — FairMatch AI',
    description: 'Learn how FairMatch AI works: evidence-based job analysis, 24+ industry benchmarks, semantic skill matching, and zero demographic bias.'
  },
  privacy: {
    title: 'Privacy Policy — FairMatch AI',
    description: 'Read about how FairMatch AI handles your data, processes resumes, and protects your privacy during job-fit analysis.'
  },
  terms: {
    title: 'Terms of Service — FairMatch AI',
    description: 'Terms and conditions governing use of the FairMatch AI resume analysis platform, including AI content disclaimers.'
  },
  'explore-jobs': {
    title: 'Explore Global Jobs & Occupations — FairMatch AI',
    description: 'Browse thousands of global job profiles and occupations across industries. Select a role and analyze your resume against its exact requirements.'
  },
  '404': {
    title: 'Page Not Found — FairMatch AI',
    description: 'The page you requested could not be found. Return to the FairMatch AI homepage to continue.'
  }
};

export function updatePageMeta(view: string): void {
  const meta = PAGE_META[view] || PAGE_META['hero'];

  document.title = meta.title;

  let descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (descTag) {
    descTag.setAttribute('content', meta.description);
  } else {
    descTag = document.createElement('meta');
    descTag.name = 'description';
    descTag.content = meta.description;
    document.head.appendChild(descTag);
  }

  // Update OG tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', meta.title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', meta.description);
}
