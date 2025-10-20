# Punktual Blog Templates & Agent Guide

This document explains how every Punktual blog post must be authored and published through Strapi. Hand it directly to automation agents or writers so the output always passes our lifecycle validators and renders correctly on the site.

---

## 1. Posting via Strapi API

All posts are created with:

- `POST /api/posts` (create) or `PUT /api/posts/{documentId}` (update)
- Headers:  
  `Authorization: Bearer <STRAPI_API_TOKEN>`  
  `Content-Type: application/json`
- **template** field is required (see enum below).
- `publishedAt` (ISO 8601) controls whether the post is live.

**Example payload**

```jsonc
{
  "data": {
    "title": "How to Integrate Punktual with Your Next Email Campaign",
    "slug": "how-to-integrate-punktual-email-campaign",
    "template": "integration-guide",
    "excerpt": "Map Punktual calendar links into your ESP, QA the flows, and ship with confidence.",
    "content": "## TL;DR\n- …\n\n## Prerequisites\n- …\n\n## Integration Steps\n### Step 1 …\n### Step 2 …\n\n## Testing & QA\n- …\n\n## Security Notes\n- …\n\n## FAQs\n1. **…?**\n   Answer…\n",
    "publishedAt": "2025-10-20T09:00:00.000Z",
    "category": { "connect": [{ "slug": "integration" }] },
    "tags": { "connect": [{ "slug": "email" }, { "slug": "automation" }] },
    "seo": {
      "metaTitle": "Integrate Punktual with Email Campaigns",
      "metaDescription": "Step-by-step instructions for adding Punktual calendar links into major ESPs.",
      "canonicalUrl": "https://punktual.co/blog/how-to-integrate-punktual-email-campaign",
      "keywords": ["punktual", "email", "add to calendar"]
    },
    "faqs": [
      {
        "question": "Which ESPs are covered?",
        "answer": "Any ESP that supports custom HTML blocks, including X, Y, and Z."
      }
    ]
  }
}
```

---

## 2. Template Enumeration

The `template` field accepts one of:

| Value | Purpose |
| ----- | ------- |
| `session-log` | Shipping logs similar to the current “Session Log #…” posts. |
| `playbook` | Step-by-step guides and best-practice checklists. |
| `integration-guide` | Technical integrations, code/config heavy content. |
| `campaign-strategy` | Channel planning, timelines, sequencing campaigns. |
| `comparison` | Option trade-offs, decision frameworks, ROI discussions. |
| `case-study` | Results stories from anonymised customer archetypes. |

Posts missing or using an invalid template will be rejected.

---

## 3. Heading & Structure Requirements

All templates must include a `## TL;DR` section with at least one `- bullet`, and the first bullet **must match** the `excerpt`.

Additional required headings:

### `session-log`
```
## TL;DR
## Deep Dive
## What Worked
## What Broke
```

### `playbook`
```
## TL;DR
## Context
## Step-by-step    (requires ≥2 “### Step …” subsections)
## Best Practices
## Common Pitfalls
```

### `integration-guide`
```
## TL;DR
## Prerequisites
## Integration Steps   (requires ≥2 “### Step …” subsections)
## Testing & QA
## Security Notes
```

### `campaign-strategy`
```
## TL;DR
## Audience & Goals
## Channel Mix
## Timeline          (requires ≥3 milestones: “### T-30 …”, etc.)
## Measurement
```

### `comparison`
```
## TL;DR
## Scenario Overview
## Option 1: …      (requires ≥2 “## Option …” sections)
## Option 2: …
## Decision Criteria
## Recommendation
```

### `case-study`
```
## TL;DR
## Company Snapshot
## Challenge
## Solution
## Results          (requires ≥2 bullet points)
## Lessons Learned
```

If FAQs are provided (via the `faqs` repeatable component), the markdown **must** include a `## FAQs` section with numbered questions and answers.

---

## 4. Front-end Rendering Notes

- Session Logs still use the bespoke layout with Highlights and FAQ cards.
- Other templates currently share a simplified layout (hero + TL;DR + article body). Highlights/FAQs render together in the body if present.
- Related posts filter by matching `template`.
- JSON-LD schema (Article + optional FAQPage) is generated automatically.

---

## 5. Agent Checklist Before Publishing

1. Choose the correct template for the topic (see section 6 below).
2. Produce metadata (title, slug, excerpt, canonical URL, keywords).
3. Populate the Markdown body using the required headings above.
4. Ensure the first TL;DR bullet matches the excerpt text exactly.
5. Include `## FAQs` only when the payload contains FAQ entries.
6. POST the payload to Strapi; handle any 400 errors by fixing headings/bullets.
7. Optionally revalidate the frontend if publishing outside normal deploys.

---

## 6. Topic ↔ Template Mapping

| Idea # | Suggested Template |
| ------ | ------------------ |
| 1 | playbook |
| 2 | integration-guide |
| 3 | campaign-strategy |
| 4 | integration-guide |
| 5 | playbook |
| 6 | integration-guide (or playbook for non-technical version) |
| 7 | campaign-strategy |
| 8 | comparison |
| 9 | case-study |
|10 | integration-guide |
|11 | integration-guide |
|12 | playbook |
|13 | campaign-strategy |
|14 | case-study |
|15 | campaign-strategy |
|16 | comparison |
|17 | playbook |
|18 | case-study |
|19 | playbook |
|20 | campaign-strategy |
|21 | comparison |
|22 | integration-guide |
|23 | comparison |
|24 | playbook |
|25 | campaign-strategy |

Use this table to brief the writing agent so it selects the correct template automatically.

---

## 7. Error Messages (for reference)

- “Missing required section(s): …” → add the headings listed for that template.
- “TL;DR section requires at least one bullet” → add `- bullet` lines.
- “Excerpt must match the first TL;DR bullet exactly” → sync the excerpt and TL;DR.
- “Integration guides require at least two “### Step …” subsections” → add steps.
- “Timeline must include at least three milestone subsections” → add `### T-…` headings.
- “Results section should list at least two bullet points” → add outcome bullets.
- “Include a “## FAQs” section…” → add the heading if the payload contains FAQs.

Fix the content and retry the API call whenever a validation error appears.

---

This guide stays in step with the Strapi schema and lifecycle rules in the repo. Update both the code and this document together whenever you refine a template.
